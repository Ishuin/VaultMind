"""A5 privacy controls: full-account export + GDPR hard delete."""
import json

from app.db.database import SessionLocal
from app.models.audit_log import AuditLog
from app.models.chat_message import ChatMessage
from app.models.conversation import Conversation
from app.models.document import Document
from app.models.user import User


def _seed_full_account(client, user):
    """Give the user real data: an ingested source, a conversation, a message."""
    resp = client.post(
        "/api/v1/sources/upload",
        files={"file": ("privacy.txt", b"My private note about Project X.", "text/plain")},
        headers=user["headers"],
    )
    assert resp.status_code == 200, resp.text

    convo = client.post("/api/v1/conversations/", headers=user["headers"])
    assert convo.status_code == 200, convo.text
    convo_id = convo.json()["id"]

    db = SessionLocal()
    try:
        db.add(ChatMessage(conversation_id=convo_id, role="user", content="secret question"))
        db.add(ChatMessage(conversation_id=convo_id, role="assistant", content="secret answer"))
        db.commit()
    finally:
        db.close()
    return convo_id


def test_export_returns_everything_but_no_secrets(client, make_user):
    """Export carries profile, sources, chat, chunks, audit — never credentials."""
    user = make_user(prefix="priv_exp")
    _seed_full_account(client, user)

    resp = client.get("/api/v1/users/me/export", headers=user["headers"])
    assert resp.status_code == 200
    assert "attachment" in resp.headers["content-disposition"]

    payload = json.loads(resp.text)
    assert payload["profile"]["email"] == user["email"]
    assert any(d["filename"].startswith("privacy.txt") for d in payload["documents"])
    messages = payload["conversations"][0]["messages"]
    assert [m["content"] for m in messages] == ["secret question", "secret answer"]
    assert payload["vector_chunks"], "ingested source must appear in the vector export"
    assert any("Project X" in (c["text"] or "") for c in payload["vector_chunks"])
    assert payload["audit_events"], "audit trail is part of the export"

    raw = resp.text
    assert "hashed_password" not in raw, "password hash must never be exported"
    assert "api_keys" not in raw, "encrypted key blobs must never be exported"
    assert "Str0ngPass" not in raw, "the password itself must never appear"


def test_hard_delete_removes_rows_everywhere(client, make_user):
    """Delete wipes Postgres rows, vector chunks, and kills the session."""
    from app.db.lancedb import get_lancedb

    user = make_user(prefix="priv_del")
    convo_id = _seed_full_account(client, user)
    uid = user["id"]

    resp = client.delete("/api/v1/users/me", headers=user["headers"])
    assert resp.status_code == 200, resp.text
    counts = resp.json()["deleted"]
    assert counts["user"] == 1

    db = SessionLocal()
    try:
        assert db.query(User).filter(User.id == uid).one_or_none() is None, "user row must go"
        assert db.query(Document).filter(Document.user_id == uid).count() == 0
        assert db.query(Conversation).filter(Conversation.user_id == uid).count() == 0
        assert (
            db.query(ChatMessage).filter(ChatMessage.conversation_id == convo_id).count() == 0
        ), "messages must be removed with their conversation"
        assert db.query(AuditLog).filter(AuditLog.user_id == uid).count() == 0, (
            "audit rows are PII-linked and must be removed"
        )
    finally:
        db.close()

    table = get_lancedb().open_table("document_chunks")
    remaining = table.search().where(f"user_id = {uid}").limit(10).to_list()
    assert remaining == [], f"vector store leaked {len(remaining)} chunks"

    # Old token must die: the user row it points at no longer exists.
    # deps.get_current_user returns 404 for an unknown user id (never 200),
    # which also avoids disclosing whether the account existed.
    me = client.get("/api/v1/users/me", headers=user["headers"])
    assert me.status_code in (401, 403, 404)
    assert me.status_code != 200, "a deleted account must not resolve from its old token"

    # Re-login must fail too (400 "incorrect credentials" for unknown accounts).
    login = client.post(
        "/api/v1/login/access-token",
        data={"username": user["email"], "password": user["password"]},
    )
    assert login.status_code in (400, 401), "deleted accounts must not authenticate"


def test_delete_requires_auth(client):
    """Unauthenticated delete/export attempts are rejected."""
    assert client.delete("/api/v1/users/me").status_code in (401, 403)
    assert client.get("/api/v1/users/me/export").status_code in (401, 403)
