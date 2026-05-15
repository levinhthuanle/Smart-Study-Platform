from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.depedencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.task_services import (
    create_task as create_task_service,
    delete_task as delete_task_service,
    get_task_by_id as get_task_by_id_service,
    get_tasks as get_tasks_service,
    update_task as update_task_service,
)

router = APIRouter(
    prefix="/api/workspaces/{workspace_id}/tasks",
    tags=["tasks"],
)


@router.get(
    "",
    response_model=list[TaskResponse],
)
async def get_tasks(
    workspace_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_tasks_service(
        workspace_id,
        db,
        current_user.user_id,
    )


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_task(
    workspace_id: int,
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_task_service(
        workspace_id,
        task_data,
        db,
        current_user.user_id,
    )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
async def get_task_by_id(
    workspace_id: int,
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_task_by_id_service(
        workspace_id,
        task_id,
        db,
        current_user.user_id,
    )


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
)
async def modify_task(
    workspace_id: int,
    task_id: int,
    task_data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await update_task_service(
        workspace_id,
        task_id,
        task_data,
        db,
        current_user.user_id,
    )


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_task(
    workspace_id: int,
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await delete_task_service(
        workspace_id,
        task_id,
        db,
        current_user.user_id,
    )