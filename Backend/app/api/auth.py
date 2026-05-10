from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.user import (
    UserRegister,
    UserLogin,
)

from app.services.auth_services import (
    register_user,
    login_user,
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