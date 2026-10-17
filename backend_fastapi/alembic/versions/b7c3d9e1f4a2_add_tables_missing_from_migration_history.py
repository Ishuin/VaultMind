"""add tables and user columns missing from migration history

create_all at app startup builds these, but a fresh database restored via
`alembic upgrade head` alone (CI, disaster recovery) was left without them.

Revision ID: b7c3d9e1f4a2
Revises: e3a7c9d14b2f
Create Date: 2026-10-17
"""
from alembic import op
import sqlalchemy as sa

revision = "b7c3d9e1f4a2"
down_revision = "e3a7c9d14b2f"
branch_labels = None
depends_on = None


def _has_table(bind, name: str) -> bool:
    return (
        bind.execute(
            sa.text(
                "SELECT 1 FROM information_schema.tables "
                "WHERE table_schema = 'public' AND table_name = :t"
            ),
            {"t": name},
        ).fetchone()
        is not None
    )


def _has_column(bind, table: str, column: str) -> bool:
    return (
        bind.execute(
            sa.text(
                "SELECT 1 FROM information_schema.columns "
                "WHERE table_schema = 'public' AND table_name = :t AND column_name = :c"
            ),
            {"t": table, "c": column},
        ).fetchone()
        is not None
    )


def _has_index(bind, name: str) -> bool:
    return (
        bind.execute(
            sa.text("SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = :n"),
            {"n": name},
        ).fetchone()
        is not None
    )


def _create_table_if_missing(bind, name: str, table_args, columns) -> None:
    if _has_table(bind, name):
        return
    op.create_table(name, *columns, *table_args)


def _add_column_if_missing(bind, table: str, column: str, ddl) -> None:
    if not _has_column(bind, table, column):
        op.add_column(table, ddl)


def _create_index_if_missing(bind, name: str, table: str, columns, unique: bool = False) -> None:
    if not _has_index(bind, name):
        op.create_index(name, table, columns, unique=unique)


def upgrade():
    bind = op.get_bind()

    _create_table_if_missing(
        bind,
        "waitlist",
        [
            sa.Index("ix_waitlist_id", "id"),
            sa.Index("ix_waitlist_email", "email", unique=True),
        ],
        [
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("source", sa.String(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
        ],
    )

    _create_table_if_missing(
        bind,
        "conversations",
        [
            sa.Index("ix_conversations_id", "id"),
            sa.Index("ix_conversations_user_id", "user_id"),
        ],
        [
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column(
                "user_id",
                sa.Integer(),
                sa.ForeignKey("users.id"),
                nullable=False,
            ),
            sa.Column("title", sa.String(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        ],
    )

    _create_table_if_missing(
        bind,
        "subscriptions",
        [
            sa.Index("ix_subscriptions_id", "id"),
            sa.UniqueConstraint("user_id"),
            sa.UniqueConstraint("razorpay_subscription_id"),
        ],
        [
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column(
                "user_id",
                sa.Integer(),
                sa.ForeignKey("users.id"),
                nullable=False,
            ),
            sa.Column("plan_id", sa.String(), nullable=False),
            sa.Column("status", sa.String(), nullable=True),
            sa.Column("razorpay_subscription_id", sa.String(), nullable=True),
            sa.Column("razorpay_customer_id", sa.String(), nullable=True),
            sa.Column(
                "trial_start",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
            sa.Column("trial_end", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "current_period_start",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
            sa.Column(
                "current_period_end",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
            sa.Column("is_founder", sa.Boolean(), nullable=True),
            sa.Column("founder_tier", sa.String(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        ],
    )

    _create_table_if_missing(
        bind,
        "chat_messages",
        [
            sa.Index("ix_chat_messages_id", "id"),
            sa.Index("ix_chat_messages_conversation_id", "conversation_id"),
        ],
        [
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column(
                "conversation_id",
                sa.Integer(),
                sa.ForeignKey("conversations.id"),
                nullable=False,
            ),
            sa.Column("role", sa.String(), nullable=False),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
        ],
    )

    _create_index_if_missing(bind, "ix_audit_logs_id", "audit_logs", ["id"])

    _add_column_if_missing(
        bind, "users", "subscription_tier", sa.Column("subscription_tier", sa.String(), nullable=True)
    )
    _add_column_if_missing(
        bind, "users", "trial_end_date", sa.Column("trial_end_date", sa.DateTime(timezone=True), nullable=True)
    )
    _add_column_if_missing(bind, "users", "is_founder", sa.Column("is_founder", sa.Boolean(), nullable=True))
    _add_column_if_missing(
        bind, "users", "search_internet", sa.Column("search_internet", sa.Boolean(), nullable=True)
    )
    _add_column_if_missing(bind, "users", "nim_models_cache", sa.Column("nim_models_cache", sa.Text(), nullable=True))


def downgrade():
    bind = op.get_bind()

    for column in ("subscription_tier", "trial_end_date", "is_founder", "search_internet", "nim_models_cache"):
        if _has_column(bind, "users", column):
            op.drop_column("users", column)

    for table in ("chat_messages", "subscriptions", "conversations", "waitlist"):
        if _has_table(bind, table):
            op.drop_table(table)

    if _has_index(bind, "ix_audit_logs_id"):
        op.drop_index("ix_audit_logs_id", table_name="audit_logs")
