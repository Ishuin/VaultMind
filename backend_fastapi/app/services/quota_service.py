"""Usage-time plan enforcement (H3).

Checks document count, total storage, and daily chat volume against the
caller's plan *at the moment of use*, not only at purchase time. Paid tiers
are unlimited; free and trial are capped. Trial users fall back to the free
caps once their trial has expired.
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage
from app.models.conversation import Conversation
from app.models.document import Document
from app.models.user import User

# Per-tier usage caps. Any tier listed here is limited; tiers absent from the
# table (see PAID_TIERS) are unlimited by design.
USAGE_LIMITS = {
    "free": {
        "max_documents": 20,
        "max_storage_mb": 100,
        "max_chat_messages_per_day": 50,
    },
    "trial": {
        "max_documents": 100,
        "max_storage_mb": 1000,
        "max_chat_messages_per_day": 500,
    },
}

PAID_TIERS = {"founder_1", "founder_2", "founder_3", "standard", "lifetime"}

_BYTES_PER_MB = 1024 * 1024


def effective_tier(user: User) -> str:
    """Resolve the tier whose limits apply right now.

    An expired trial counts as free, even though the stored column still
    says "trial".
    """
    tier = user.subscription_tier or "free"
    if tier == "trial":
        end = user.trial_end_date
        if end is not None:
            if end.tzinfo is None:
                end = end.replace(tzinfo=timezone.utc)
            if end <= datetime.now(timezone.utc):
                return "free"
    return tier


def _limits_for(tier: str) -> Optional[dict]:
    """Return the cap table for a tier, or None when the tier is unlimited."""
    if tier in USAGE_LIMITS:
        return USAGE_LIMITS[tier]
    if tier in PAID_TIERS:
        return None
    # Unknown tiers fail safe to the free caps instead of unlimited.
    return USAGE_LIMITS["free"]


def usage_summary(db: Session, user_id: int) -> dict:
    """Current usage for one user: document count and stored bytes."""
    doc_count, storage_bytes = (
        db.query(
            func.count(Document.id),
            func.coalesce(func.sum(Document.file_size), 0),
        )
        .filter(Document.user_id == user_id)
        .one()
    )
    return {"documents": doc_count or 0, "storage_bytes": int(storage_bytes or 0)}


def _raise(limit: str, message: str, tier: str) -> None:
    raise HTTPException(
        status_code=402,
        detail={
            "code": "plan_limit_exceeded",
            "limit": limit,
            "tier": tier,
            "message": message,
        },
    )


def assert_can_upload(db: Session, user: User, incoming_bytes: int) -> None:
    """Raise 402 if this upload would exceed the user's document or storage cap."""
    tier = effective_tier(user)
    limits = _limits_for(tier)
    if limits is None:
        return

    usage = usage_summary(db, user.id)

    if usage["documents"] >= limits["max_documents"]:
        _raise(
            "max_documents",
            f"Document limit reached: {limits['max_documents']} documents on the "
            f"{tier} plan. Delete some sources or upgrade to add more.",
            tier,
        )

    projected_mb = (usage["storage_bytes"] + incoming_bytes) / _BYTES_PER_MB
    if projected_mb > limits["max_storage_mb"]:
        _raise(
            "max_storage_mb",
            f"Storage limit reached: {limits['max_storage_mb']} MB on the {tier} "
            f"plan (you have used {usage['storage_bytes'] / _BYTES_PER_MB:.1f} MB). "
            f"Delete some sources or upgrade for more space.",
            tier,
        )


def assert_can_chat(db: Session, user: User) -> None:
    """Raise 402 if the user already hit today's cap of messages they sent."""
    tier = effective_tier(user)
    limits = _limits_for(tier)
    if limits is None:
        return

    start_of_day = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    sent_today = (
        db.query(func.count(ChatMessage.id))
        .join(Conversation, ChatMessage.conversation_id == Conversation.id)
        .filter(
            Conversation.user_id == user.id,
            ChatMessage.role == "user",
            ChatMessage.created_at >= start_of_day,
        )
        .scalar()
        or 0
    )

    if sent_today >= limits["max_chat_messages_per_day"]:
        _raise(
            "max_chat_messages_per_day",
            f"Daily chat limit reached: {limits['max_chat_messages_per_day']} "
            f"messages per day on the {tier} plan. Upgrade for a higher limit.",
            tier,
        )
