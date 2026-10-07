"""add audit_logs table

Revision ID: e3a7c9d14b2f
Revises: c9f1e2a4b7d5, a1b2c3d4e5f6
Create Date: 2026-10-06
"""
from alembic import op
import sqlalchemy as sa

revision = "e3a7c9d14b2f"
down_revision = ("c9f1e2a4b7d5", "a1b2c3d4e5f6")
branch_labels = None
depends_on = None

TABLE = "audit_logs"


def upgrade():
    bind = op.get_bind()
    table = bind.execute(
        sa.text("SELECT 1 FROM information_schema.tables WHERE table_name = :t"),
        {"t": TABLE},
    ).fetchone()
    if table:
        # Base.metadata.create_all already built it with the final schema
        return
    op.create_table(
        TABLE,
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.String(64), nullable=False),
        sa.Column("resource_type", sa.String(32), nullable=True),
        sa.Column("resource_id", sa.String(64), nullable=True),
        sa.Column("detail", sa.Text(), nullable=True),
        sa.Column("ip", sa.String(64), nullable=True),
        sa.Column("request_id", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_audit_logs_user_id", TABLE, ["user_id"])
    op.create_index("ix_audit_logs_action", TABLE, ["action"])
    op.create_index("ix_audit_logs_request_id", TABLE, ["request_id"])
    op.create_index("ix_audit_logs_created_at", TABLE, ["created_at"])


def downgrade():
    bind = op.get_bind()
    table = bind.execute(
        sa.text("SELECT 1 FROM information_schema.tables WHERE table_name = :t"),
        {"t": TABLE},
    ).fetchone()
    if table:
        op.drop_table(TABLE)
