"""Run sequencer: drives a Run through the state machine.

States: INTAKE -> DEV -> QA -> REVIEW -> CI -> (HEAL -> CI)* -> DONE | BLOCKED

Each stage is reentrant: the orchestrator can be re-invoked with the same run_id
(e.g. after a CI callback) and will resume from the persisted status.
"""
from __future__ import annotations
from app.agents.base import AgentContext
from app.agents.dev_agent import DevAgent
from app.agents.qa_agent import QAAgent
from app.agents.reviewer_agent import ReviewerAgent
from app.config import get_settings
from app.integrations.git_workspace import GitWorkspace
from app.integrations.github_client import GitHubClient
from app.integrations.linear_client import LinearClient
from app.logging_config import get_logger
from app.models import RunStatus
from app.orchestrator.state import load_run, update_run, record_event

log = get_logger(__name__)


def _branch_for(identifier: str, run_id: str) -> str:
    safe = identifier.lower().replace(" ", "-")
    return f"ai/{safe}-{run_id[:8]}"


def execute_run(run_id: str) -> None:
    """Entry point for RQ. Safe to call repeatedly."""
    settings = get_settings()
    run = load_run(run_id)
    if run is None:
        log.error("run.not_found", run_id=run_id)
        return

    log.info("run.execute", run_id=run_id, status=run.status)

    if run.status in (RunStatus.DONE, RunStatus.BLOCKED, RunStatus.FAILED):
        log.info("run.terminal", run_id=run_id, status=run.status)
        return

    gh = GitHubClient()
    linear = LinearClient()
    try:
        if run.status == RunStatus.INTAKE:
            _run_dev_qa_review(run_id, gh, linear)
        elif run.status == RunStatus.CI:
            # re-entrant: CI callback already updated context; nothing to do until failure
            log.info("run.waiting_ci", run_id=run_id)
        elif run.status == RunStatus.HEAL:
            if run.heal_attempts > settings.max_heal_attempts:
                _block(run_id, linear, gh, reason="max heal attempts exceeded")
                return
            _run_heal(run_id, gh, linear)
        else:
            # DEV/QA/REVIEW are transient and always complete within one call today
            _run_dev_qa_review(run_id, gh, linear)
    except Exception as exc:  # pragma: no cover - top level safety net
        log.exception("run.unhandled", run_id=run_id)
        record_event(run_id, stage="orchestrator", level="error", message=str(exc))
        update_run(run_id, status=RunStatus.FAILED)
        try:
            run = load_run(run_id)
            if run and run.issue_id:
                linear.add_comment(run.issue_id, f"Autonomous run failed: `{exc}`")
        except Exception:
            pass
    finally:
        gh.close()
        linear.close()


# --------------------------------------------------------------------------- #
# main path
# --------------------------------------------------------------------------- #

def _run_dev_qa_review(run_id: str, gh: GitHubClient, linear: LinearClient) -> None:
    settings = get_settings()
    run = load_run(run_id)
    assert run is not None

    branch = run.branch or _branch_for(run.issue_identifier, run_id)
    update_run(run_id, status=RunStatus.DEV, branch=branch)
    record_event(run_id, stage="dev", message="starting dev stage")

    with GitWorkspace(
        repo_full_name=settings.github_repo,
        branch=branch,
        base_branch=settings.github_default_branch,
    ) as ws:
        snapshot = ws.snapshot()

        # --- Dev ---------------------------------------------------------
        dev_ctx = AgentContext(
            run_id=run_id,
            issue_identifier=run.issue_identifier,
            title=run.title,
            description=run.description,
            repo=settings.github_repo,
            branch=branch,
            base_branch=settings.github_default_branch,
            repo_snapshot=snapshot,
        )
        dev_result = DevAgent().run(dev_ctx)
        if not dev_result.patches:
            _block(run_id, linear, gh, reason="Dev Agent produced no patches")
            return
        ws.apply_patches(dev_result.patches)
        dev_sha = ws.commit_and_push(dev_result.commit_message)
        record_event(run_id, stage="dev", message="committed dev changes",
                     payload={"sha": dev_sha, "files": [p.path for p in dev_result.patches]})

        # --- PR (open or update) ----------------------------------------
        pr = gh.find_open_pr_for_branch(branch)
        pr_body = _render_pr_body(run.issue_identifier, run.title, dev_result.summary)
        if pr is None:
            pr = gh.open_pr(
                head=branch,
                base=settings.github_default_branch,
                title=f"[{run.issue_identifier}] {run.title}",
                body=pr_body,
                draft=True,
            )
        else:
            gh.update_pr(pr["number"], body=pr_body)
        pr_number = pr["number"]
        update_run(run_id, pr_number=pr_number)

        # --- QA ----------------------------------------------------------
        update_run(run_id, status=RunStatus.QA)
        diff = ws.diff_against_base()
        qa_ctx = AgentContext(
            run_id=run_id,
            issue_identifier=run.issue_identifier,
            title=run.title,
            description=run.description,
            repo=settings.github_repo,
            branch=branch,
            base_branch=settings.github_default_branch,
            repo_snapshot=ws.snapshot(),
            pr_number=pr_number,
            pr_diff=diff,
        )
        qa_result = QAAgent().run(qa_ctx)
        if qa_result.patches:
            ws.apply_patches(qa_result.patches)
            qa_sha = ws.commit_and_push(f"test: {qa_result.summary or 'add automated tests'}")
            record_event(run_id, stage="qa", message="committed tests",
                         payload={"sha": qa_sha, "test_command": qa_result.test_command,
                                  "files": [p.path for p in qa_result.patches]})
        update_run(run_id, context={**run.context, "test_command": qa_result.test_command})

        # --- Reviewer ----------------------------------------------------
        update_run(run_id, status=RunStatus.REVIEW)
        final_diff = ws.diff_against_base()
        rev_ctx = AgentContext(
            run_id=run_id,
            issue_identifier=run.issue_identifier,
            title=run.title,
            description=run.description,
            repo=settings.github_repo,
            branch=branch,
            base_branch=settings.github_default_branch,
            pr_number=pr_number,
            pr_diff=final_diff,
        )
        review = ReviewerAgent().run(rev_ctx)
        body = _render_review_body(review.summary, review.comments)
        event = "APPROVE" if review.verdict == "approve" else "COMMENT"
        gh.submit_review(pr_number, event=event, body=body)
        record_event(run_id, stage="review", message=review.verdict,
                     payload={"comments": review.comments})

    # --- CI: mark and notify Linear ---------------------------------------
    update_run(run_id, status=RunStatus.CI)
    pr_url = f"https://github.com/{settings.github_repo}/pull/{pr_number}"
    linear.mark_in_review(run.issue_id)
    linear.add_comment(
        run.issue_id,
        f"Autonomous run opened PR {pr_url}\n\n"
        f"Dev: {dev_result.summary}\nQA: {qa_result.summary}\nReview: {review.verdict} - {review.summary}",
    )


