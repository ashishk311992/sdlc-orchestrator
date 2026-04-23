"""QA Agent: generates unit + integration tests for the Dev Agent's change."""
from __future__ import annotations
from app.agents.base import AgentContext, QAResult, FilePatch
from app.agents.llm_client import LLMClient
from app.logging_config import get_logger

log = get_logger(__name__)


SYSTEM_PROMPT = """You are a Senior SDET acting as an autonomous QA Agent.

Responsibilities:
- Given an implementation diff and repo snapshot, generate deterministic tests.
- Produce BOTH unit tests (pure function/class level) AND at least one integration test
  (end-to-end or module-to-module) when the change surface allows.
- Use the test framework already present in the repo (detect from snapshot: pytest,
  jest, go test, junit, etc.). If none is present, default to the language's standard
  framework.
- Tests must be runnable with a single shell command.

Output contract (strict JSON only):
{
  "summary": "<short description of test coverage added>",
  "test_command": "<single shell command to run the new tests>",
  "patches": [
    {"path": "tests/...", "action": "upsert", "content": "<full test file>"}
  ]
}
No markdown fences, no prose outside JSON."""


class QAAgent:
    name = "qa"

    def __init__(self, llm: LLMClient | None = None) -> None:
        self._llm = llm or LLMClient()

    def run(self, ctx: AgentContext) -> QAResult:
        user = _build_user_prompt(ctx)
        log.info("qa_agent.invoke", run_id=ctx.run_id)
        data = self._llm.complete_json(system=SYSTEM_PROMPT, user=user, temperature=0.1)
        patches = [
            FilePatch(path=p["path"], content=p.get("content", ""), action=p.get("action", "upsert"))
            for p in data.get("patches", [])
        ]
        return QAResult(
            summary=data.get("summary", "").strip(),
            test_command=data.get("test_command", "").strip() or "pytest -q",
            patches=patches,
        )


def _build_user_prompt(ctx: AgentContext) -> str:
    blocks = [
        f"# Issue {ctx.issue_identifier}",
        f"Title: {ctx.title}",
        "",
        "## Description",
        ctx.description or "(no description)",
        "",
        "## Implementation diff",
        "```diff",
        (ctx.pr_diff or "(no diff available)")[-40_000:],
        "```",
        "",
        "## Repo snapshot (truncated)",
    ]
    # include only paths likely relevant (configs + a few source files)
    allow_prefixes = ("package.json", "pyproject.toml", "go.mod", "pom.xml", "build.gradle",
                      "tests/", "test/", "src/", "app/", "lib/", "internal/")
    picked = {p: c for p, c in ctx.repo_snapshot.items() if p.startswith(allow_prefixes)}
    for path, content in list(picked.items())[:40]:
        blocks.append(f"\n--- FILE: {path} ---\n{content[:4000]}")
    return "\n".join(blocks)
