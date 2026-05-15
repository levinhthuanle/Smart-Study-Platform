from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message
from app.schemas.message import MessageCreate, MessageUpdate
from app.services.workspace_services import get_accessible_workspace
from app.websocket.connection_manager import message_ws_manager


async def get_messages(
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
        select(Message)
        .where(Message.workspace_id == workspace_id)
        .order_by(Message.created_at.asc())
    )

    return result.scalars().all()


async def create_message(
    workspace_id: int,
    message_data: MessageCreate,
    db: AsyncSession,
    user_id: int,
):
    await get_accessible_workspace(
        workspace_id,
        db,
        user_id,
    )

    message = Message(
        workspace_id=workspace_id,
        sender_id=user_id,
        content=message_data.content,
    )

    db.add(message)
    await db.commit()
    await db.refresh(message)

    await message_ws_manager.broadcast(
        workspace_id,
        {
            "event": "message.created",
            "workspace_id": workspace_id,
            "message": _message_payload(message),
        },
    )

    return message


async def get_message_by_id(
    workspace_id: int,
    message_id: int,
    db: AsyncSession,
    user_id: int,
):
    await get_accessible_workspace(
        workspace_id,
        db,
        user_id,
    )

    message = await _get_message(
        workspace_id,
        message_id,
        db,
    )

    return message


async def update_message(
    workspace_id: int,
    message_id: int,
    message_data: MessageUpdate,
    db: AsyncSession,
    user_id: int,
):
    await get_accessible_workspace(
        workspace_id,
        db,
        user_id,
    )

    message = await _get_message(
        workspace_id,
        message_id,
        db,
    )

    if message.sender_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only edit your own messages",
        )

    update_data = message_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(message, field, value)

    await db.commit()
    await db.refresh(message)

    await message_ws_manager.broadcast(
        workspace_id,
        {
            "event": "message.updated",
            "workspace_id": workspace_id,
            "message": _message_payload(message),
        },
    )

    return message


async def delete_message(
    workspace_id: int,
    message_id: int,
    db: AsyncSession,
    user_id: int,
):
    await get_accessible_workspace(
        workspace_id,
        db,
        user_id,
    )

    message = await _get_message(
        workspace_id,
        message_id,
        db,
    )

    if message.sender_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own messages",
        )

    await db.delete(message)
    await db.commit()

    await message_ws_manager.broadcast(
        workspace_id,
        {
            "event": "message.deleted",
            "workspace_id": workspace_id,
            "message_id": message_id,
        },
    )

    return {
        "message": "Message deleted successfully"
    }


async def _get_message(
    workspace_id: int,
    message_id: int,
    db: AsyncSession,
):
    result = await db.execute(
        select(Message).where(
            Message.workspace_id == workspace_id,
            Message.message_id == message_id,
        )
    )

    message = result.scalar_one_or_none()

    if message is None:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    return message


def _message_payload(message: Message) -> dict:
    return {
        "message_id": message.message_id,
        "workspace_id": message.workspace_id,
        "sender_id": message.sender_id,
        "content": message.content,
        "created_at": message.created_at.isoformat() if message.created_at else None,
    }