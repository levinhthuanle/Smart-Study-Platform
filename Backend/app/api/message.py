from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.depedencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse, MessageUpdate
from app.services.message_services import (
    create_message as create_message_service,
    delete_message as delete_message_service,
    get_message_by_id as get_message_by_id_service,
    get_messages as get_messages_service,
    update_message as update_message_service,
)

router = APIRouter(
    prefix="/api/workspaces/{workspace_id}/messages",
    tags=["messages"],
)


@router.get(
    "",
    response_model=list[MessageResponse],
)
async def get_messages(
    workspace_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_messages_service(
        workspace_id,
        db,
        current_user.user_id,
    )


@router.post(
    "",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_message(
    workspace_id: int,
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_message_service(
        workspace_id,
        message_data,
        db,
        current_user.user_id,
    )


@router.get(
    "/{message_id}",
    response_model=MessageResponse,
)
async def get_message_by_id(
    workspace_id: int,
    message_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_message_by_id_service(
        workspace_id,
        message_id,
        db,
        current_user.user_id,
    )


@router.patch(
    "/{message_id}",
    response_model=MessageResponse,
)
async def modify_message(
    workspace_id: int,
    message_id: int,
    message_data: MessageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await update_message_service(
        workspace_id,
        message_id,
        message_data,
        db,
        current_user.user_id,
    )


@router.delete(
    "/{message_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_message(
    workspace_id: int,
    message_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await delete_message_service(
        workspace_id,
        message_id,
        db,
        current_user.user_id,
    )