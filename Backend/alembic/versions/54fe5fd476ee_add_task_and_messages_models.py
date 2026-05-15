"""Add Task and Messages models

Revision ID: 54fe5fd476ee
Revises: 82bd834f65fb
Create Date: 2026-05-15 22:37:38.924710

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '54fe5fd476ee'
down_revision: Union[str, Sequence[str], None] = '82bd834f65fb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('tasks',
    sa.Column('task_id', sa.Integer(), nullable=False),
    sa.Column('workspace_id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('status', sa.String(length=255), nullable=False),
    sa.Column('assigned_to', sa.Integer(), nullable=False),
    sa.Column('due_date', sa.TIMESTAMP(timezone=True), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['assigned_to'], ['users.user_id'], ),
    sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.workspace_id'], ),
    sa.PrimaryKeyConstraint('task_id')
    )
    op.create_index(op.f('ix_tasks_task_id'), 'tasks', ['task_id'], unique=False)
    op.create_table('messages',
    sa.Column('message_id', sa.Integer(), nullable=False),
    sa.Column('workspace_id', sa.Integer(), nullable=False),
    sa.Column('sender_id', sa.Integer(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['sender_id'], ['users.user_id'], ),
    sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.workspace_id'], ),
    sa.PrimaryKeyConstraint('message_id')
    )
    op.create_index(op.f('ix_messages_message_id'), 'messages', ['message_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_messages_message_id'), table_name='messages')
    op.drop_table('messages')
    op.drop_index(op.f('ix_tasks_task_id'), table_name='tasks')
    op.drop_table('tasks')
