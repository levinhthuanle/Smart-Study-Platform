"""Add channels table and channel_id to messages

Revision ID: c8f0e3d9a2b1
Revises: 54fe5fd476ee
Create Date: 2026-05-16 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c8f0e3d9a2b1'
down_revision: Union[str, Sequence[str], None] = '54fe5fd476ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
	"""Upgrade schema."""
	# Create channels table
	op.create_table('channels',
		sa.Column('channel_id', sa.Integer(), nullable=False),
		sa.Column('workspace_id', sa.Integer(), nullable=False),
		sa.Column('name', sa.String(length=255), nullable=False),
		sa.Column('description', sa.String(length=500), nullable=True),
		sa.Column('color', sa.String(length=7), nullable=False, server_default='#3B82F6'),
		sa.Column('created_by', sa.Integer(), nullable=False),
		sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
		sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.workspace_id'], ),
		sa.ForeignKeyConstraint(['created_by'], ['users.user_id'], ),
		sa.PrimaryKeyConstraint('channel_id')
	)
	op.create_index(op.f('ix_channels_channel_id'), 'channels', ['channel_id'], unique=False)
	op.create_index(op.f('ix_channels_workspace_id'), 'channels', ['workspace_id'], unique=False)

	# Add channel_id to messages
	op.add_column('messages', sa.Column('channel_id', sa.Integer(), nullable=True))
	op.create_index(op.f('ix_messages_channel_id'), 'messages', ['channel_id'], unique=False)
	op.create_foreign_key(
		'fk_messages_channel_id',
		'messages', 'channels',
		['channel_id'], ['channel_id']
	)

	# Set default channel for existing messages, then make it NOT NULL
	# First, create a default channel for each workspace
	op.execute('''
		INSERT INTO channels (workspace_id, name, description, color, created_by, created_at)
		SELECT DISTINCT w.workspace_id, 'general', 'General channel', '#3B82F6', w.owner_id, now()
		FROM workspaces w
	''')

	# Update existing messages with default channel
	op.execute('''
		UPDATE messages m
		SET channel_id = (
			SELECT c.channel_id FROM channels c
			WHERE c.workspace_id = m.workspace_id AND c.name = 'general'
			LIMIT 1
		)
		WHERE m.channel_id IS NULL
	''')

	# Now make channel_id NOT NULL
	op.alter_column('messages', 'channel_id', nullable=False, existing_type=sa.Integer())


def downgrade() -> None:
	"""Downgrade schema."""
	# Remove channel_id from messages
	op.drop_constraint('fk_messages_channel_id', 'messages', type_='foreignkey')
	op.drop_index(op.f('ix_messages_channel_id'), 'messages')
	op.drop_column('messages', 'channel_id')

	# Drop channels table
	op.drop_index(op.f('ix_channels_workspace_id'), 'channels')
	op.drop_index(op.f('ix_channels_channel_id'), 'channels')
	op.drop_table('channels')
