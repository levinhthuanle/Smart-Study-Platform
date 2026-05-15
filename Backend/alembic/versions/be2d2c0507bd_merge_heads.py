"""merge heads

Revision ID: be2d2c0507bd
Revises: 4570b8bc29dc, c8f0e3d9a2b1
Create Date: 2026-05-16 00:22:44.351225

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'be2d2c0507bd'
down_revision: Union[str, Sequence[str], None] = ('4570b8bc29dc', 'c8f0e3d9a2b1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
