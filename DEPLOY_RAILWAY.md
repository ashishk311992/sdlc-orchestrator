# Deploying to Railway

Railway will host four things:

1. **Postgres** plugin (run state + audit log)
2. **Redis** plugin (RQ queue)
3. **api** service (FastAPI, public HTTPS, receives webhooks)
4. **worker** service (RQ worker, no public port)

Both `api` and `worker` are built from the same repo / same `docker/Dockerfile` with different start commands.

---

## 0. Prerequisites

- Railway account + CLI: `npm i -g @railway/cli && railway login`
- This repo pushed to GitHub (Railway deploys from a GitHub repo)
- Secrets you will need at hand:
  - `ANTHROPIC_API_KEY`
  - `GITHUB_APP_TOKEN` (fine-grained PAT: `repo` + `workflow`)
  - `GITHUB_REPO` (e.g. `acme/service`)
  - `GITHUB_WEBHOOK_SECRET` (generate: `openssl rand -hex 32`)
  - `LINEAR_API_KEY`, `LINEAR_WEBHOOK_SECRET` (generate), `LINEAR_TEAM_ID`, `LINEAR_IN_REVIEW_STATE_ID`, `LINEAR_BLOCKED_STATE_ID`
  - `PLATFORM_CALLBACK_TOKEN` (generate: `openssl rand -hex 32`)

---

## 1. Create the project and add plugins

```bash
railway login
railway init                # create project, pick a name
railway add --plugin postgresql
railway add --plugin redis
```

Railway automatically injects `DATABASE_URL` and `REDIS_URL` into services you link to these plugins.

---

## 2. Create the API service

```bash
# From the repo root
railway up                  # first deploy creates a service and uploads the build
```

Then in the Railway dashboard for this service:

- **Settings -> Source**: connect to your GitHub repo so future pushes auto-deploy.
- **Settings -> Build**:
  - Builder: `Dockerfile`
  - Dockerfile path: `docker/Dockerfile`
- **Settings -> Deploy**:
  - Start command:
    ```
    uvicorn app.main:app --host 0.0.0.0 --port $PORT
    ```
  - Healthcheck path: `/healthz`
  - Restart policy: `on-failure`
- **Settings -> Networking**: click **Generate Domain** to get a public HTTPS URL (e.g. `https://sdlc-api-production.up.railway.app`). Copy this URL; it is your webhook base.
- **Variables**: link the Postgres and Redis plugins (Railway adds `DATABASE_URL` and `REDIS_URL` automatically), then add the service variables below.

### API service variables

```
ENV=production
LOG_LEVEL=INFO

ANTHROPIC_API_KEY=...
LLM_MODEL=claude-sonnet-4-5-20250929

GITHUB_APP_TOKEN=...
GITHUB_REPO=acme/service
GITHUB_DEFAULT_BRANCH=main
GITHUB_WEBHOOK_SECRET=...

LINEAR_API_KEY=...
LINEAR_WEBHOOK_SECRET=...
LINEAR_TEAM_ID=...
LINEAR_TRIGGER_LABEL=ai-ship
LINEAR_IN_REVIEW_STATE_ID=...
LINEAR_BLOCKED_STATE_ID=...

MAX_HEAL_ATTEMPTS=3
STAGE_TIMEOUT_SECONDS=900

PLATFORM_CALLBACK_TOKEN=...
```

Do **not** set `DATABASE_URL` / `REDIS_URL` manually; they come from the plugin links.

---

## 3. Create the worker service

In the Railway dashboard, click **+ New -> Empty Service**, name it `worker`, and:

- **Settings -> Source**: connect to the same GitHub repo.
- **Settings -> Build**: Dockerfile path `docker/Dockerfile` (same image).
- **Settings -> Deploy**:
  - Start command:
    ```
    python worker.py
    ```
  - No public domain needed; leave networking off.
  - Restart policy: `on-failure`.
- **Variables**: link the Postgres and Redis plugins, then add the **same** environment variables as the API service. The worker needs every secret the API has because agents run here.

Alternative via CLI: duplicate the API service and override the start command in the service settings.

---

## 4. Register the webhooks

With the API's public domain (from step 2):

### Linear

Linear -> Settings -> API -> Webhooks -> New webhook:
- URL: `https://<api-domain>/webhooks/linear`
- Secret: value of `LINEAR_WEBHOOK_SECRET`
- Resource types: `Issues`, `Comments`

### GitHub

In your **target application repo** (the one the platform will ship PRs to) -> Settings -> Webhooks -> Add:
- Payload URL: `https://<api-domain>/webhooks/github`
- Content type: `application/json`
- Secret: value of `GITHUB_WEBHOOK_SECRET`
- Events: `Pull requests`, `Workflow runs`

---

## 5. Install the self-healing workflow in the target repo

Copy [.github/workflows/ai-ci.yml](.github/workflows/ai-ci.yml) into the **target application repo** (not this platform repo).

Then in that target repo -> Settings -> Secrets and variables -> Actions, add:
- `AI_PLATFORM_URL` = `https://<api-domain>`
- `AI_PLATFORM_TOKEN` = value of `PLATFORM_CALLBACK_TOKEN`

---

## 6. Smoke test

```bash
curl https://<api-domain>/healthz       # {"status":"ok"}
curl https://<api-domain>/readyz        # {"db":true,"redis":true}
```

Then in Linear, create an issue, apply the `ai-ship` label, and watch:
- Railway API logs: webhook received, run enqueued
- Railway worker logs: Dev -> QA -> Review stages
- GitHub: branch `ai/<slug>-<id>` and a draft PR appear
- GitHub Actions: `AI CI` run starts
- On failure: worker logs show `heal attempt 1` and a new commit is pushed
- On success: Linear issue transitions to "In Review" with PR link

---

## 7. Operational notes

- **Scaling**: set `numReplicas` on the API service to scale horizontally (stateless). Keep the worker at 1 replica initially; RQ will serialize runs. Scale up by adding replicas once you have concurrency tests.
- **Logs**: Railway dashboard -> service -> Deployments -> Logs. Structured JSON; filter by `run_id`.
- **Metrics**: `https://<api-domain>/metrics` exposes Prometheus metrics.
- **Secret rotation**: rotate `GITHUB_WEBHOOK_SECRET`, `LINEAR_WEBHOOK_SECRET`, and `PLATFORM_CALLBACK_TOKEN` by updating Railway variables; then update the matching value in Linear/GitHub webhook settings and the target repo's Actions secret. Redeploy after each rotation.
- **Cost guardrails**: start with Railway's Hobby plan; Postgres + Redis + 2 services fits comfortably. Watch DB storage (audit log grows with `run_events`) and add a retention job if needed.
- **Database migrations**: `init_db()` runs `create_all` on API startup, fine for green-field. For real schema evolution, add Alembic and run `alembic upgrade head` as a Railway pre-deploy command.
