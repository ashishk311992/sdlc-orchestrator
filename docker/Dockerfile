# --- Stage 1: build React SPA -----------------------------------------------
FROM node:20-alpine AS ui

WORKDIR /ui
COPY ui/package.json ui/package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY ui/ .
RUN npm run build


# --- Stage 2: Python runtime ------------------------------------------------
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app ./app
COPY worker.py ./worker.py

# Built SPA: app/main.py mounts /app/ui/dist
COPY --from=ui /ui/dist ./ui/dist

RUN useradd -u 10001 -m sdlc
USER sdlc

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
