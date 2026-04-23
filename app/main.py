"""FastAPI application entrypoint."""
from __future__ import annotations
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from sqlalchemy import text
from app.config import get_settings
from app.db import engine, init_db
from app.logging_config import configure_logging, get_logger
from app.orchestrator.queue import redis_client
from app.webhooks.github_webhook import router as github_router
from app.webhooks.linear_webhook import router as linear_router

configure_logging()
log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    log.info("api.startup", env=get_settings().env)
    yield
    log.info("api.shutdown")


app = FastAPI(title="Autonomous SDLC Platform", version="1.0.0", lifespan=lifespan)
app.include_router(linear_router)
app.include_router(github_router)


@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok"}


@app.get("/readyz")
def readyz() -> dict:
    checks = {"db": False, "redis": False}
    try:
        with engine.connect() as c:
            c.execute(text("SELECT 1"))
        checks["db"] = True
    except Exception as exc:
        log.warning("readyz.db_failed", error=str(exc))
    try:
        checks["redis"] = bool(redis_client().ping())
    except Exception as exc:
        log.warning("readyz.redis_failed", error=str(exc))
    status = 200 if all(checks.values()) else 503
    return checks if status == 200 else Response(
        content=str(checks), status_code=status, media_type="application/json"
    )


@app.get("/metrics")
def metrics() -> Response:
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
