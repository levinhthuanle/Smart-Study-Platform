from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task
from app.models.user import User
from app.models.workspace_member import WorkspaceMember
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.workspace_services import get_accessible_workspace


async def get_tasks(
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
        select(Task)
        .where(Task.workspace_id == workspace_id)
        .order_by(Task.created_at.desc())
    )

    return result.scalars().all()


async def create_task(
    workspace_id: int,
    task_data: TaskCreate,
    db: AsyncSession,
    user_id: int,
):
    await get_accessible_workspace(
        workspace_id,
        db,
        user_id,
    )

    await _ensure_workspace_participant(
        workspace_id,
        task_data.assigned_to,
        db,
    )

    task = Task(
        workspace_id=workspace_id,
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        assigned_to=task_data.assigned_to,
        due_date=task_data.due_date,
    )

    db.add(task)
    await db.commit()
    await db.refresh(task)

    return task


async def get_task_by_id(
    workspace_id: int,
    task_id: int,
    db: AsyncSession,
    user_id: int,
):
    await get_accessible_workspace(
        workspace_id,
        db,
        user_id,
    )

    task = await _get_task(
        workspace_id,
        task_id,
        db,
    )

    return task


async def update_task(
    workspace_id: int,
    task_id: int,
    task_data: TaskUpdate,
    db: AsyncSession,
    user_id: int,
):
    await get_accessible_workspace(
        workspace_id,
        db,
        user_id,
    )

    task = await _get_task(
        workspace_id,
        task_id,
        db,
    )

    update_data = task_data.model_dump(exclude_unset=True)

    if "assigned_to" in update_data:
        await _ensure_workspace_participant(
            workspace_id,
            update_data["assigned_to"],
            db,
        )

    for field, value in update_data.items():
        setattr(task, field, value)

    await db.commit()
    await db.refresh(task)

    return task


async def delete_task(
    workspace_id: int,
    task_id: int,
    db: AsyncSession,
    user_id: int,
):
    await get_accessible_workspace(
        workspace_id,
        db,
        user_id,
    )

    task = await _get_task(
        workspace_id,
        task_id,
        db,
    )

    await db.delete(task)
    await db.commit()

    return {
        "message": "Task deleted successfully"
    }


async def _get_task(
    workspace_id: int,
    task_id: int,
    db: AsyncSession,
):
    result = await db.execute(
        select(Task).where(
            Task.workspace_id == workspace_id,
            Task.task_id == task_id,
        )
    )

    task = result.scalar_one_or_none()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


async def _ensure_workspace_participant(
    workspace_id: int,
    user_id: int,
    db: AsyncSession,
):
    user_result = await db.execute(
        select(User).where(User.user_id == user_id)
    )

    user = user_result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    membership_result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
    )

    membership = membership_result.scalar_one_or_none()

    if membership is None:
        raise HTTPException(
            status_code=400,
            detail="Assigned user must be a workspace member",
        )