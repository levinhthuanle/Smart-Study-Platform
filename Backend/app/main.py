from fastapi import FastAPI

from app.api.auth import (
    router as auth_router,
)

from app.api.user import (
    router as users_router,
)


app = FastAPI(
    title="Smart Study Workspace API",
)


@app.get("/")
async def root():
    return {
        "message": "Backend is running"
    }


app.include_router(auth_router)
app.include_router(users_router)