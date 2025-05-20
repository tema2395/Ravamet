from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from app.schemas.models import UserStatus, ResponseStatus, VacancyStatus


# Pagination schema
class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number")
    per_page: int = Field(20, ge=1, le=100, description="Items per page")


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    name: str
    surname: Optional[str] = None
    patronymic: Optional[str] = None
    cv_text: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    password: Optional[str] = None


class UserInDB(UserBase):
    id: int
    created: datetime
    updated: Optional[datetime] = None
    status: UserStatus
    
    class Config:
        orm_mode = True


class UserResponse(UserInDB):
    pass


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[int] = None


# Vacancy schemas
class VacancyBase(BaseModel):
    name: str
    salary: Optional[float] = None
    short_description: str
    full_description: Optional[str] = None


class VacancyCreate(VacancyBase):
    pass


class VacancyUpdate(VacancyBase):
    pass


class VacancyInDB(VacancyBase):
    id: int
    created: datetime
    updated: Optional[datetime] = None
    status: VacancyStatus
    
    class Config:
        orm_mode = True


class VacancyResponse(VacancyInDB):
    pass


# Response schemas
class ResponseBase(BaseModel):
    user_id: int
    vacancy_id: int


class ResponseCreate(ResponseBase):
    pass


class ResponseUpdate(BaseModel):
    status: ResponseStatus


class ResponseInDB(ResponseBase):
    id: int
    created: datetime
    updated: Optional[datetime] = None
    status: ResponseStatus
    
    class Config:
        orm_mode = True


class ResponseResponse(ResponseInDB):
    pass


class ResponseResponse(ResponseInDB):
    pass


# Pagination
class PaginationParams(BaseModel):
    page: int = 1
    per_page: int = 20
