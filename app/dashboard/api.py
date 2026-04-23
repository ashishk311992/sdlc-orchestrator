"""Dashboard HTTP API: read-only views over Run/RunEvent and an SSE stream."""
from __future__ import annotations
import asyncio
import json
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select

from app.config import get_settings
from app.dashboard.events_bus import CHANNEL
from app.db import SessionLocal
from app.models import Run, RunEvent, RunStatus
from app.orchestrator.queue import redis_client
from app.security import verify_bearer

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def require_auth(request: Request) -> None:
    settings = get_settings()
    token = settings.platform_callback_token
    if not token:
        raise HTTPException(500, "PLATFORM_CALLBACK_TOKEN not configured")
    header = request.headers.get("authorization")
    if not header:
        # Allow ?token=... for EventSource (browsers cannot set headers on SSE).
        qtok = request.query_params.get("token")
        if qtok and token and qtok == token:
            return
    if not verify_bearer(token, header):
        raise HTTPException(401, "unauthorized")


def _run_to_dict(run: Run) -> dict[str, Any]:
    return {
        "id": run.id,
        "issue_id": run.issue_id,
        "issue_identifier": run.issue_identifier,
        "title": run.title,
        "description": run.description,
        "status": run.status.value,
        "branch": run.branch,
        "pr_number": run.pr_number,
        "heal_attempts": run.heal_attempts,
        "created_at": run.created_at.isoformat(),
        "updated_at": run.updated_at.isoformat(),
    }


def _event_to_dict(ev: RunEvent) -> dict[str, Any]:
    return {
        "id": ev.id,
        "run_id": ev.run_id,
        "stage": ev.stage,
        "level": ev.level,
        "message": ev.message,
        "payload": ev.payload or {},
        "created_at": ev.created_at.isoformat(),
    }


@router.get("/summary", dependencies=[Depends(require_auth)])
def summary() -> dict[str, Any]:
    with SessionLocal() as db:
        by_status = dict(
            db.execute(select(Run.status, func.count(Run.id)).group_by(Run.status)).all()
        )
        total = sum(by_status.values())
        day_ago = datetime.utcnow() - timedelta(hours=24)
        last_24h = db.execute(
            select(func.count(Run.id)).where(Run.created_at >= day_ago)
        ).scalar_one()
        done_24h = db.execute(
            select(func.count(Run.id)).where(
                Run.created_at >= day_ago, Run.status == RunStatus.DONE
            )
        ).scalar_one()
        failed_24h = db.execute(
            select(func.count(Run.id)).where(
                Run.created_at >= day_ago,
                Run.status.in_([RunStatus.FAILED, RunStatus.BLOCKED]),
            )
        ).scalar_one()
    return {
        "total": total,
        "by_status": {k.value if hasattr(k, "value") else str(k): v for k, v in by_status.items()},
        "last_24h": last_24h,
        "done_24h": done_24h,
        "failed_24h": failed_24h,
    }


@router.get("/runs", dependencies=[Depends(require_auth)])
def list_runs(
    status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
) -> dict[str, Any]:
    with SessionLocal() as db:
        stmt = select(Run).order_by(Run.updated_at.desc()).limit(limit)
        if status:
            try:
                stmt = stmt.where(Run.status == RunStatus(status))
            except ValueError:
                raise HTTPException(400, f"invalid status {status}")
        runs = db.execute(stmt).scalars().all()
    return {"items": [_run_to_dict(r) for r in runs]}


@router.get("/runs/{run_id}", dependencies=[Depends(require_auth)])
def get_run(run_id: str) -> dict[str, Any]:
    with SessionLocal() as db:
        run = db.get(Run, run_id)
        if not run:
            raise HTTPException(404, "run not found")
        events = db.execute(
            select(RunEvent)
            .where(RunEvent.run_id == run_id)
            .order_by(RunEvent.created_at.asc())
        ).scalars().all()
        data = _run_to_dict(run)
        data["events"] = [_event_to_dict(e) for e in events]
        return data


@router.get("/stream", dependencies=[Depends(require_auth)])
async def stream(request: Request) -> StreamingResponse:
    """Server-sent events: forwards Redis pub/sub messages on CHANNEL."""

    async def gen():
        r = redis_client()
        pubsub = r.pubsub()
        pubsub.subscribe(CHANNEL)
        try:
            yield ": connected\n\n"
            while True:
                if await request.is_disconnected():
                    break
                msg = pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if msg and msg.get("type") == "message":
                    data = msg.get("data")
                    if isinstance(data, bytes):
                        data = data.decode()
                    yield f"data: {data}\n\n"
                else:
                    # keep-alive comment so intermediaries do not time out
                    yield ": ping\n\n"
                    await asyncio.sleep(0.5)
        finally:
            try:
                pubsub.unsubscribe(CHANNEL)
                pubsub.close()
            except Exception:
                pass

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
