from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
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
        hashed_pwd=hash_password(
            user_data.password
        ),
    )

    db.add(new_user)

    await db.commit()
    await db.refresh(new_user)

    access_token = create_access_token(
        {"sub": str(new_user.user_id)}
    )

    return {
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer",
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

    access_token = create_access_token(
        {"sub": str(user.user_id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }