"""Usage-time plan enforcement (H3): free vs trial vs paid, on upload and chat.

Limits come from quota_service.USAGE_LIMITS (free: 20 docs / 100 MB / 50
messages per day); paid tiers are unlimited. Tests seed real usage rows, then
exercise the live endpoints.
"""
from datetime import datetime, timedelta, timezone

from app.db.database import SessionLocal
from app.models.chat_message import ChatMessage
from app.models.conversation import Conversation
from app.models.document import Document
from app.models.user import User

MB = 1024 * 1024


def _set_tier(user_id: int, tier: str, trial_end: datetime | None = None) -> None:
    db = SessionLocal()
    try:
        values = {"subscription_tier": tier}
        if trial_end is not None:
            values["trial_end_date"] = trial_end
        db.query(User).filter(User.id == user_id).update(values)
        db.commit()
    finally:
        db.close()


def _seed_documents(user_id: int, count: int, size_bytes: int = 0) -> None:
    db = SessionLocal()
    try:
        for i in range(count):
            db.add(
                Document(
                    filename=f"seed_{i}.txt",
                    content_type="text/plain",
                    user_id=user_id,
                    file_size=size_bytes,
                    processing_status="completed",
                )
            )
        db.commit()
    finally:
        db.close()


def _count_documents(user_id: int) -> int:
    db = SessionLocal()
    try:
        return (
            db.query(Document).filter(Document.user_id == user_id).count()
        )
    finally:
        db.close()


def _seed_user_messages(user_id: int, count: int) -> None:
    """Insert `count` user-role messages stamped today (the quota window)."""
    db = SessionLocal()
    try:
        convo = Conversation(user_id=user_id, title="quota probe")
        db.add(convo)
        db.flush()
        now = datetime.now(timezone.utc)
        for i in range(count):
            db.add(
                ChatMessage(
                    conversation_id=convo.id,
                    role="user",
                    content=f"seed message {i}",
                    created_at=now,
                )
            )
        db.commit()
    finally:
        db.close()


def _count_user_messages(user_id: int) -> int:
    db = SessionLocal()
    try:
        return (
            db.query(ChatMessage)
            .join(Conversation, ChatMessage.conversation_id == Conversation.id)
            .filter(Conversation.user_id == user_id, ChatMessage.role == "user")
            .count()
        )
    finally:
        db.close()


def _upload(client, user):
    return client.post(
        "/api/v1/sources/upload",
        files={"file": ("probe.txt", b"small probe content", "text/plain")},
        headers=user["headers"],
    )


def test_free_user_blocked_at_document_cap(client, make_user):
    """At 20/20 documents a free user's next upload returns 402 with an upgrade hint.

    Registration starts everyone on an active trial, so the test explicitly
    moves the user into the free (post-cancel) state first.
    """
    user = make_user(prefix="q_free")
    _set_tier(user["id"], "free")
    _seed_documents(user["id"], 20)

    resp = _upload(client, user)

    assert resp.status_code == 402, resp.text
    detail = resp.json()["detail"]
    assert detail["code"] == "plan_limit_exceeded"
    assert detail["limit"] == "max_documents"
    assert detail["tier"] == "free"
    assert "upgrade" in detail["message"].lower()
    assert _count_documents(user["id"]) == 20, "rejected upload must not create a row"


def test_free_user_blocked_at_storage_cap(client, make_user):
    """Storage is enforced independently of document count: 2x60MB > 100MB free cap."""
    user = make_user(prefix="q_stor")
    _set_tier(user["id"], "free")
    _seed_documents(user["id"], 2, size_bytes=60 * MB)

    resp = _upload(client, user)

    assert resp.status_code == 402, resp.text
    detail = resp.json()["detail"]
    assert detail["limit"] == "max_storage_mb"
    assert "100 MB" in detail["message"]


def test_trial_user_passes_caps_that_block_free(client, make_user):
    """25 docs / 250MB exceed both free caps but sit inside the trial caps."""
    user = make_user(prefix="q_trial")
    _set_tier(
        user["id"], "trial", trial_end=datetime.now(timezone.utc) + timedelta(days=7)
    )
    _seed_documents(user["id"], 25, size_bytes=10 * MB)

    resp = _upload(client, user)

    assert resp.status_code == 200, resp.text


def test_paid_user_has_no_caps(client, make_user):
    """A founder tier is unlimited: volumes that block free/trial upload fine."""
    user = make_user(prefix="q_paid")
    _set_tier(user["id"], "founder_1")
    _seed_documents(user["id"], 30, size_bytes=60 * MB)  # 30 docs, 1800MB

    resp = _upload(client, user)

    assert resp.status_code == 200, resp.text


def test_expired_trial_falls_back_to_free_caps(client, make_user):
    """A trial whose end date passed is enforced as free, even if the column says trial."""
    user = make_user(prefix="q_exp")
    _set_tier(
        user["id"], "trial", trial_end=datetime.now(timezone.utc) - timedelta(days=1)
    )
    _seed_documents(user["id"], 25)  # inside trial cap100, over free cap20

    resp = _upload(client, user)

    assert resp.status_code == 402, resp.text
    assert resp.json()["detail"]["tier"] == "free"


def test_free_user_chat_blocked_at_daily_cap(client, make_user):
    """At 50/50 messages today the chat query returns 402 before persisting anything."""
    user = make_user(prefix="q_chat_f")
    _set_tier(user["id"], "free")
    _seed_user_messages(user["id"], 50)

    resp = client.post(
        "/api/v1/chat/query",
        json={"query": "hello", "provider": "openai"},
        headers=user["headers"],
    )

    assert resp.status_code == 402, resp.text
    detail = resp.json()["detail"]
    assert detail["limit"] == "max_chat_messages_per_day"
    assert detail["tier"] == "free"
    assert _count_user_messages(user["id"]) == 50, "the gate must run before the message is saved"


def test_paid_user_chat_not_quota_blocked(client, make_user):
    """Past the free daily cap, a founder still sails through the quota gate (stops at key resolution)."""
    user = make_user(prefix="q_chat_p")
    _set_tier(user["id"], "founder_1")
    _seed_user_messages(user["id"], 60)

    resp = client.post(
        "/api/v1/chat/query",
        json={"query": "hello", "provider": "openai"},
        headers=user["headers"],
    )

    # No provider keys are configured in CI or local .env, so a request that
    # passes the quota gate deterministically stops at key resolution.
    assert resp.status_code == 401, resp.text
    assert resp.json()["detail"]["code"] == "missing_api_key"
    assert _count_user_messages(user["id"]) == 60, "failed request must not consume quota"