# --------------------------------------------------------------------------- #
# self-heal path
# --------------------------------------------------------------------------- #

def _run_heal(run_id: str, gh: GitHubClient, linear: LinearClient) -> None:
    settings = get_settings()
    run = load_run(run_id)
    assert run is not None
    assert run.branch is not None

    attempt = run.heal_attempts
    record_event(run_id, stage="heal", message=f"starting heal attempt {attempt}")

    ci_logs = run.context.get("last_ci_logs", "")
    with GitWorkspace(
        repo_full_name=settings.github_repo,
        branch=run.branch,
        base_branch=settings.github_default_branch,
    ) as ws:
        ctx = AgentContext(
            run_id=run_id,
            issue_identifier=run.issue_identifier,
            title=run.title,
            description=run.description,
            repo=settings.github_repo,
            branch=run.branch,
            base_branch=settings.github_default_branch,
            repo_snapshot=ws.snapshot(),
            pr_number=run.pr_number,
            pr_diff=ws.diff_against_base(),
            ci_logs=ci_logs,
            heal_attempt=attempt,
        )
        result = DevAgent().run(ctx)
        if not result.patches:
            _block(run_id, linear, gh, reason=f"Healer produced no patches (attempt {attempt})")
            return
        ws.apply_patches(result.patches)
        sha = ws.commit_and_push(f"fix: {result.summary or 'automated CI fix'}")
        record_event(run_id, stage="heal", message="committed heal patch",
                     payload={"sha": sha, "files": [p.path for p in result.patches]})

    update_run(run_id, status=RunStatus.CI)
    if run.pr_number:
        gh.comment_pr(run.pr_number,
                      f"Self-heal attempt {attempt}: {result.summary}")


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #

def _block(run_id: str, linear: LinearClient, gh: GitHubClient, *, reason: str) -> None:
    update_run(run_id, status=RunStatus.BLOCKED)
    record_event(run_id, stage="orchestrator", level="warn", message=f"blocked: {reason}")
    run = load_run(run_id)
    if run is None:
        return
    try:
        linear.mark_blocked(run.issue_id)
        linear.add_comment(run.issue_id, f"Autonomous run blocked: {reason}. Human intervention required.")
    except Exception:
        log.exception("block.linear_comment_failed")
    if run.pr_number:
        try:
            gh.comment_pr(run.pr_number, f"Autonomous pipeline blocked: {reason}")
        except Exception:
            log.exception("block.pr_comment_failed")


def _render_pr_body(identifier: str, title: str, summary: str) -> str:
    return (
        f"## Autonomous PR\n\n"
        f"Linear issue: **{identifier}** - {title}\n\n"
        f"### Dev summary\n{summary}\n\n"
        f"---\n"
        f"_This PR was produced by the Autonomous SDLC Platform. Tests, review, and "
        f"self-healing commits are applied automatically._"
    )


def _render_review_body(summary: str, comments: list[str]) -> str:
    lines = ["## Reviewer Agent", "", summary or "(no summary)"]
    if comments:
        lines.append("")
        lines.append("### Comments")
        for c in comments:
            lines.append(f"- {c}")
    return "\n".join(lines)
