from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.depedencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.workspace_invite import (
    WorkspaceInvitePreviewResponse,
    WorkspaceInviteResponse,
)
from app.schemas.workspace_member import WorkspaceMemberResponse
from app.services.workspace_invite_services import (
    accept_workspace_invite as accept_workspace_invite_service,
    create_workspace_invite as create_workspace_invite_service,
    get_workspace_invite_by_token as get_workspace_invite_by_token_service,
)

router = APIRouter(
    prefix="/api",
    tags=["workspace invites"],
)


@router.post(
    "/workspaces/{workspace_id}/invites",
    response_model=WorkspaceInviteResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_workspace_invite(
    workspace_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_workspace_invite_service(
        workspace_id,
        db,
        current_user.user_id,
    )


@router.get(
    "/workspace-invites/{token}",
    response_model=WorkspaceInvitePreviewResponse,
)
async def get_workspace_invite_by_token(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    return await get_workspace_invite_by_token_service(
        token,
        db,
    )


@router.post(
    "/workspace-invites/{token}/accept",
    response_model=WorkspaceMemberResponse,
)
async def accept_workspace_invite(
    token: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await accept_workspace_invite_service(
        token,
        db,
        current_user.user_id,
    )