"""Thin wrapper around Anthropic Claude with retry + JSON extraction.

Swap implementations by replacing this module; agents depend only on `complete()`.
"""
from __future__ import annotations
import json
import re
from typing import Any
import anthropic
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import get_settings
from app.logging_config import get_logger

log = get_logger(__name__)


class LLMError(RuntimeError):
    pass


class LLMClient:
    def __init__(self) -> None:
        s = get_settings()
        self._client = anthropic.Anthropic(api_key=s.anthropic_api_key)
        self._model = s.llm_model
        self._max_tokens = s.llm_max_tokens

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((anthropic.APIError, anthropic.APIConnectionError)),
        reraise=True,
    )
    def complete(self, system: str, user: str, temperature: float = 0.1) -> str:
        try:
            resp = self._client.messages.create(
                model=self._model,
                max_tokens=self._max_tokens,
                temperature=temperature,
                system=system,
                messages=[{"role": "user", "content": user}],
            )
        except anthropic.APIStatusError as exc:
            log.error("llm_api_error", status=exc.status_code, body=str(exc))
            raise LLMError(str(exc)) from exc

        parts = [b.text for b in resp.content if getattr(b, "type", None) == "text"]
        text = "\n".join(parts).strip()
        if not text:
            raise LLMError("empty LLM response")
        return text

    def complete_json(self, system: str, user: str, temperature: float = 0.0) -> dict[str, Any]:
        raw = self.complete(system=system, user=user, temperature=temperature)
        return _extract_json(raw)


_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)```", re.DOTALL)


def _extract_json(text: str) -> dict[str, Any]:
    candidates: list[str] = []
    fenced = _FENCE_RE.findall(text)
    candidates.extend(fenced)
    candidates.append(text)
    for candidate in candidates:
        candidate = candidate.strip()
        if not candidate:
            continue
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            continue
    raise LLMError(f"LLM did not return valid JSON: {text[:400]}")
