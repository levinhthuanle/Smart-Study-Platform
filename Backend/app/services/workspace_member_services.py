from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.workspace_member import WorkspaceMember
from app.schemas.workspace_member import (
    WorkspaceMemberCreate,
    WorkspaceMemberUpdate,
)
from app.services.workspace_services import (
    get_accessible_workspace,
    get_owned_workspace,
)


async def get_workspace_members(
    workspace_id: int,
    db: AsyncSession,
    user_id: int,
):
    await get_accessible_workspace(
        workspace_id,
        db,
        user_id,
    )

    result = await db.execute(
        select(WorkspaceMember)
        .where(WorkspaceMember.workspace_id == workspace_id)
        .order_by(WorkspaceMember.created_at.asc())
    )

    return result.scalars().all()


async def add_workspace_member(
    workspace_id: int,
    member_data: WorkspaceMemberCreate,
    db: AsyncSession,
    owner_id: int,
):
    workspace = await get_owned_workspace(
        workspace_id,
        db,
        owner_id,
    )

    user = await _get_user(
        member_data.user_id,
        db,
    )

    if user.user_id == workspace.owner_id:
        raise HTTPException(
            status_code=400,
            detail="Workspace owner is already a workspace member",
        )

    existing_member = await _get_member_by_user_id(
        workspace_id,
        user.user_id,
        db,
    )

    if existing_member is not None:
        raise HTTPException(
            status_code=400,
            detail="User is already a workspace member",
        )

    member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=user.user_id,
        role=member_data.role,
    )

    db.add(member)
    await db.commit()
    await db.refresh(member)

    return member


async def update_workspace_member(
    workspace_id: int,
    workspace_member_id: int,
    member_data: WorkspaceMemberUpdate,
    db: AsyncSession,
    owner_id: int,
):
    await get_owned_workspace(
        workspace_id,
        db,
        owner_id,
    )

    member = await _get_member_by_id(
        workspace_id,
        workspace_member_id,
        db,
    )

    if member.role == "owner":
        raise HTTPException(
            status_code=400,
            detail="Workspace owner role cannot be modified",
        )

    member.role = member_data.role

    await db.commit()
    await db.refresh(member)

    return member


async def delete_workspace_member(
    workspace_id: int,
    workspace_member_id: int,
    db: AsyncSession,
    owner_id: int,
):
    await get_owned_workspace(
        workspace_id,
        db,
        owner_id,
    )

    member = await _get_member_by_id(
        workspace_id,
        workspace_member_id,
        db,
    )

    if member.role == "owner":
        raise HTTPException(
            status_code=400,
            detail="Workspace owner cannot be removed from members",
        )

    await db.delete(member)
    await db.commit()

    return {
        "message": "Workspace member deleted successfully"
    }


async def _get_user(
    user_id: int,
    db: AsyncSession,
):
    result = await db.execute(
        select(User).where(
            User.user_id == user_id
        )
    )

    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


async def _get_member_by_id(
    workspace_id: int,
    workspace_member_id: int,
    db: AsyncSession,
):
    result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.workspace_member_id == workspace_member_id,
        )
    )

    member = result.scalar_one_or_none()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Workspace member not found",
        )

    return member


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
