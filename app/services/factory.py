from fastapi import Depends
from sqlalchemy.orm import Session
from typing import Callable, Type, Dict, Any

from app.db.session import get_db
from app.services.user import UserService
from app.services.vacancy import VacancyService
from app.services.response import ResponseService


class ServiceFactory:
    """
    Factory class to create service instances
    """
    
    @staticmethod
    def create_user_service(db: Session = Depends(get_db)) -> UserService:
        """
        Create a UserService instance
        
        Args:
            db (Session): Database session
            
        Returns:
            UserService: UserService instance
        """
        return UserService(db)
    
    @staticmethod
    def create_vacancy_service(db: Session = Depends(get_db)) -> VacancyService:
        """
        Create a VacancyService instance
        
        Args:
            db (Session): Database session
            
        Returns:
            VacancyService: VacancyService instance
        """
        return VacancyService(db)
    
    @staticmethod
    def create_response_service(
        db: Session = Depends(get_db),
        user_service: UserService = Depends(create_user_service),
        vacancy_service: VacancyService = Depends(create_vacancy_service),
    ) -> ResponseService:
        """
        Create a ResponseService instance
        
        Args:
            db (Session): Database session
            user_service (UserService): UserService instance
            vacancy_service (VacancyService): VacancyService instance
            
        Returns:
            ResponseService: ResponseService instance
        """
        return ResponseService(db, user_service, vacancy_service)
