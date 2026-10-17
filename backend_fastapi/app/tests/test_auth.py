"""Auth flow: register, login, rejection of bad credentials, current-user profile."""
from app.db.database import SessionLocal
from app.models.audit_log import AuditLog

from .conftest import PASSWORD


def test_register_login_and_me(client, make_user):
    """A new user can register, log in, and read their own profile."""
    user = make_user(prefix="auth")

    me = client.get("/api/v1/users/me", headers=user["headers"])
    assert me.status_code == 200
    body = me.json()
    assert body["id"] == user["id"]
    assert body["email"] == user["email"]
    assert PASSWORD not in me.text


def test_bad_password_is_rejected_and_audited(client, make_user):
    """Wrong password returns 400 and writes an auth.login_failed audit row."""
    user = make_user(prefix="badpw")

    resp = client.post(
        "/api/v1/login/access-token",
        data={"username": user["email"], "password": "wrong-password"},
    )
    assert resp.status_code == 400
    assert "Incorrect" in resp.json()["detail"]

    db = SessionLocal()
    try:
        row = (
            db.query(AuditLog)
            .filter(AuditLog.user_id == user["id"], AuditLog.action == "auth.login_failed")
            .first()
        )
        assert row is not None, "failed login must be audited"
        assert row.ip, "audit row must record client ip"
    finally:
        db.close()


def test_requires_token_for_protected_routes(client):
    """Unauthenticated access to protected routes returns 401, not data."""
    for path in ("/api/v1/users/me", "/api/v1/audit/", "/api/v1/audit/export", "/api/v1/sources/"):
        assert client.get(path).status_code == 401, path


def test_duplicate_registration_rejected(client, make_user):
    """Registering an existing email returns a clear 400."""
    user = make_user(prefix="dup")
    resp = client.post(
        "/api/v1/users/",
        json={"email": user["email"], "username": "someone_else", "password": PASSWORD},
    )
    assert resp.status_code == 400
    assert "exists" in resp.json()["detail"]
