"""Reviewer Agent: reviews a PR diff and returns a verdict + inline-style comments."""
from __future__ import annotations
from app.agents.base import AgentContext, ReviewResult
from app.agents.llm_client import LLMClient
from app.logging_config import get_logger

log = get_logger(__name__)


SYSTEM_PROMPT = """You are a Principal Engineer acting as an autonomous Code Reviewer.

Review the diff for:
- Correctness vs the stated issue
- Security (OWASP Top 10, secrets, injection, authz)
- Error handling and edge cases
- Readability, naming, and alignment with existing patterns
- Test adequacy (is QA Agent's coverage sufficient?)

Output contract (strict JSON only):
{
  "verdict": "approve" | "request_changes",
  "summary": "<1-3 sentence overall assessment>",
  "comments": ["<specific, actionable comment>", "..."]
}
Use "request_changes" only for concrete defects; nitpicks go in comments with
"approve" verdict. No markdown fences, no prose outside JSON."""


class ReviewerAgent:
    name = "reviewer"

    def __init__(self, llm: LLMClient | None = None) -> None:
        self._llm = llm or LLMClient()

    def run(self, ctx: AgentContext) -> ReviewResult:
        user = _build_user_prompt(ctx)
        log.info("reviewer_agent.invoke", run_id=ctx.run_id, pr=ctx.pr_number)
        data = self._llm.complete_json(system=SYSTEM_PROMPT, user=user, temperature=0.0)
        verdict = data.get("verdict", "request_changes")
        if verdict not in ("approve", "request_changes"):
            verdict = "request_changes"
        return ReviewResult(
            verdict=verdict,
            summary=data.get("summary", "").strip(),
            comments=[c.strip() for c in data.get("comments", []) if c and c.strip()],
        )


def _build_user_prompt(ctx: AgentContext) -> str:
    return (
        f"# Issue {ctx.issue_identifier}\n"
        f"Title: {ctx.title}\n\n"
        f"## Description\n{ctx.description or '(none)'}\n\n"
        f"## PR #{ctx.pr_number} diff\n```diff\n{ctx.pr_diff[-60_000:]}\n```\n"
    )
