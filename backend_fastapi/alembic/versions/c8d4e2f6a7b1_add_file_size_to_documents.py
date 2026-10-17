"""add documents.file_size for storage-quota accounting

Revision ID: c8d4e2f6a7b1
Revises: b7c3d9e1f4a2
Create Date: 2026-10-17
"""
from alembic import op
import sqlalchemy as sa

revision = "c8d4e2f6a7b1"
down_revision = "b7c3d9e1f4a2"
branch_labels = None
depends_on = None

TABLE = "documents"
COLUMN = "file_size"


def upgrade():
    bind = op.get_bind()
    exists = bind.execute(
        sa.text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_schema = 'public' AND table_name = :t AND column_name = :c"
        ),
        {"t": TABLE, "c": COLUMN},
    ).fetchone()
    if not exists:
        op.add_column(TABLE, sa.Column(COLUMN, sa.Integer(), nullable=True))


def downgrade():
    bind = op.get_bind()
    exists = bind.execute(
        sa.text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_schema = 'public' AND table_name = :t AND column_name = :c"
        ),
        {"t": TABLE, "c": COLUMN},
    ).fetchone()
    if exists:
        op.drop_column(TABLE, COLUMN)
