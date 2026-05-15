from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.depedencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.channel import Channel
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.channel import (
	ChannelCreate,
	ChannelResponse,
	ChannelUpdate,
)

router = APIRouter(
	prefix="/api",
	tags=["channels"],
)


async def get_accessible_workspace(
	workspace_id: int,
	user_id: int,
	db: AsyncSession,
):
	"""Check if user has access to workspace"""
	result = await db.execute(
		select(WorkspaceMember).where(
			WorkspaceMember.workspace_id == workspace_id,
			WorkspaceMember.user_id == user_id,
		)
	)
	if not result.scalar_one_or_none():
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Access denied to this workspace",
		)


@router.get(
	"/workspaces/{workspace_id}/channels",
	response_model=list[ChannelResponse],
)
async def get_workspace_channels(
	workspace_id: int,
	db: AsyncSession = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	"""Get all channels in a workspace"""
	await get_accessible_workspace(workspace_id, current_user.user_id, db)

	result = await db.execute(
		select(Channel).where(Channel.workspace_id == workspace_id)
	)
	return result.scalars().all()


@router.post(
	"/workspaces/{workspace_id}/channels",
	response_model=ChannelResponse,
	status_code=status.HTTP_201_CREATED,
)
async def create_channel(
	workspace_id: int,
	channel_data: ChannelCreate,
	db: AsyncSession = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	"""Create a new channel in workspace"""
	await get_accessible_workspace(workspace_id, current_user.user_id, db)

	new_channel = Channel(
		workspace_id=workspace_id,
		name=channel_data.name,
		description=channel_data.description,
		color=channel_data.color,
		created_by=current_user.user_id,
	)

	db.add(new_channel)
	await db.commit()
	await db.refresh(new_channel)

	return new_channel


@router.put(
	"/channels/{channel_id}",
	response_model=ChannelResponse,
)
async def update_channel(
	channel_id: int,
	channel_data: ChannelUpdate,
	db: AsyncSession = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	"""Update a channel"""
	result = await db.execute(
		select(Channel).where(Channel.channel_id == channel_id)
	)
	channel = result.scalar_one_or_none()

	if not channel:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Channel not found",
		)

	# Check access
	await get_accessible_workspace(channel.workspace_id, current_user.user_id, db)

	# Update fields
	if channel_data.name is not None:
		channel.name = channel_data.name
	if channel_data.description is not None:
		channel.description = channel_data.description
	if channel_data.color is not None:
		channel.color = channel_data.color

	await db.commit()
	await db.refresh(channel)

	return channel


@router.delete(
	"/channels/{channel_id}",
	status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_channel(
	channel_id: int,
	db: AsyncSession = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	"""Delete a channel"""
	result = await db.execute(
		select(Channel).where(Channel.channel_id == channel_id)
	)
	channel = result.scalar_one_or_none()

	if not channel:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Channel not found",
		)

	# Check access
	await get_accessible_workspace(channel.workspace_id, current_user.user_id, db)

	await db.delete(channel)
	await db.commit()
