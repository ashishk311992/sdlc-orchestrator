"""RQ queue + helpers. The orchestrator enqueues a single job per run."""
from __future__ import annotations
import redis
from rq import Queue
from app.config import get_settings

_settings = get_settings()
_redis = redis.Redis.from_url(_settings.redis_url)
runs_queue = Queue("runs", connection=_redis, default_timeout=_settings.stage_timeout_seconds * 4)


def enqueue_run(run_id: str) -> str:
    job = runs_queue.enqueue(
        "app.orchestrator.orchestrator.execute_run",
        run_id,
        job_id=f"run:{run_id}",
        retry=None,
        failure_ttl=86400,
        result_ttl=86400,
    )
    return job.id


def redis_client() -> redis.Redis:
    return _redis
