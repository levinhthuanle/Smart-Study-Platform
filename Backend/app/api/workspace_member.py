from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.depedencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.workspace_member import (
    WorkspaceMemberCreate,
    WorkspaceMemberResponse,
    WorkspaceMemberUpdate,
)
from app.services.workspace_member_services import (
    add_workspace_member as add_workspace_member_service,
    delete_workspace_member as delete_workspace_member_service,
    get_workspace_members as get_workspace_members_service,
    update_workspace_member as update_workspace_member_service,
)

router = APIRouter(
    prefix="/api/workspaces/{workspace_id}/members",
    tags=["workspace members"],
)


@router.get(
    "",
    response_model=list[WorkspaceMemberResponse],
)
async def get_workspace_members(
    workspace_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_workspace_members_service(
        workspace_id,
        db,
        current_user.user_id,
    )


@router.post(
    "",
    response_model=WorkspaceMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_workspace_member(
    workspace_id: int,
    member_data: WorkspaceMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await add_workspace_member_service(
        workspace_id,
        member_data,
        db,
        current_user.user_id,
    )


@router.patch(
    "/{workspace_member_id}",
    response_model=WorkspaceMemberResponse,
)
async def update_workspace_member(
    workspace_id: int,
    workspace_member_id: int,
    member_data: WorkspaceMemberUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await update_workspace_member_service(
        workspace_id,
        workspace_member_id,
        member_data,
        db,
        current_user.user_id,
    )


@router.delete(
    "/{workspace_member_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_workspace_member(
    workspace_id: int,
    workspace_member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await delete_workspace_member_service(
        workspace_id,
        workspace_member_id,
        db,
        current_user.user_id,
    )
