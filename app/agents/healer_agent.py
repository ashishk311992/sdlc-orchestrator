"""Healer Agent: alias of Dev Agent invoked with CI failure context.

Kept as a distinct module so the sequencer + metrics can attribute heal-specific
behavior (prompt variant, retry counter) separately from initial development.
"""
from __future__ import annotations
from app.agents.base import AgentContext, DevResult
from app.agents.dev_agent import DevAgent


class HealerAgent:
    name = "healer"

    def __init__(self, dev: DevAgent | None = None) -> None:
        self._dev = dev or DevAgent()

    def run(self, ctx: AgentContext) -> DevResult:
        # Dev agent switches to heal prompt when heal_attempt > 0
        if ctx.heal_attempt <= 0:
            ctx.heal_attempt = 1
        return self._dev.run(ctx)
