from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select

from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate


async def get_all_workspaces(
    db: AsyncSession,
    owner_id: int,
):
    result = await db.execute(
        select(Workspace)
        .where(Workspace.owner_id == owner_id)
        .order_by(Workspace.created_at.desc())
    )

    return result.scalars().all()


async def create_workspace(
    workspace_data: WorkspaceCreate,
    db: AsyncSession,
    owner_id: int,
):
    workspace = Workspace(
        name=workspace_data.name,
        owner_id=owner_id,
    )

    db.add(workspace)
    await db.flush()

    db.add(
        WorkspaceMember(
            workspace_id=workspace.workspace_id,
            user_id=owner_id,
            role="owner",
        )
    )

    await db.commit()
    await db.refresh(workspace)

    return workspace


async def get_workspace_by_id(
    workspace_id: int,
    db: AsyncSession,
    owner_id: int,
):
    workspace = await _get_owned_workspace(
        workspace_id,
        db,
        owner_id,
    )

    return workspace


async def update_workspace(
    workspace_id: int,
    workspace_data: WorkspaceUpdate,
    db: AsyncSession,
    owner_id: int,
):
    workspace = await _get_owned_workspace(
        workspace_id,
        db,
        owner_id,
    )

    update_data = workspace_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            workspace,
            field,
            value,
        )

    await db.commit()
    await db.refresh(workspace)

    return workspace


async def delete_workspace(
    workspace_id: int,
    db: AsyncSession,
    owner_id: int,
):
    workspace = await _get_owned_workspace(
        workspace_id,
        db,
        owner_id,
    )

    await db.execute(
        delete(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace.workspace_id
        )
    )
    await db.delete(workspace)
    await db.commit()

    return {
        "message": "Workspace deleted successfully"
    }


async def _get_owned_workspace(
    workspace_id: int,
    db: AsyncSession,
    owner_id: int,
):
    result = await db.execute(
        select(Workspace).where(
            Workspace.workspace_id == workspace_id,
            Workspace.owner_id == owner_id,
        )
    )

    workspace = result.scalar_one_or_none()

    if workspace is None:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    return workspace

