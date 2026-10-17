"""Ownership scoping: one user's resources are invisible to another."""


def test_sources_scoped_to_owner(client, make_user):
    """Documents uploaded by A never appear in B's source list."""
    alice = make_user(prefix="src_a")
    bob = make_user(prefix="src_b")

    files = {"file": ("note.txt", b"VaultMind scoping probe content.", "text/plain")}
    upload = client.post(
        "/api/v1/sources/upload", files=files, headers=alice["headers"]
    )
    assert upload.status_code == 200, upload.text
    doc_id = upload.json()["document_id"]

    alice_sources = client.get("/api/v1/sources/", headers=alice["headers"]).json()
    assert any(d["id"] == doc_id for d in alice_sources)

    bob_sources = client.get("/api/v1/sources/", headers=bob["headers"]).json()
    assert all(d["id"] != doc_id for d in bob_sources)

    forbidden = client.delete(
        f"/api/v1/sources/{doc_id}", headers=bob["headers"]
    )
    assert forbidden.status_code == 404


def test_conversations_scoped_to_owner(client, make_user):
    """A conversation owned by A returns 404 for B, even with the exact id."""
    alice = make_user(prefix="conv_a")
    bob = make_user(prefix="conv_b")

    created = client.post("/api/v1/conversations/", headers=alice["headers"])
    assert created.status_code == 200
    convo_id = created.json()["id"]

    assert (
        client.get(f"/api/v1/conversations/{convo_id}", headers=bob["headers"]).status_code
        == 404
    )
    assert (
        client.delete(f"/api/v1/conversations/{convo_id}", headers=bob["headers"]).status_code
        == 404
    )
    assert (
        client.get(f"/api/v1/conversations/{convo_id}", headers=alice["headers"]).status_code
        == 200
    )


def test_delete_own_conversation_audited(client, make_user):
    """Deleting your own conversation succeeds and writes an audit row."""
    from app.db.database import SessionLocal
    from app.models.audit_log import AuditLog

    user = make_user(prefix="conv_del")
    convo_id = client.post("/api/v1/conversations/", headers=user["headers"]).json()["id"]

    resp = client.delete(f"/api/v1/conversations/{convo_id}", headers=user["headers"])
    assert resp.status_code == 200

    db = SessionLocal()
    try:
        row = (
            db.query(AuditLog)
            .filter(
                AuditLog.user_id == user["id"], AuditLog.action == "conversation.delete"
            )
            .first()
        )
        assert row is not None
        assert row.resource_id == str(convo_id)
    finally:
        db.close()
