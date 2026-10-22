"""Shared pytest fixtures: one app client, per-test user creation, guaranteed cleanup."""
import asyncio
import uuid

import pytest
from fastapi.testclient import TestClient

from app.db.database import SessionLocal
from app.main import app
from app.models.audit_log import AuditLog
from app.models.chat_message import ChatMessage
from app.models.conversation import Conversation
from app.models.document import Document
from app.models.subscription import Subscription
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.services.vector_service import vector_service

PASSWORD = "Str0ngPass!123"


@pytest.fixture(scope="session")
def client():
    """A single TestClient so app startup (model load, caches) runs once."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def cleanup():
    """Collects ids of users created during a test; removes their rows afterwards."""
    ids = []
    yield ids
    db = SessionLocal()
    try:
        for uid in ids:
            conv_ids = [c.id for c in db.query(Conversation).filter(Conversation.user_id == uid)]
            if conv_ids:
                db.query(ChatMessage).filter(ChatMessage.conversation_id.in_(conv_ids)).delete(
                    synchronize_session=False
                )
            db.query(Conversation).filter(Conversation.user_id == uid).delete()
            for doc in db.query(Document).filter(Document.user_id == uid).all():
                try:
                    asyncio.run(vector_service.delete_by_document_id(doc.id))
                except Exception:
                    pass
            db.query(Document).filter(Document.user_id == uid).delete()
            db.query(AuditLog).filter(AuditLog.user_id == uid).delete()
            db.query(Subscription).filter(Subscription.user_id == uid).delete()
            # Workspaces: drop this user's memberships, then any workspace
            # that no longer has members (personal workspaces die with their user)
            ws_ids = [
                m.workspace_id
                for m in db.query(WorkspaceMember).filter(WorkspaceMember.user_id == uid)
            ]
            db.query(WorkspaceMember).filter(WorkspaceMember.user_id == uid).delete(
                synchronize_session=False
            )
            if ws_ids:
                empty = [
                    w.id
                    for w in db.query(Workspace).filter(Workspace.id.in_(ws_ids))
                    if not db.query(WorkspaceMember)
                    .filter(WorkspaceMember.workspace_id == w.id)
                    .count()
                ]
                if empty:
                    db.query(Workspace).filter(Workspace.id.in_(empty)).delete(
                        synchronize_session=False
                    )
            db.query(User).filter(User.id == uid).delete()
        db.commit()
    finally:
        db.close()


@pytest.fixture
def make_user(client, cleanup):
    """Factory: creates a user and returns {id, email, password, token}."""

    def _make(prefix="t", admin: bool = False):
        suffix = uuid.uuid4().hex[:8]
        email = f"{prefix}_{suffix}@example.com"
        username = f"{prefix}_{suffix}"
        resp = client.post(
            "/api/v1/users/",
            json={"email": email, "username": username, "password": PASSWORD},
        )
        assert resp.status_code == 200, resp.text
        uid = resp.json()["id"]
        cleanup.append(uid)

        if admin:
            db = SessionLocal()
            try:
                db.query(User).filter(User.id == uid).update({"is_superuser": True})
                db.commit()
            finally:
                db.close()

        login = client.post(
            "/api/v1/login/access-token",
            data={"username": email, "password": PASSWORD},
        )
        assert login.status_code == 200, login.text
        token = login.json()["access_token"]
        return {
            "id": uid,
            "email": email,
            "username": username,
            "password": PASSWORD,
            "token": token,
            "headers": {"Authorization": f"Bearer {token}"},
        }

    return _make
