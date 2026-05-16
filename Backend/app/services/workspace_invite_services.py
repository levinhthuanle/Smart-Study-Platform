from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workspace import Workspace
from app.models.workspace_invite import WorkspaceInvite
from app.models.workspace_member import WorkspaceMember
from app.schemas.workspace_invite import (
    WorkspaceInvitePreviewResponse,
    WorkspaceInviteResponse,
)
from app.services.workspace_services import get_owned_workspace


async def create_workspace_invite(
    workspace_id: int,
    db: AsyncSession,
    owner_id: int,
):
    workspace = await get_owned_workspace(
        workspace_id,
        db,
        owner_id,
    )

    invite = WorkspaceInvite(
        workspace_id=workspace.workspace_id,
        created_by=owner_id,
        token=await _generate_unique_token(db),
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )

    db.add(invite)
    await db.commit()
    await db.refresh(invite)

    return _serialize_invite(invite, workspace.name)


async def get_workspace_invite_by_token(
    token: str,
    db: AsyncSession,
):
    invite = await _get_invite_by_token(token, db)
    workspace = await _get_workspace(invite.workspace_id, db)

    return WorkspaceInvitePreviewResponse(
        workspace_invite_id=invite.workspace_invite_id,
        workspace_id=invite.workspace_id,
        workspace_name=workspace.name,
        token=invite.token,
        expires_at=invite.expires_at,
        accepted_at=invite.accepted_at,
        is_expired=_is_expired(invite.expires_at),
        is_used=invite.accepted_at is not None,
    )


async def accept_workspace_invite(
    token: str,
    db: AsyncSession,
    user_id: int,
):
    invite = await _get_invite_by_token(token, db)
    workspace = await _get_workspace(invite.workspace_id, db)

    existing_member = await _get_member_by_user_id(
        workspace.workspace_id,
        user_id,
        db,
    )

    if existing_member is not None:
        return existing_member

    if _is_expired(invite.expires_at):
        raise HTTPException(
            status_code=410,
            detail="Invite link expired",
        )

    if invite.accepted_at is not None:
        raise HTTPException(
            status_code=410,
            detail="Invite link already used",
        )

    member = WorkspaceMember(
        workspace_id=workspace.workspace_id,
        user_id=user_id,
        role="member",
    )

    invite.accepted_by = user_id
    invite.accepted_at = datetime.now(timezone.utc)

    db.add(member)
    await db.commit()
    await db.refresh(member)

    return member


async def _generate_unique_token(db: AsyncSession) -> str:
    while True:
        token = token_urlsafe(24)
        result = await db.execute(
            select(WorkspaceInvite).where(
                WorkspaceInvite.token == token,
            )
        )

        if result.scalar_one_or_none() is None:
            return token


async def _get_invite_by_token(
    token: str,
    db: AsyncSession,
):
    result = await db.execute(
        select(WorkspaceInvite).where(
            WorkspaceInvite.token == token,
        )
    )

    invite = result.scalar_one_or_none()

    if invite is None:
        raise HTTPException(
            status_code=404,
            detail="Invite link not found",
        )

    return invite


async def _get_workspace(
    workspace_id: int,
    db: AsyncSession,
):
    result = await db.execute(
        select(Workspace).where(
            Workspace.workspace_id == workspace_id,
        )
    )

    workspace = result.scalar_one_or_none()

    if workspace is None:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    return workspace


async def _get_member_by_user_id(
    workspace_id: int,
    user_id: int,
    db: AsyncSession,
):
    result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
    )

    return result.scalar_one_or_none()


def _serialize_invite(
    invite: WorkspaceInvite,
    workspace_name: str,
):
    return WorkspaceInviteResponse(
        workspace_invite_id=invite.workspace_invite_id,
        workspace_id=invite.workspace_id,
        workspace_name=workspace_name,
        token=invite.token,
        invite_path=f"/invite/{invite.token}",
        created_at=invite.created_at,
        expires_at=invite.expires_at,
    )


def _is_expired(expires_at):
    if expires_at is None:
        return False

    return expires_at < datetime.now(timezone.utc)