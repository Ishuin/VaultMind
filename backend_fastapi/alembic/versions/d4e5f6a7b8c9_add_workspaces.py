"""add workspaces, members, and workspace scoping columns

Revision ID: d4e5f6a7b8c9
Revises: c8d4e2f6a7b1
Create Date: 2026-10-22
"""
from alembic import op
import sqlalchemy as sa

revision = "d4e5f6a7b8c9"
down_revision = "c8d4e2f6a7b1"
branch_labels = None
depends_on = None

SCOPED_TABLES = ("documents", "conversations", "audit_logs")


def _table_exists(bind, name: str) -> bool:
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


def _column_exists(bind, table: str, column: str) -> bool:
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


def _index_exists(bind, name: str) -> bool:
    return (
        bind.execute(
            sa.text(
                "SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = :n"
            ),
            {"n": name},
        ).fetchone()
        is not None
    )


def upgrade():
    bind = op.get_bind()

    if not _table_exists(bind, "workspaces"):
        op.create_table(
            "workspaces",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("name", sa.String(200), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
        )
        op.create_index("ix_workspaces_id", "workspaces", ["id"])

    if not _table_exists(bind, "workspace_members"):
        op.create_table(
            "workspace_members",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column(
                "workspace_id", sa.Integer(), sa.ForeignKey("workspaces.id"), nullable=False
            ),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("role", sa.String(16), nullable=False, server_default="member"),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
            sa.UniqueConstraint("workspace_id", "user_id", name="uq_workspace_user"),
        )
        op.create_index("ix_workspace_members_id", "workspace_members", ["id"])
        op.create_index("ix_workspace_members_workspace_id", "workspace_members", ["workspace_id"])
        op.create_index("ix_workspace_members_user_id", "workspace_members", ["user_id"])

    for table in SCOPED_TABLES:
        if not _column_exists(bind, table, "workspace_id"):
            op.add_column(
                table,
                sa.Column(
                    "workspace_id", sa.Integer(), sa.ForeignKey("workspaces.id"), nullable=True
                ),
            )
        idx = f"ix_{table}_workspace_id"
        if not _index_exists(bind, idx):
            op.create_index(idx, table, ["workspace_id"])

    # Backfill: give every existing user a personal workspace (owner) and
    # attach their orphan rows to it. Lazy creation in workspace_service
    # covers users created after this migration.
    users = bind.execute(sa.text("SELECT id, username FROM users ORDER BY id")).fetchall()
    for user_id, username in users:
        member = bind.execute(
            sa.text(
                "SELECT 1 FROM workspace_members WHERE user_id = :u LIMIT 1"
            ),
            {"u": user_id},
        ).fetchone()
        if member:
            ws_id = bind.execute(
                sa.text(
                    "SELECT m.workspace_id FROM workspace_members m "
                    "WHERE m.user_id = :u LIMIT 1"
                ),
                {"u": user_id},
            ).scalar()
        else:
            ws_id = bind.execute(
                sa.text(
                    "INSERT INTO workspaces (name, created_at) "
                    "VALUES (:name, now()) RETURNING id"
                ),
                {"name": f"{username}'s workspace"},
            ).scalar()
            bind.execute(
                sa.text(
                    "INSERT INTO workspace_members "
                    "(workspace_id, user_id, role, created_at) "
                    "VALUES (:w, :u, 'owner', now())"
                ),
                {"w": ws_id, "u": user_id},
            )
        for table in SCOPED_TABLES:
            bind.execute(
                sa.text(
                    f"UPDATE {table} SET workspace_id = :w "
                    "WHERE user_id = :u AND workspace_id IS NULL"
                ),
                {"w": ws_id, "u": user_id},
            )


def downgrade():
    bind = op.get_bind()
    for table in SCOPED_TABLES:
        if _index_exists(bind, f"ix_{table}_workspace_id"):
            op.drop_index(f"ix_{table}_workspace_id", table_name=table)
        if _column_exists(bind, table, "workspace_id"):
            op.drop_column(table, "workspace_id")
    for name in ("workspace_members", "workspaces"):
        if _table_exists(bind, name):
            op.drop_table(name)
