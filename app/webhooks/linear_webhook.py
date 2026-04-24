"""Linear webhook -> enqueue a Run."""
from __future__ import annotations
from fastapi import APIRouter, Header, HTTPException, Request, status
from app.config import get_settings
from app.logging_config import get_logger
from app.models import RunStatus
from app.orchestrator.queue import enqueue_run
from app.orchestrator.state import create_or_get_run, record_event, update_run
from app.security import verify_linear_signature

router = APIRouter(prefix="/webhooks/linear", tags=["webhooks"])
log = get_logger(__name__)


@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def handle_linear(
    request: Request,
    linear_signature: str | None = Header(default=None, alias="linear-signature"),
):
    settings = get_settings()
    raw = await request.body()
    if not verify_linear_signature(settings.linear_webhook_secret, raw, linear_signature):
        raise HTTPException(status_code=401, detail="invalid signature")

    payload = await request.json()

    if not _is_relevant(payload, settings):
        log.info("linear.ignored", reason="filter", type=payload.get("type"),
                 action=payload.get("action"))
        return {"status": "ignored"}

    data = payload.get("data") or {}
    issue_id = data.get("id") or ""
    if not issue_id:
        raise HTTPException(status_code=400, detail="missing issue id")

    run, created = create_or_get_run(
        issue_id=issue_id,
        issue_identifier=data.get("identifier", issue_id[:8]),
        issue_updated_at=str(data.get("updatedAt") or payload.get("createdAt") or ""),
        title=data.get("title") or "(untitled)",
        description=data.get("description") or "",
    )

    if not created:
        log.info("linear.duplicate", run_id=run.id, issue=run.issue_identifier)
        return {"status": "duplicate", "run_id": run.id}

    record_event(run.id, stage="intake", message="run created from Linear webhook",
                 payload={"action": payload.get("action")})
    update_run(run.id, status=RunStatus.INTAKE)
    job_id = enqueue_run(run.id)
    log.info("linear.enqueued", run_id=run.id, job_id=job_id, issue=run.issue_identifier)
    return {"status": "queued", "run_id": run.id, "job_id": job_id}


def _is_relevant(payload: dict, settings) -> bool:
    """Only act on Issue create/update events carrying the trigger label, and,
    when configured, restricted to a specific team."""
    if payload.get("type") != "Issue":
        return False
    if payload.get("action") not in ("create", "update"):
        return False
    data = payload.get("data") or {}
    if settings.linear_team_id:
        team = data.get("team") or {}
        if team.get("id") != settings.linear_team_id:
            return False
    labels_raw = data.get("labels") or []
    if isinstance(labels_raw, dict):
        labels_raw = labels_raw.get("nodes") or []
    label_names = {l.get("name") for l in labels_raw if isinstance(l, dict)}
    if settings.linear_trigger_label and settings.linear_trigger_label not in label_names:
        return False
    return True
