from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas.requests import (
    UserUpdate,
    UserResponse,
)
from app.db.session import get_db
from app.services.factory import ServiceFactory
from app.services.user import UserService
from app.core.auth import get_current_user
from app.db.models import User

router = APIRouter(tags=["users"])


class PaginationParams:
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    ):
        self.page = page
        self.per_page = per_page


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(ServiceFactory.create_user_service),
):
    """Update current user profile"""
    return user_service.update_user(current_user.id, user_update)


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    user_service: UserService = Depends(ServiceFactory.create_user_service),
    current_user: User = Depends(get_current_user),
):
    """Get user by ID"""
    db_user = user_service.get_user(user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/", response_model=List[UserResponse])
def get_users(
    pagination: PaginationParams = Depends(),
    user_service: UserService = Depends(ServiceFactory.create_user_service),
    current_user: User = Depends(get_current_user),
):
    """Get list of users (paginated)"""
    skip = (pagination.page - 1) * pagination.per_page
    users = user_service.get_users(
        skip=skip, limit=pagination.per_page
    )
    return users
