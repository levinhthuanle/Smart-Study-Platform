from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.channels import router as channels_router
from app.api.message import router as messages_router
from app.api.task import router as tasks_router
from app.api.user import router as users_router
from app.api.workspace import router as workspaces_router
from app.api.workspace_member import router as workspace_members_router
from app.websocket.message_ws import router as message_ws_router

app = FastAPI(
    title="Smart Study Workspace API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Backend is running"
    }


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(workspaces_router)
app.include_router(workspace_members_router)
app.include_router(channels_router)
app.include_router(tasks_router)
app.include_router(messages_router)
app.include_router(message_ws_router)
