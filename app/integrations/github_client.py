"""GitHub REST client for PRs, comments, reviews, and workflow dispatch."""
from __future__ import annotations
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import get_settings
from app.logging_config import get_logger

log = get_logger(__name__)

_API = "https://api.github.com"


class GitHubError(RuntimeError):
    pass


class GitHubClient:
    def __init__(self) -> None:
        s = get_settings()
        self._repo = s.github_repo
        self._token = s.github_app_token
        self._client = httpx.Client(
            base_url=_API,
            headers={
                "Authorization": f"Bearer {self._token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "sdlc-platform/1.0",
            },
            timeout=30.0,
        )

    def close(self) -> None:
        self._client.close()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        retry=retry_if_exception_type(httpx.TransportError),
        reraise=True,
    )
    def _request(self, method: str, path: str, **kwargs) -> httpx.Response:
        resp = self._client.request(method, path, **kwargs)
        if resp.status_code >= 400:
            log.error("github.error", method=method, path=path, status=resp.status_code, body=resp.text[:500])
            raise GitHubError(f"{method} {path} -> {resp.status_code}: {resp.text}")
        return resp

    # ---- PRs ---------------------------------------------------------------

    def open_pr(self, *, head: str, base: str, title: str, body: str, draft: bool = False) -> dict:
        r = self._request(
            "POST",
            f"/repos/{self._repo}/pulls",
            json={"title": title, "head": head, "base": base, "body": body, "draft": draft},
        )
        return r.json()

    def find_open_pr_for_branch(self, head: str) -> dict | None:
        owner = self._repo.split("/")[0]
        r = self._request(
            "GET",
            f"/repos/{self._repo}/pulls",
            params={"head": f"{owner}:{head}", "state": "open"},
        )
        items = r.json()
        return items[0] if items else None

    def update_pr(self, number: int, *, title: str | None = None, body: str | None = None) -> dict:
        payload: dict = {}
        if title is not None:
            payload["title"] = title
        if body is not None:
            payload["body"] = body
        r = self._request("PATCH", f"/repos/{self._repo}/pulls/{number}", json=payload)
        return r.json()

    def comment_pr(self, number: int, body: str) -> None:
        self._request(
            "POST",
            f"/repos/{self._repo}/issues/{number}/comments",
            json={"body": body},
        )

    def submit_review(self, number: int, *, event: str, body: str) -> None:
        # event: APPROVE | REQUEST_CHANGES | COMMENT
        self._request(
            "POST",
            f"/repos/{self._repo}/pulls/{number}/reviews",
            json={"event": event, "body": body},
        )

    def get_pr_diff(self, number: int) -> str:
        r = self._request(
            "GET",
            f"/repos/{self._repo}/pulls/{number}",
            headers={"Accept": "application/vnd.github.v3.diff"},
        )
        return r.text

    # ---- Actions -----------------------------------------------------------

    def dispatch_workflow(self, workflow_file: str, ref: str, inputs: dict) -> None:
        self._request(
            "POST",
            f"/repos/{self._repo}/actions/workflows/{workflow_file}/dispatches",
            json={"ref": ref, "inputs": inputs},
        )

    def repository_dispatch(self, event_type: str, client_payload: dict) -> None:
        self._request(
            "POST",
            f"/repos/{self._repo}/dispatches",
            json={"event_type": event_type, "client_payload": client_payload},
        )

    def get_workflow_run_logs_url(self, run_id: int) -> str:
        return f"/repos/{self._repo}/actions/runs/{run_id}/logs"
