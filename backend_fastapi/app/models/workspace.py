from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.sql import func

from app.db.database import Base

# Role hierarchy (higher = more power): viewer < member < admin < owner
ROLE_HIERARCHY = ("viewer", "member", "admin", "owner")


class Workspace(Base):
    """A tenant boundary: documents, conversations, chunks and audit rows scope to it."""

    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class WorkspaceMember(Base):
    """Membership of a user in a workspace with an explicit role."""

    __tablename__ = "workspace_members"
    __table_args__ = (
        UniqueConstraint("workspace_id", "user_id", name="uq_workspace_user"),
    )

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(16), nullable=False, default="member")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
