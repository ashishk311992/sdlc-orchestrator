"""Dev Agent: Linear issue + repo snapshot -> file patches."""
from __future__ import annotations
import json
from app.agents.base import AgentContext, DevResult, FilePatch
from app.agents.llm_client import LLMClient
from app.logging_config import get_logger

log = get_logger(__name__)


SYSTEM_PROMPT = """You are a Senior Software Engineer acting as an autonomous Dev Agent.

Responsibilities:
- Read the issue and the provided repository snapshot.
- Produce the smallest correct set of file edits that implements the issue.
- Follow existing code style and conventions visible in the snapshot.
- Never invent files unrelated to the task.
- Do NOT write tests; a separate QA Agent will do that.

Output contract (strict):
Return ONLY a JSON object matching:
{
  "summary": "<1-3 sentence change description>",
  "commit_message": "<imperative, <=72 char subject; optional body after blank line>",
  "patches": [
    {"path": "relative/path.ext", "action": "upsert", "content": "<FULL new file contents>"},
    {"path": "relative/gone.ext", "action": "delete", "content": ""}
  ]
}
No markdown fences, no prose outside JSON."""


HEAL_SYSTEM_PROMPT = SYSTEM_PROMPT + """

You are now in SELF-HEAL mode. CI failed on your previous PR.
Analyze the failing CI logs, identify the root cause, and emit a minimal patch
that makes the tests pass without changing intended behavior."""


class DevAgent:
    name = "dev"

    def __init__(self, llm: LLMClient | None = None) -> None:
        self._llm = llm or LLMClient()

    def run(self, ctx: AgentContext) -> DevResult:
        system = HEAL_SYSTEM_PROMPT if ctx.heal_attempt > 0 else SYSTEM_PROMPT
        user = _build_user_prompt(ctx)
        log.info("dev_agent.invoke", run_id=ctx.run_id, heal_attempt=ctx.heal_attempt)
        data = self._llm.complete_json(system=system, user=user, temperature=0.1)
        return _parse(data)


def _build_user_prompt(ctx: AgentContext) -> str:
    snapshot = _render_snapshot(ctx.repo_snapshot, max_chars=60_000)
    blocks = [
        f"# Issue {ctx.issue_identifier}",
        f"Title: {ctx.title}",
        "",
        "## Description",
        ctx.description or "(no description)",
        "",
        f"## Repo ({ctx.repo}) snapshot",
        snapshot,
    ]
    if ctx.heal_attempt > 0 and ctx.ci_logs:
        blocks += [
            "",
            f"## CI failure logs (attempt {ctx.heal_attempt})",
            "```",
            ctx.ci_logs[-20_000:],
            "```",
        ]
    if ctx.pr_diff:
        blocks += ["", "## Current PR diff", "```diff", ctx.pr_diff[-20_000:], "```"]
    return "\n".join(blocks)


def _render_snapshot(files: dict[str, str], max_chars: int) -> str:
    """Render repo files with a hard char budget; truncate lowest-priority files first."""
    if not files:
        return "(empty repository)"
    ordered = sorted(files.items(), key=lambda kv: (len(kv[1]), kv[0]))
    out: list[str] = []
    used = 0
    for path, content in ordered:
        header = f"\n--- FILE: {path} ---\n"
        chunk = header + content + "\n"
        if used + len(chunk) > max_chars:
            out.append(header + "(truncated)\n")
            continue
        out.append(chunk)
        used += len(chunk)
    return "".join(out)


def _parse(data: dict) -> DevResult:
    patches = [
        FilePatch(path=p["path"], content=p.get("content", ""), action=p.get("action", "upsert"))
        for p in data.get("patches", [])
    ]
    return DevResult(
        summary=data.get("summary", "").strip(),
        commit_message=data.get("commit_message", "chore: automated change").strip(),
        patches=patches,
    )
