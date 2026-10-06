"""add users.api_keys column

Revision ID: c9f1e2a4b7d5
Revises: 4431ec541021
Create Date: 2026-10-06
"""
from alembic import op
import sqlalchemy as sa

revision = "c9f1e2a4b7d5"
down_revision = "4431ec541021"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    table = bind.execute(
        sa.text("SELECT 1 FROM information_schema.tables WHERE table_name = 'users'")
    ).fetchone()
    if not table:
        # Table does not exist yet - Base.metadata.create_all will create it
        # with the api_keys column already present.
        return
    column = bind.execute(
        sa.text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_name = 'users' AND column_name = 'api_keys'"
        )
    ).fetchone()
    if not column:
        op.add_column("users", sa.Column("api_keys", sa.Text(), nullable=True))


def downgrade():
    bind = op.get_bind()
    column = bind.execute(
        sa.text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_name = 'users' AND column_name = 'api_keys'"
        )
    ).fetchone()
    if column:
        op.drop_column("users", "api_keys")
