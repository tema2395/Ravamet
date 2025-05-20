from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserStatus(str, Enum):
    CREATED = "created"
    BANNED = "banned"


class User(BaseModel):
    id: int
    email: EmailStr
    phone: Optional[str] = None
    name: str
    surname: Optional[str] = None
    patronymic: Optional[str] = None
    cv_text: Optional[str] = None
    created: datetime
    updated: Optional[datetime] = None
    status: UserStatus
    
    class Config:
        orm_mode = True


class ResponseStatus(str, Enum):
    CREATED = "created"
    VIEWED = "viewed"
    APPROVED = "approved"
    REJECTED = "rejected"


class Response(BaseModel):
    id: int
    user_id: int
    vacancy_id: int
    created: datetime
    updated: Optional[datetime] = None
    status: ResponseStatus
    
    class Config:
        orm_mode = True


class VacancyStatus(str, Enum):
    CREATED = "created"
    OPENED = "opened"
    CLOSED = "closed"
    DELETED = "deleted"


class Vacancy(BaseModel):
    id: int
    name: str
    salary: Optional[float] = None
    short_description: str
    full_description: Optional[str] = None
    created: datetime
    updated: Optional[datetime] = None
    status: VacancyStatus
    
    class Config:
        orm_mode = True
