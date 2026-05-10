from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.user import (
    UserRegister,
    UserLogin,
    TokenRefreshRequest,
)

from app.services.auth_services import (
    register_user,
    login_user,
    refresh_access_token,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
)


@router.post("/register")
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    return await register_user(
        user_data,
        db,
    )


@router.post("/login")
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    return await login_user(
        user_data,
        db,
    )


@router.post("/refresh")
async def refresh_token(
    token_data: TokenRefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    return await refresh_access_token(
        token_data,
        db,
    )
