"""HMAC signature validation for inbound webhooks."""
import hmac
import hashlib


def verify_linear_signature(secret: str, raw_body: bytes, signature_header: str | None) -> bool:
    """Linear sends hex HMAC-SHA256 in the `linear-signature` header."""
    if not signature_header or not secret:
        return False
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header.strip())


def verify_github_signature(secret: str, raw_body: bytes, signature_header: str | None) -> bool:
    """GitHub sends `sha256=<hex>` in the `X-Hub-Signature-256` header."""
    if not signature_header or not secret:
        return False
    if not signature_header.startswith("sha256="):
        return False
    expected = "sha256=" + hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header.strip())


def verify_bearer(expected_token: str, auth_header: str | None) -> bool:
    if not expected_token or not auth_header:
        return False
    scheme, _, token = auth_header.partition(" ")
    return scheme.lower() == "bearer" and hmac.compare_digest(token, expected_token)
