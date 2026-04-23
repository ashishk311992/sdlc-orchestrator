"""Smoke tests for signature validation + webhook filtering."""
import hmac
import hashlib
import json
from app.security import verify_linear_signature, verify_github_signature, verify_bearer


def test_linear_signature_valid():
    secret = "s3cret"
    body = b'{"a":1}'
    sig = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    assert verify_linear_signature(secret, body, sig)


def test_linear_signature_invalid():
    assert not verify_linear_signature("s3cret", b"{}", "deadbeef")
    assert not verify_linear_signature("s3cret", b"{}", None)
    assert not verify_linear_signature("", b"{}", "x")


def test_github_signature_valid():
    secret = "shh"
    body = b'{"a":1}'
    digest = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    assert verify_github_signature(secret, body, f"sha256={digest}")


def test_github_signature_invalid_prefix():
    assert not verify_github_signature("shh", b"{}", "md5=abc")


def test_bearer():
    assert verify_bearer("tok", "Bearer tok")
    assert not verify_bearer("tok", "Bearer other")
    assert not verify_bearer("tok", None)
    assert not verify_bearer("", "Bearer tok")


def test_linear_filter_requires_label():
    from app.webhooks.linear_webhook import _is_relevant
    from app.config import Settings

    s = Settings(linear_trigger_label="ai-ship", linear_team_id="")
    payload_ok = {
        "type": "Issue",
        "action": "create",
        "data": {
            "id": "x",
            "labels": {"nodes": [{"name": "ai-ship"}]},
        },
    }
    payload_no_label = json.loads(json.dumps(payload_ok))
    payload_no_label["data"]["labels"] = {"nodes": [{"name": "other"}]}

    assert _is_relevant(payload_ok, s)
    assert not _is_relevant(payload_no_label, s)
