"""BYOK: crypto round-trip, masked responses, encrypted-at-rest storage."""
from app.core.crypto import decrypt_key, encrypt_key, mask_key


def test_crypto_round_trip_and_mask():
    """Encrypt/decrypt round-trips; mask never exposes the secret."""
    secret = "nvapi-super-secret-value-1234567890"
    cipher = encrypt_key(secret)
    assert cipher != secret
    assert decrypt_key(cipher) == secret

    masked = mask_key(secret)
    assert secret not in masked
    assert secret[:3] in masked or "***" in masked


def test_key_endpoints_never_return_plaintext(client, make_user):
    """PUT returns a mask; GET shows configured state without the value."""
    user = make_user(prefix="byok")
    secret = "sk-test-abcdef123456secret"

    put = client.put(
        "/api/v1/users/me/keys/openai",
        json={"key": secret},
        headers=user["headers"],
    )
    assert put.status_code == 200, put.text
    assert secret not in put.text
    assert put.json()["configured"] is True

    got = client.get("/api/v1/users/me/keys", headers=user["headers"])
    assert got.status_code == 200
    body = got.json()
    assert body["openai"]["configured"] is True
    assert secret not in got.text

    dele = client.delete("/api/v1/users/me/keys/openai", headers=user["headers"])
    assert dele.status_code == 200
    assert client.get("/api/v1/users/me/keys", headers=user["headers"]).json()[
        "openai"
    ]["configured"] is False


def test_unknown_provider_rejected(client, make_user):
    """Providers outside the allowlist fail fast with a specific message."""
    user = make_user(prefix="byok_bad")
    resp = client.put(
        "/api/v1/users/me/keys/evillm",
        json={"key": "whatever"},
        headers=user["headers"],
    )
    assert resp.status_code == 400
    assert "Unknown provider" in resp.json()["detail"]
