from datetime import datetime

from pydantic import (
    BaseModel,
    EmailStr,
    field_validator,
)


class UserRegister(BaseModel):
    email: EmailStr
    username: str
    avt_url: str | None = None
    password: str
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, value, info):
        password = info.data.get("password")

        if password != value:
            raise ValueError("Passwords do not match")

        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    user_id: int
    email: EmailStr
    username: str | None = None
    avt_url: str | None = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class UserUpdate(BaseModel):
    username: str | None = None
    avt_url: str | None = None
