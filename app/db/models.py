from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()


class UserStatus(enum.Enum):
    CREATED = "created"
    BANNED = "banned"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    surname = Column(String)
    patronymic = Column(String)
    cv_text = Column(Text)
    password = Column(String, nullable=False)
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now())
    status = Column(Enum(UserStatus), default=UserStatus.CREATED, nullable=False)


class ResponseStatus(enum.Enum):
    CREATED = "created"
    VIEWED = "viewed"
    APPROVED = "approved"
    REJECTED = "rejected"


class Response(Base):
    __tablename__ = "responses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vacancy_id = Column(Integer, ForeignKey("vacancies.id"), nullable=False)
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now())
    status = Column(Enum(ResponseStatus), default=ResponseStatus.CREATED, nullable=False)


class VacancyStatus(enum.Enum):
    CREATED = "created"
    OPENED = "opened"
    CLOSED = "closed"
    DELETED = "deleted"


class Vacancy(Base):
    __tablename__ = "vacancies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    salary = Column(Float)
    short_description = Column(String, nullable=False)
    full_description = Column(Text)
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now())
    status = Column(Enum(VacancyStatus), default=VacancyStatus.CREATED, nullable=False)
