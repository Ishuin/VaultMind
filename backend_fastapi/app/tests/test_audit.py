"""Audit log: writes, per-user scoping, action filter, no secrets in detail."""
from app.db.database import SessionLocal
from app.models.audit_log import AuditLog
from app.services.audit_service import list_events, record


def test_record_writes_and_scopes(client, make_user):
    """record() persists an event; list_events() only returns the caller's rows."""
    alice = make_user(prefix="aud_a")
    bob = make_user(prefix="aud_b")

    db = SessionLocal()
    try:
        record(db, alice["id"], "test.action", detail={"k": "v"})
        record(db, bob["id"], "test.action")

        assert any(
            e.action == "test.action" for e in list_events(db, alice["id"])
        ), "own events must be visible"
        assert all(e.user_id == alice["id"] for e in list_events(db, alice["id"]))

        unscoped = [e for e in list_events(db, None) if e.action == "test.action"]
        assert len(unscoped) >= 2, "admin/unscoped view must see all users"

        db.query(AuditLog).filter(AuditLog.action == "test.action").delete()
        db.commit()
    finally:
        db.close()


def test_record_never_raises_on_broken_session():
    """A failing write is swallowed and logged, never surfacing to the request."""
    class BrokenSession:
        def add(self, _):
            raise RuntimeError("db down")

        def commit(self):
            raise RuntimeError("db down")

        def rollback(self):
            pass

    record(BrokenSession(), 1, "test.broken")  # must not raise


def test_audit_endpoint_filters_by_action(client, make_user):
    """GET /audit/?action= returns only that action, scoped to the caller."""
    user = make_user(prefix="aud_ep")
    client.post(
        "/api/v1/login/access-token",
        data={"username": user["email"], "password": "nope"},
    )

    resp = client.get(
        "/api/v1/audit/?action=auth.login_failed", headers=user["headers"]
    )
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert items, "expected at least the failed-login event"
    assert all(i["action"] == "auth.login_failed" for i in items)
    assert all(i["user_id"] == user["id"] for i in items)


def test_api_key_set_event_has_no_secret(client, make_user):
    """Audit detail for a key write names the provider only, never the value."""
    user = make_user(prefix="aud_key")
    secret = "nvapi-should-never-appear-in-audit"
    client.put(
        "/api/v1/users/me/keys/nvidia",
        json={"key": secret},
        headers=user["headers"],
    )

    resp = client.get("/api/v1/audit/?action=api_key.set", headers=user["headers"])
    assert resp.status_code == 200
    assert secret not in resp.text
