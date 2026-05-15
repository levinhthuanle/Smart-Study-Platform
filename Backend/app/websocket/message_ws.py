from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.db.database import AsyncSessionLocal
from app.models.user import User
from app.models.workspace_member import WorkspaceMember
from app.services.workspace_services import get_accessible_workspace
from app.websocket.auth import get_user_id_from_token
from app.websocket.connection_manager import message_ws_manager

router = APIRouter()


@router.websocket("/ws/workspaces/{workspace_id}/messages")
async def workspace_messages_ws(
    websocket: WebSocket,
    workspace_id: int,
    token: str,
):
    try:
        user_id = get_user_id_from_token(token)
    except ValueError:
        await websocket.close(code=1008)
        return

    async with AsyncSessionLocal() as db:
        try:
            await get_accessible_workspace(
                workspace_id,
                db,
                user_id,
            )
        except HTTPException:
            await websocket.close(code=1008)
            return

        await message_ws_manager.connect(workspace_id, websocket)

        try:
            await websocket.send_json({
                "event": "connected",
                "workspace_id": workspace_id,
                "user_id": user_id,
            })

            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            message_ws_manager.disconnect(workspace_id, websocket)
        finally:
            message_ws_manager.disconnect(workspace_id, websocket)