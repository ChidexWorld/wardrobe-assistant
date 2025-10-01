from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    user_type: Optional[str] = "individual"

class UserCreate(UserBase):
    password: str
    preferences: Optional[str] = None
    measurements: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    preferences: Optional[str] = None
    measurements: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_active: bool
    preferences: Optional[str] = None
    measurements: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None