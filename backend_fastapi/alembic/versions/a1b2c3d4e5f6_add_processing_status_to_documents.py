"""Add processing_status and processing_error to documents

Revision ID: a1b2c3d4e5f6
Revises: 4431ec541021
Create Date: 2026-06-16 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '4431ec541021'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add processing_status column with default value for existing rows
    op.add_column('documents', sa.Column('processing_status', sa.String(), nullable=False, server_default='completed'))
    # Add processing_error column (nullable)
    op.add_column('documents', sa.Column('processing_error', sa.Text(), nullable=True))
    # Remove the server default after adding the column (so new rows use the Python default)
    op.alter_column('documents', 'processing_status', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('documents', 'processing_error')
    op.drop_column('documents', 'processing_status')
