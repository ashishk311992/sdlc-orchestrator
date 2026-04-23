"""Agent contracts and shared data types."""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class FilePatch:
    """A single file create/update. `content` is the full new file contents."""
    path: str
    content: str
    action: str = "upsert"  # upsert | delete


@dataclass
class AgentContext:
    run_id: str
    issue_identifier: str
    title: str
    description: str
    repo: str
    branch: str
    base_branch: str
    repo_snapshot: dict[str, str] = field(default_factory=dict)  # path -> content
    pr_number: int | None = None
    pr_diff: str = ""
    ci_logs: str = ""
    heal_attempt: int = 0


@dataclass
class DevResult:
    summary: str
    patches: list[FilePatch]
    commit_message: str


@dataclass
class QAResult:
    summary: str
    patches: list[FilePatch]
    test_command: str


@dataclass
class ReviewResult:
    verdict: str  # "approve" | "request_changes"
    summary: str
    comments: list[str]


class Agent(Protocol):
    name: str

    def run(self, ctx: AgentContext) -> object: ...
