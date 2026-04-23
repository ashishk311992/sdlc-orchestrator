# Autonomous SDLC Platform

Production-grade multi-agent system that turns Linear issues into shipped pull requests with zero human intervention. Linear issue → Dev Agent writes code → QA Agent writes & runs tests → Reviewer Agent reviews → GitHub Actions validates → self-healing fix loop → PR shipped → Linear updated.

---

## 1. System Architecture

```
                        +----------------------+
                        |   Linear (Issues)    |
                        +----------+-----------+
                                   | webhook (HMAC signed)
                                   v
+-------------------+      +-------+--------+      +------------------+
|  GitHub Actions   |<---->|  FastAPI API   |<---->|   Redis (queue   |
|  (CI + re-runs)   |      |  (app/main.py) |      |   + state cache) |
+---------+---------+      +-------+--------+      +------------------+
          ^                        |                        ^
          | workflow_dispatch      | enqueue jobs           |
          | + repository_dispatch  v                        |
          |                +-------+--------+               |
          |                |  RQ Workers    |---------------+
          |                |  (worker.py)   |
          |                +-------+--------+
          |                        |
          |                        v
          |     +------------------+------------------+
          |     |          Orchestrator               |
          |     |   (state machine: INTAKE -> DEV ->  |
          |     |   QA -> REVIEW -> CI -> HEAL -> DONE|
          |     +--+----------+----------+----------+-+
          |        |          |          |          |
          |        v          v          v          v
          |   +--------+ +--------+ +----------+ +---------+
          |   |  Dev   | |   QA   | | Reviewer | | Healer  |
          |   | Agent  | | Agent  | |  Agent   | |  Agent  |
          |   +---+----+ +---+----+ +----+-----+ +----+----+
          |       |          |           |           |
          |       v          v           v           v
          |   +---+----------+-----------+-----------+---+
          |   |         LLM Client (Anthropic)            |
          |   +-------------------------------------------+
          |       |
          |       v
          |   +-------------------+       +----------------+
          +---+  GitHub REST API  +<----->|  PostgreSQL    |
              |  (code, PRs)      |       |  (run state,   |
              +-------------------+       |   audit log)   |
                       |                  +----------------+
                       v
              +-------------------+
              |  Linear API       |
              |  (status/comments)|
              +-------------------+
```

### Data flow
1. Linear issue labeled `ai-ship` triggers webhook → `/webhooks/linear`.
2. Webhook validates HMAC, parses issue, creates `Run` row, enqueues job.
3. RQ worker pulls job; orchestrator runs state machine.
4. Dev Agent generates a patch → commits on feature branch → opens PR.
5. QA Agent generates tests → commits → pushes.
6. Reviewer Agent comments review on PR.
7. GitHub Actions runs tests. On failure, calls back to `/webhooks/github/ci-failure` which triggers Healer (Dev Agent with failure context).
8. On green CI + reviewer approval, Linear ticket is moved to `In Review` with PR link.

---

## 2. Tech Stack (decisions)

| Layer | Choice | Rationale |
|---|---|---|
| API | **FastAPI** (Python 3.11) | async, native pydantic validation, first-class for LLM stacks, minimal boilerplate |
| Queue | **Redis + RQ** | simple, durable, observable; Celery is overkill for this workload |
| State DB | **PostgreSQL** via SQLAlchemy 2.0 | ACID state transitions, audit log, idempotency keys |
| LLM | **Anthropic Claude** (swappable) | strong tool-use + long context for diffs; `app/agents/llm_client.py` abstracts it |
| Orchestration | In-process **state machine** | explicit states persisted to Postgres; no extra infra |
| Git ops | local `git` CLI in a workspace dir | reliable diffs & multi-file commits via GitHub REST |
| CI | **GitHub Actions** | native to repo; `repository_dispatch` for re-entry |
| Deploy | Docker Compose (local) / ECS Fargate / Azure Container Apps | stateless API + worker, external Redis + Postgres |

---

## 3. Repo layout

