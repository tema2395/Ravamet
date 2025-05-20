from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import Depends

from app.db.models import User, UserStatus
from app.schemas.requests import UserCreate, UserUpdate
from app.core.auth import get_password_hash
from app.db.session import get_db


class UserService:
    """
    Service for user-related operations
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user(self, user_id: int) -> Optional[User]:
        """
        Get a user by ID
        
        Args:
            user_id (int): User ID
            
        Returns:
            Optional[User]: User instance or None if not found
        """
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get a user by email
        
        Args:
            email (str): User email
            
        Returns:
            Optional[User]: User instance or None if not found
        """
        return self.db.query(User).filter(User.email == email).first()
    
    def get_users(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[UserStatus] = None
    ) -> List[User]:
        """
        Get a list of users
        
        Args:
            skip (int): Number of records to skip
            limit (int): Maximum number of records to return
            status (Optional[UserStatus]): Filter by user status
            
        Returns:
            List[User]: List of users
        """
        query = self.db.query(User)
        if status:
            query = query.filter(User.status == status)
        return query.offset(skip).limit(limit).all()
    
    def create_user(self, user: UserCreate) -> User:
        """
        Create a new user
        
        Args:
            user (UserCreate): User data
            
        Returns:
            User: Created user instance
        """
        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email,
            phone=user.phone,
            name=user.name,
            surname=user.surname,
            patronymic=user.patronymic,
            cv_text=user.cv_text,
            password=hashed_password,
            status=UserStatus.CREATED
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def update_user(self, user_id: int, user: UserUpdate) -> Optional[User]:
        """
        Update a user
        
        Args:
            user_id (int): User ID
            user (UserUpdate): User data
            
        Returns:
            Optional[User]: Updated user instance or None if not found
        """
        db_user = self.get_user(user_id)
        if not db_user:
            return None
        
        update_data = user.dict(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            update_data["password"] = get_password_hash(update_data["password"])
        
        for key, value in update_data.items():
            setattr(db_user, key, value)
        
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def ban_user(self, user_id: int) -> Optional[User]:
        """
        Ban a user
        
        Args:
            user_id (int): User ID
            
        Returns:
            Optional[User]: Updated user instance or None if not found
        """
        db_user = self.get_user(user_id)
        if not db_user:
            return None
        
        db_user.status = UserStatus.BANNED
        self.db.commit()
        self.db.refresh(db_user)
        return db_user


# For backwards compatibility with function-based approach
def get_user(db: Session, user_id: int) -> Optional[User]:
    return UserService(db).get_user(user_id)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return UserService(db).get_user_by_email(email)


def get_users(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    status: Optional[UserStatus] = None
) -> List[User]:
    return UserService(db).get_users(skip=skip, limit=limit, status=status)


def create_user(db: Session, user: UserCreate) -> User:
    return UserService(db).create_user(user)


def update_user(db: Session, user_id: int, user: UserUpdate) -> Optional[User]:
    return UserService(db).update_user(user_id, user)


def ban_user(db: Session, user_id: int) -> Optional[User]:
    return UserService(db).ban_user(user_id)
