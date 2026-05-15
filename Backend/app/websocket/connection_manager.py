from collections import defaultdict

from fastapi import WebSocket


class WorkspaceWebSocketManager:
    def __init__(self) -> None:
        self._connections: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(
        self,
        workspace_id: int,
        websocket: WebSocket,
    ) -> None:
        await websocket.accept()
        self._connections[workspace_id].add(websocket)

    def disconnect(
        self,
        workspace_id: int,
        websocket: WebSocket,
    ) -> None:
        connections = self._connections.get(workspace_id)

        if not connections:
            return

        connections.discard(websocket)

        if not connections:
            self._connections.pop(workspace_id, None)

    async def broadcast(
        self,
        workspace_id: int,
        payload: dict,
    ) -> None:
        connections = list(self._connections.get(workspace_id, set()))

        for websocket in connections:
            try:
                await websocket.send_json(payload)
            except Exception:
                self.disconnect(workspace_id, websocket)


message_ws_manager = WorkspaceWebSocketManager()