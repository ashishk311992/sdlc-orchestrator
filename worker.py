"""RQ worker entrypoint: `python worker.py`."""
from __future__ import annotations
from rq import Worker
from app.db import init_db
from app.logging_config import configure_logging, get_logger
from app.orchestrator.queue import redis_client, runs_queue


def main() -> None:
    configure_logging()
    init_db()
    log = get_logger(__name__)
    log.info("worker.start", queue=runs_queue.name)
    Worker([runs_queue], connection=redis_client()).work(with_scheduler=True)


if __name__ == "__main__":
    main()
