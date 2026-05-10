from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.depedencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceResponse,
    WorkspaceUpdate,
)
from app.services.workspace_services import (
    create_workspace as create_workspace_service,
    delete_workspace as delete_workspace_service,
    get_all_workspaces as get_all_workspaces_service,
    get_workspace_by_id as get_workspace_by_id_service,
    update_workspace as update_workspace_service,
)

router = APIRouter(
    prefix="/api/workspaces",
    tags=["workspaces"],
)


@router.get(
    "/all",
    response_model=list[WorkspaceResponse],
)
async def get_all_workspaces(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_all_workspaces_service(
        db,
        current_user.user_id,
    )


@router.post(
    "",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_workspace(
    workspace_data: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_workspace_service(
        workspace_data,
        db,
        current_user.user_id,
    )


@router.get(
    "/{workspace_id}",
    response_model=WorkspaceResponse,
)
async def get_workspace_by_id(
    workspace_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_workspace_by_id_service(
        workspace_id,
        db,
        current_user.user_id,
    )


@router.patch(
    "/{workspace_id}",
    response_model=WorkspaceResponse,
)
async def modify_workspace(
    workspace_id: int,
    workspace_data: WorkspaceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await update_workspace_service(
        workspace_id,
        workspace_data,
        db,
        current_user.user_id,
    )


@router.delete(
    "/{workspace_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_workspace(
    workspace_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await delete_workspace_service(
        workspace_id,
        db,
        current_user.user_id,
    )
