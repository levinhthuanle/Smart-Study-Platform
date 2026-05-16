"""add profile fields and workspace invites

Revision ID: d7c2e1a9b8f1
Revises: f0d05634abad
Create Date: 2026-05-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7c2e1a9b8f1'
down_revision: Union[str, Sequence[str], None] = 'f0d05634abad'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('username', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('avt_ur', sa.String(length=512), nullable=True))
    op.add_column('workspaces', sa.Column('workspace_avt_url', sa.String(length=512), nullable=True))

    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    op.create_table(
        'workspace_invites',
        sa.Column('workspace_invite_id', sa.Integer(), nullable=False),
        sa.Column('workspace_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=128), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('accepted_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('accepted_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['accepted_by'], ['users.user_id']),
        sa.ForeignKeyConstraint(['created_by'], ['users.user_id']),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.workspace_id']),
        sa.PrimaryKeyConstraint('workspace_invite_id'),
    )
    op.create_index(op.f('ix_workspace_invites_workspace_invite_id'), 'workspace_invites', ['workspace_invite_id'], unique=False)
    op.create_index(op.f('ix_workspace_invites_token'), 'workspace_invites', ['token'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_workspace_invites_token'), table_name='workspace_invites')
    op.drop_index(op.f('ix_workspace_invites_workspace_invite_id'), table_name='workspace_invites')
    op.drop_table('workspace_invites')

    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_column('workspaces', 'workspace_avt_url')
    op.drop_column('users', 'avt_ur')
    op.drop_column('users', 'username')
