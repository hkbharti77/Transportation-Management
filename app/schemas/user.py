from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

# Base User Schema
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole = UserRole.PUBLIC_USER

# Create User Schema
class UserCreate(UserBase):
    password: str

# Update User Schema
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

# User Response Schema
class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# User Login Schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str

# Token Data Schema
class TokenData(BaseModel):
    email: Optional[str] = None

# Profile Update Schema
class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
