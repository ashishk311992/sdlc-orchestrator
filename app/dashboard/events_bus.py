"""Redis pub/sub bus used to fan out run events to connected SSE clients."""
from __future__ import annotations
import json
from typing import Any

from app.orchestrator.queue import redis_client

CHANNEL = "sdlc:events"


def publish_event(run_id: str, event_type: str, payload: dict[str, Any]) -> None:
    """Best-effort publish; never raises into callers."""
    try:
        redis_client().publish(
            CHANNEL,
            json.dumps({"run_id": run_id, "type": event_type, "payload": payload}),
        )
    except Exception:
        # Pub/sub is observability-only. Swallow failures so the pipeline
        # does not break when Redis is temporarily unreachable.
        pass
