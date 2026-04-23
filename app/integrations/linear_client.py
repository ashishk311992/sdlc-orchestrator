"""Linear GraphQL client (minimal subset: comments, state transitions, issue read)."""
from __future__ import annotations
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import get_settings
from app.logging_config import get_logger

log = get_logger(__name__)

_ENDPOINT = "https://api.linear.app/graphql"


class LinearError(RuntimeError):
    pass


class LinearClient:
    def __init__(self) -> None:
        s = get_settings()
        self._client = httpx.Client(
            headers={
                "Authorization": s.linear_api_key,
                "Content-Type": "application/json",
                "User-Agent": "sdlc-platform/1.0",
            },
            timeout=20.0,
        )
        self._in_review_state = s.linear_in_review_state_id
        self._blocked_state = s.linear_blocked_state_id

    def close(self) -> None:
        self._client.close()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        retry=retry_if_exception_type(httpx.TransportError),
        reraise=True,
    )
    def _gql(self, query: str, variables: dict) -> dict:
        resp = self._client.post(_ENDPOINT, json={"query": query, "variables": variables})
        if resp.status_code >= 400:
            raise LinearError(f"HTTP {resp.status_code}: {resp.text}")
        data = resp.json()
        if data.get("errors"):
            raise LinearError(str(data["errors"]))
        return data["data"]

    def add_comment(self, issue_id: str, body: str) -> None:
        query = """
        mutation($issueId: String!, $body: String!) {
          commentCreate(input: {issueId: $issueId, body: $body}) { success }
        }
        """
        self._gql(query, {"issueId": issue_id, "body": body})

    def set_state(self, issue_id: str, state_id: str) -> None:
        query = """
        mutation($id: String!, $stateId: String!) {
          issueUpdate(id: $id, input: {stateId: $stateId}) { success }
        }
        """
        self._gql(query, {"id": issue_id, "stateId": state_id})

    def mark_in_review(self, issue_id: str) -> None:
        if self._in_review_state:
            self.set_state(issue_id, self._in_review_state)

    def mark_blocked(self, issue_id: str) -> None:
        if self._blocked_state:
            self.set_state(issue_id, self._blocked_state)

    def get_issue(self, issue_id: str) -> dict:
        query = """
        query($id: String!) {
          issue(id: $id) {
            id identifier title description
            labels { nodes { name } }
            state { id name }
            team { id }
            updatedAt
          }
        }
        """
        return self._gql(query, {"id": issue_id})["issue"]