```
.
|-- app/
|   |-- main.py                  FastAPI app + routers
|   |-- config.py                Pydantic settings
|   |-- logging_config.py        Structured JSON logging
|   |-- db.py                    SQLAlchemy engine/session
|   |-- models.py                Run / RunEvent tables
|   |-- security.py              HMAC validators
|   |-- agents/
|   |   |-- base.py              Agent contract
|   |   |-- llm_client.py        Anthropic wrapper
|   |   |-- dev_agent.py
|   |   |-- qa_agent.py
|   |   |-- reviewer_agent.py
|   |   `-- healer_agent.py
|   |-- orchestrator/
|   |   |-- queue.py             RQ setup
|   |   |-- state.py             State machine
|   |   `-- orchestrator.py      Sequencer
|   |-- integrations/
|   |   |-- github_client.py
|   |   |-- linear_client.py
|   |   `-- git_workspace.py     Checkout/commit/push
|   `-- webhooks/
|       |-- linear_webhook.py
|       `-- github_webhook.py
|-- worker.py                    RQ worker entrypoint
|-- .github/workflows/ai-ci.yml  Self-healing pipeline
|-- docker/
|   |-- Dockerfile
|   `-- docker-compose.yml
|-- tests/
|-- requirements.txt
|-- .env.example
`-- README.md
```

---

## 4. Environment variables

See [.env.example](.env.example). Required keys:

- `ANTHROPIC_API_KEY`
- `GITHUB_APP_TOKEN` (fine-grained PAT or GitHub App installation token; `repo` + `workflow` scopes)
- `GITHUB_REPO` (e.g. `acme/service`)
- `GITHUB_WEBHOOK_SECRET`
- `LINEAR_API_KEY`
- `LINEAR_WEBHOOK_SECRET`
- `LINEAR_TEAM_ID`
- `LINEAR_TRIGGER_LABEL` (default: `ai-ship`)
- `LINEAR_IN_REVIEW_STATE_ID`
- `DATABASE_URL` (Postgres DSN)
- `REDIS_URL`
- `MAX_HEAL_ATTEMPTS` (default 3)

---

## 5. Local setup

```bash
cp .env.example .env
# fill in secrets
docker compose -f docker/docker-compose.yml up --build
```

The API is exposed on `:8080`.

Register the webhook in Linear:
- URL: `https://<your-host>/webhooks/linear`
- Secret: value of `LINEAR_WEBHOOK_SECRET`
- Events: `Issues`, `Comments`

Register the webhook in GitHub:
- URL: `https://<your-host>/webhooks/github`
- Secret: value of `GITHUB_WEBHOOK_SECRET`
- Events: `workflow_run`, `check_run`, `pull_request`

Add `.github/workflows/ai-ci.yml` to the target repo and set repo secret `AI_PLATFORM_URL` + `AI_PLATFORM_TOKEN`.

---

## 6. Cloud deployment

- Build: `docker build -f docker/Dockerfile -t sdlc-platform:latest .`
- Run two services from the same image:
  - `api`: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
  - `worker`: `python worker.py`
- Add managed Redis + managed Postgres.
- Works on AWS ECS Fargate, Azure Container Apps, Fly.io, Railway. Stateless; scale horizontally.

---

## 7. Observability

- Structured JSON logs (`app/logging_config.py`) with `run_id`, `issue_id`, `stage`.
- Every state transition is persisted to `run_events` for full audit replay.
- `/healthz` liveness, `/readyz` readiness (checks Redis + DB).
- Prometheus metrics on `/metrics` (RQ job counts, stage latency).

---

## 8. Design principles applied

- **Idempotent**: webhook uses Linear's `issue.id` + `updatedAt` as idempotency key; duplicate deliveries are no-ops.
- **Retry-safe**: every stage is reentrant; state is persisted before side effects.
- **Bounded self-healing**: `MAX_HEAL_ATTEMPTS` hard cap; on exhaustion, Linear gets a `needs-human` comment.
- **Separation of concerns**: agents are pure `(input) -> output`; orchestrator owns sequencing; integrations own external I/O.
- **Extensibility**: add an agent by implementing `Agent` protocol and wiring into `orchestrator.py`.
