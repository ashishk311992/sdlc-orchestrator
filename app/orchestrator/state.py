"""State persistence helpers used by the orchestrator."""
from __future__ import annotations
from typing import Any
from sqlalchemy import select
from app.db import session_scope
from app.models import Run, RunStatus, RunEvent


def create_or_get_run(*, issue_id: str, issue_identifier: str, issue_updated_at: str,
                      title: str, description: str) -> tuple[Run, bool]:
    """Idempotent: (issue_id, issue_updated_at) is unique."""
    with session_scope() as s:
        existing = s.scalar(
            select(Run).where(Run.issue_id == issue_id, Run.issue_updated_at == issue_updated_at)
        )
        if existing:
            s.expunge(existing)
            return existing, False
        run = Run(
            issue_id=issue_id,
            issue_identifier=issue_identifier,
            issue_updated_at=issue_updated_at,
            title=title,
            description=description,
        )
        s.add(run)
        s.flush()
        s.refresh(run)
        s.expunge(run)
        return run, True


def load_run(run_id: str) -> Run | None:
    with session_scope() as s:
        run = s.get(Run, run_id)
        if run:
            s.expunge(run)
        return run


def update_run(run_id: str, **fields: Any) -> None:
    with session_scope() as s:
        run = s.get(Run, run_id)
        if not run:
            raise LookupError(run_id)
        for k, v in fields.items():
            setattr(run, k, v)


def record_event(run_id: str, stage: str, message: str, *, level: str = "info",
                 payload: dict | None = None) -> None:
    with session_scope() as s:
        s.add(RunEvent(run_id=run_id, stage=stage, message=message,
                       level=level, payload=payload or {}))
