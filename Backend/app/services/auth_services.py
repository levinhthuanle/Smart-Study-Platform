from fastapi import HTTPException
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
    TokenRefreshRequest,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)


async def register_user(
    user_data: UserRegister,
    db: AsyncSession,
):
    result = await db.execute(
        select(User).where(
            User.email == user_data.email
        )
    )

    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        avt_url=user_data.avt_url,
        hashed_pwd=hash_password(
            user_data.password
        ),
    )

    db.add(new_user)

    await db.commit()
    await db.refresh(new_user)

    return {
        "message": "User registered successfully",
        **_create_auth_tokens(new_user.user_id),
    }


async def login_user(
    user_data: UserLogin,
    db: AsyncSession,
):
    result = await db.execute(
        select(User).where(
            User.email == user_data.email
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    if not verify_password(
        user_data.password,
        user.hashed_pwd,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    return _create_auth_tokens(user.user_id)


async def refresh_access_token(
    token_data: TokenRefreshRequest,
    db: AsyncSession,
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate refresh token",
    )

    try:
        payload = jwt.decode(
            token_data.refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        user_id = payload.get("sub")
        token_type = payload.get("type")

        if user_id is None or token_type != "refresh":
            raise credentials_exception

        user_id = int(user_id)

    except (JWTError, ValueError):
        raise credentials_exception

    result = await db.execute(
        select(User).where(
            User.user_id == user_id
        )
    )

    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return {
        "access_token": create_access_token(
            {"sub": str(user.user_id)}
        ),
        "token_type": "bearer",
    }


def _create_auth_tokens(user_id: int):
    token_data = {
        "sub": str(user_id)
    }

    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
    }
