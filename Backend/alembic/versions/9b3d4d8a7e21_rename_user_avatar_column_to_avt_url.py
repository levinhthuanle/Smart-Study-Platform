"""rename user avatar column to avt_url

Revision ID: 9b3d4d8a7e21
Revises: d7c2e1a9b8f1
Create Date: 2026-05-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '9b3d4d8a7e21'
down_revision: Union[str, Sequence[str], None] = 'd7c2e1a9b8f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('users', 'avt_ur', new_column_name='avt_url')


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('users', 'avt_url', new_column_name='avt_ur')