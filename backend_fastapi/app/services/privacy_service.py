"""GDPR-style full-account export and hard delete (A5).

Delete removes every row referencing the user (documents, conversations and their
messages, subscription, audit rows, workspace memberships) plus the vector-store
chunks, in FK-safe order; workspaces left with no members are removed too.
Export returns everything as JSON — never the password hash or encrypted key blobs.
"""
from typing import Any, Dict

from loguru import logger
from sqlalchemy.orm import Session

from app.db.lancedb import get_lancedb
from app.models.audit_log import AuditLog
from app.models.chat_message import ChatMessage
from app.models.conversation import Conversation
from app.models.document import Document
from app.models.subscription import Subscription
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember

EXPORT_FILENAME = "account_export.json"


def export_account(db: Session, user_id: int) -> Dict[str, Any]:
    """Collect the user's profile, sources, chat history, and vector texts."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"user {user_id} not found")

    documents = db.query(Document).filter(Document.user_id == user_id).all()
    conversations = db.query(Conversation).filter(Conversation.user_id == user_id).all()
    audit_rows = db.query(AuditLog).filter(AuditLog.user_id == user_id).all()
    workspace_rows = (
        db.query(WorkspaceMember, Workspace)
        .join(Workspace, Workspace.id == WorkspaceMember.workspace_id)
        .filter(WorkspaceMember.user_id == user_id)
        .all()
    )

    conversation_payloads = []
    for convo in conversations:
        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.conversation_id == convo.id)
            .order_by(ChatMessage.created_at.asc())
            .all()
        )
        conversation_payloads.append(
            {
                "id": convo.id,
                "title": convo.title,
                "created_at": str(convo.created_at),
                "messages": [
                    {
                        "role": m.role,
                        "content": m.content,
                        "created_at": str(m.created_at),
                    }
                    for m in messages
                ],
            }
        )

    return {
        "profile": {
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "subscription_tier": user.subscription_tier,
            "created_at": str(user.created_at),
        },
        "documents": [
            {
                "id": d.id,
                "filename": d.filename,
                "content_type": d.content_type,
                "file_size": d.file_size,
                "processing_status": d.processing_status,
                "created_at": str(d.created_at),
            }
            for d in documents
        ],
        "conversations": conversation_payloads,
        "workspaces": [
            {"name": ws.name, "role": member.role} for member, ws in workspace_rows
        ],
        "vector_chunks": _vector_texts(db, user_id),
        "audit_events": [
            {
                "action": a.action,
                "resource_type": a.resource_type,
                "created_at": str(a.created_at),
            }
            for a in audit_rows
        ],
    }


def _vector_texts(db: Session, user_id: int) -> list:
    """Read the user's chunk texts straight from the vector store (best effort)."""
    try:
        table = get_lancedb().open_table("document_chunks")
        rows = table.search().where(f"user_id = {user_id}").limit(10000).to_list()
        return [{"document_id": r.get("document_id"), "text": r.get("text")} for r in rows]
    except Exception as exc:
        logger.warning(f"Vector export skipped for user {user_id}: {exc}")
        return []


def delete_account(db: Session, user_id: int) -> Dict[str, int]:
    """Hard-delete the user's rows everywhere (Postgres + vector store)."""
    # Vector store first: no orphaned chunks if the DB step later fails loudly.
    vector_rows = 0
    try:
        table = get_lancedb().open_table("document_chunks")
        before = len(table)
        table.delete(f"user_id = {user_id}")
        vector_rows = before - len(table)
    except Exception as exc:
        logger.error(f"Vector delete failed for user {user_id}: {exc}")
        raise RuntimeError(f"vector store delete failed: {exc}") from exc

    conversation_ids = [
        row[0]
        for row in db.query(Conversation.id).filter(Conversation.user_id == user_id)
    ]
    deleted: Dict[str, int] = {}
    if conversation_ids:
        deleted["messages"] = (
            db.query(ChatMessage)
            .filter(ChatMessage.conversation_id.in_(conversation_ids))
            .delete(synchronize_session=False)
        )
    deleted["conversations"] = (
        db.query(Conversation).filter(Conversation.user_id == user_id)
        .delete(synchronize_session=False)
    )
    deleted["documents"] = (
        db.query(Document).filter(Document.user_id == user_id)
        .delete(synchronize_session=False)
    )
    deleted["subscriptions"] = (
        db.query(Subscription).filter(Subscription.user_id == user_id)
        .delete(synchronize_session=False)
    )
    deleted["audit_events"] = (
        db.query(AuditLog).filter(AuditLog.user_id == user_id)
        .delete(synchronize_session=False)
    )

    # Workspaces: drop this user's memberships, then any workspace left with
    # no members (its name may hold the username — reassign refs, then delete).
    member_ws_ids = [
        row[0]
        for row in db.query(WorkspaceMember.workspace_id)
        .filter(WorkspaceMember.user_id == user_id)
        .distinct()
    ]
    deleted["memberships"] = (
        db.query(WorkspaceMember).filter(WorkspaceMember.user_id == user_id)
        .delete(synchronize_session=False)
    )
    if member_ws_ids:
        empty_ws = [
            ws_id
            for ws_id in member_ws_ids
            if not db.query(WorkspaceMember)
            .filter(WorkspaceMember.workspace_id == ws_id)
            .count()
        ]
        if empty_ws:
            for model in (AuditLog, Document, Conversation):
                db.query(model).filter(model.workspace_id.in_(empty_ws)).update(
                    {"workspace_id": None}, synchronize_session=False
                )
            deleted["workspaces"] = (
                db.query(Workspace).filter(Workspace.id.in_(empty_ws))
                .delete(synchronize_session=False)
            )

    deleted["user"] = db.query(User).filter(User.id == user_id).delete(
        synchronize_session=False
    )
    db.commit()

    # Audit AFTER the row delete: this row references no user (FK-safe), keeps no PII.
    from app.services.audit_service import record

    record(db, None, "user.delete", detail={"deleted_user_id": user_id})
    deleted["vector_chunks"] = vector_rows
    logger.info(f"Hard-deleted account {user_id}: {deleted}")
    return deleted
