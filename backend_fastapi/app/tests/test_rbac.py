"""RBAC: admin-only user directory; role-scoped audit visibility."""


def test_regular_user_cannot_list_directory(client, make_user):
    """GET /users/ returns 403 for a non-admin."""
    user = make_user(prefix="rbac_user")
    resp = client.get("/api/v1/users/", headers=user["headers"])
    assert resp.status_code == 403
    assert "privileges" in resp.json()["detail"].lower()


def test_admin_can_list_directory_without_hashes(client, make_user):
    """Admin gets 200 and sees users, but never password hashes."""
    admin = make_user(prefix="rbac_admin", admin=True)
    member = make_user(prefix="rbac_member")

    resp = client.get("/api/v1/users/", headers=admin["headers"])
    assert resp.status_code == 200
    listing = resp.json()
    assert any(u["id"] == member["id"] for u in listing)
    assert "hashed_password" not in resp.text
    assert member["password"] not in resp.text


def test_admin_promotion_takes_effect_immediately(client, make_user):
    """is_superuser flips permission on the very next request (token unchanged)."""
    user = make_user(prefix="rbac_promo")
    assert client.get("/api/v1/users/", headers=user["headers"]).status_code == 403

    from app.db.database import SessionLocal
    from app.models.user import User

    db = SessionLocal()
    try:
        db.query(User).filter(User.id == user["id"]).update({"is_superuser": True})
        db.commit()
    finally:
        db.close()

    assert client.get("/api/v1/users/", headers=user["headers"]).status_code == 200
