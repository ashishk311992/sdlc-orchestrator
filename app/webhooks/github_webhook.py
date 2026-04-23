"""Two entry points:

1. `POST /webhooks/github` - raw GitHub webhook (workflow_run, pull_request).
   Used for approve-and-merge when CI is green.

2. `POST /webhooks/github/ci-report` - callback from our own GitHub Actions
   workflow (authenticated with a shared bearer token). Carries success/failure
   + truncated logs, and triggers the healer on failure.
"""
from __future__ import annotations
from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel, Field
from app.config import get_settings
from app.integrations.github_client import GitHubClient
from app.integrations.linear_client import LinearClient
from app.logging_config import get_logger
from app.models import RunStatus
from app.orchestrator.queue import enqueue_run
from app.orchestrator.state import load_run, record_event, update_run
from app.security import verify_bearer, verify_github_signature
from sqlalchemy import select
from app.db import session_scope
from app.models import Run

router = APIRouter(prefix="/webhooks/github", tags=["webhooks"])
log = get_logger(__name__)


class CIReport(BaseModel):
    run_id: str = Field(..., description="Our internal run id (branch suffix)")
    conclusion: str = Field(..., description="success | failure | cancelled | timed_out")
    workflow_run_id: int | None = None
    logs: str = ""
    test_command: str | None = None


@router.post("/ci-report")
async def ci_report(
    body: CIReport,
    authorization: str | None = Header(default=None),
):
    settings = get_settings()
    if not verify_bearer(settings.platform_callback_token, authorization):
        raise HTTPException(status_code=401, detail="invalid token")

    run = load_run(body.run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="unknown run")

    record_event(run.id, stage="ci", message=f"ci {body.conclusion}",
                 payload={"workflow_run_id": body.workflow_run_id})

    gh = GitHubClient()
    linear = LinearClient()
    try:
        if body.conclusion == "success":
            update_run(run.id, status=RunStatus.DONE)
            if run.pr_number:
                gh.comment_pr(run.pr_number, "CI green. Autonomous pipeline complete.")
                # Flip PR to ready-for-review
                try:
                    gh.update_pr(run.pr_number, body=None)
                except Exception:
                    pass
            linear.add_comment(run.issue_id, "CI passed. PR is ready for human merge.")
            return {"status": "done"}

        # failure path -> heal
        if run.heal_attempts >= settings.max_heal_attempts:
            update_run(run.id, status=RunStatus.BLOCKED)
            linear.mark_blocked(run.issue_id)
            linear.add_comment(run.issue_id,
                               f"CI failed and max heal attempts ({settings.max_heal_attempts}) reached. Needs human.")
            if run.pr_number:
                gh.comment_pr(run.pr_number, "Max self-heal attempts reached. Blocking for human review.")
            return {"status": "blocked"}

        new_ctx = {**run.context, "last_ci_logs": (body.logs or "")[-30_000:]}
        update_run(run.id, status=RunStatus.HEAL,
                   heal_attempts=run.heal_attempts + 1, context=new_ctx)
        job_id = enqueue_run(run.id)
        if run.pr_number:
            gh.comment_pr(run.pr_number,
                          f"CI failed. Kicking off self-heal attempt {run.heal_attempts + 1}/{settings.max_heal_attempts}.")
        return {"status": "healing", "job_id": job_id}
    finally:
        gh.close()
        linear.close()


@router.post("")
async def handle_github(
    request: Request,
    x_hub_signature_256: str | None = Header(default=None),
    x_github_event: str | None = Header(default=None),
):
    settings = get_settings()
    raw = await request.body()
    if not verify_github_signature(settings.github_webhook_secret, raw, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="invalid signature")
    payload = await request.json()

    if x_github_event == "workflow_run":
        return await _handle_workflow_run(payload)
    log.info("github.ignored", event=x_github_event)
    return {"status": "ignored"}


async def _handle_workflow_run(payload: dict) -> dict:
    wr = payload.get("workflow_run") or {}
    if payload.get("action") != "completed":
        return {"status": "ignored"}
    head_branch = wr.get("head_branch") or ""
    conclusion = wr.get("conclusion") or "unknown"

    # map branch back to run
    with session_scope() as s:
        run = s.scalar(select(Run).where(Run.branch == head_branch).order_by(Run.created_at.desc()))
        if run is None:
            return {"status": "no-run"}
        s.expunge(run)

    record_event(run.id, stage="ci", message=f"workflow_run completed: {conclusion}",
                 payload={"run_id": wr.get("id"), "url": wr.get("html_url")})

    # Our ai-ci.yml is the source of truth via /ci-report; this handler is a
    # belt-and-suspenders for visibility only.
    log.info("github.workflow_run", run_id=run.id, conclusion=conclusion)
    return {"status": "observed"}
