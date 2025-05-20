from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.models import Response, ResponseStatus
from app.schemas.requests import ResponseCreate, ResponseUpdate
from app.services.user import UserService
from app.services.vacancy import VacancyService


class ResponseService:
    """
    Service for response-related operations
    """
    
    def __init__(self, db: Session, user_service: UserService, vacancy_service: VacancyService):
        self.db = db
        self.user_service = user_service
        self.vacancy_service = vacancy_service
    
    def get_response(self, response_id: int) -> Optional[Response]:
        """
        Get a response by ID
        
        Args:
            response_id (int): Response ID
            
        Returns:
            Optional[Response]: Response instance or None if not found
        """
        return self.db.query(Response).filter(Response.id == response_id).first()
    
    def get_responses_for_user(
        self, 
        user_id: int,
        skip: int = 0, 
        limit: int = 20,
        status: Optional[ResponseStatus] = None
    ) -> List[Response]:
        """
        Get responses for a user
        
        Args:
            user_id (int): User ID
            skip (int): Number of records to skip
            limit (int): Maximum number of records to return
            status (Optional[ResponseStatus]): Filter by response status
            
        Returns:
            List[Response]: List of responses
        """
        # Check if user exists
        user = self.user_service.get_user(user_id)
        if not user:
            return []
        
        query = self.db.query(Response).filter(Response.user_id == user_id)
        
        if status:
            query = query.filter(Response.status == status)
        
        return query.offset(skip).limit(limit).all()
    
    def get_responses_for_vacancy(
        self, 
        vacancy_id: int,
        skip: int = 0, 
        limit: int = 20,
        status: Optional[ResponseStatus] = None
    ) -> List[Response]:
        """
        Get responses for a vacancy
        
        Args:
            vacancy_id (int): Vacancy ID
            skip (int): Number of records to skip
            limit (int): Maximum number of records to return
            status (Optional[ResponseStatus]): Filter by response status
            
        Returns:
            List[Response]: List of responses
        """
        # Check if vacancy exists
        vacancy = self.vacancy_service.get_vacancy(vacancy_id)
        if not vacancy:
            return []
        
        query = self.db.query(Response).filter(Response.vacancy_id == vacancy_id)
        
        if status:
            query = query.filter(Response.status == status)
        
        return query.offset(skip).limit(limit).all()
    
    def create_response(self, response: ResponseCreate) -> Optional[Response]:
        """
        Create a new response
        
        Args:
            response (ResponseCreate): Response data
            
        Returns:
            Optional[Response]: Created response instance or None if validation fails
        """
        # Validate user and vacancy exist
        user = self.user_service.get_user(response.user_id)
        vacancy = self.vacancy_service.get_vacancy(response.vacancy_id)
        
        if not user or not vacancy:
            return None
        
        # Check if response already exists
        existing_response = self.db.query(Response).filter(
            Response.user_id == response.user_id,
            Response.vacancy_id == response.vacancy_id
        ).first()
        
        if existing_response:
            return existing_response
        
        db_response = Response(
            user_id=response.user_id,
            vacancy_id=response.vacancy_id,
            status=ResponseStatus.CREATED
        )
        self.db.add(db_response)
        self.db.commit()
        self.db.refresh(db_response)
        return db_response
    
    def update_response_status(self, response_id: int, status: ResponseStatus) -> Optional[Response]:
        """
        Update response status
        
        Args:
            response_id (int): Response ID
            status (ResponseStatus): New status
            
        Returns:
            Optional[Response]: Updated response instance or None if not found
        """
        db_response = self.get_response(response_id)
        if not db_response:
            return None
        
        db_response.status = status
        self.db.commit()
        self.db.refresh(db_response)
        return db_response


# For backwards compatibility with function-based approach
def get_response(db: Session, response_id: int) -> Optional[Response]:
    from app.services.factory import ServiceFactory
    response_service = ServiceFactory.create_response_service(db)
    return response_service.get_response(response_id)


def get_responses_for_user(
    db: Session, 
    user_id: int,
    skip: int = 0, 
    limit: int = 20,
    status: Optional[ResponseStatus] = None
) -> List[Response]:
    from app.services.factory import ServiceFactory
    response_service = ServiceFactory.create_response_service(db)
    return response_service.get_responses_for_user(
        user_id=user_id,
        skip=skip,
        limit=limit,
        status=status
    )


def get_responses_for_vacancy(
    db: Session, 
    vacancy_id: int,
    skip: int = 0, 
    limit: int = 20,
    status: Optional[ResponseStatus] = None
) -> List[Response]:
    from app.services.factory import ServiceFactory
    response_service = ServiceFactory.create_response_service(db)
    return response_service.get_responses_for_vacancy(
        vacancy_id=vacancy_id,
        skip=skip,
        limit=limit,
        status=status
    )


def create_response(db: Session, response: ResponseCreate) -> Response:
    from app.services.factory import ServiceFactory
    response_service = ServiceFactory.create_response_service(db)
    return response_service.create_response(response)


def update_response_status(db: Session, response_id: int, status: ResponseStatus) -> Optional[Response]:
    from app.services.factory import ServiceFactory
    response_service = ServiceFactory.create_response_service(db)
    return response_service.update_response_status(response_id, status)
