from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta
import logging

from app.schemas.requests import (
    UserCreate,
    UserUpdate,
    UserResponse,
    Token,
)
from app.db.session import get_db
from app.services.factory import ServiceFactory
from app.services.user import UserService
from app.core.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.db.models import User

router = APIRouter(tags=["auth"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.post("/register", response_model=UserResponse)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    user_service: UserService = Depends(ServiceFactory.create_user_service)
):
    logger.info(f"Registration attempt for email: {user.email}")
    db_user = user_service.get_user_by_email(user.email)
    if db_user:
        logger.warning(f"Registration failed: Email {user.email} already registered.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    try:
        created_user = user_service.create_user(user)
        logger.info(f"User registered successfully with ID: {created_user.id} and email: {created_user.email}")
        return created_user
    except Exception as e:
        logger.error(f"Error during user registration for email {user.email}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to an internal error.",
        )


@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    logger.info(f"Login attempt for username: {form_data.username}")
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        logger.warning(f"Login failed for username: {form_data.username}. Incorrect email or password.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info(f"User {form_data.username} authenticated successfully.")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    logger.info(f"Access token generated for user: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}
