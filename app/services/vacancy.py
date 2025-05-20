from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from sqlalchemy import or_, and_
from app.db.models import Vacancy, VacancyStatus
from app.schemas.requests import VacancyCreate, VacancyUpdate


class VacancyService:
    """
    Service for vacancy-related operations
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_vacancy(self, vacancy_id: int) -> Optional[Vacancy]:
        """
        Get a vacancy by ID
        
        Args:
            vacancy_id (int): Vacancy ID
            
        Returns:
            Optional[Vacancy]: Vacancy instance or None if not found
        """
        return self.db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    
    def get_vacancies(
        self, 
        skip: int = 0, 
        limit: int = 20,
        status: Optional[VacancyStatus] = None,
        min_salary: Optional[float] = None,
        max_salary: Optional[float] = None,
        search_term: Optional[str] = None
    ) -> List[Vacancy]:
        """
        Get a list of vacancies with filters
        
        Args:
            skip (int): Number of records to skip
            limit (int): Maximum number of records to return
            status (Optional[VacancyStatus]): Filter by vacancy status
            min_salary (Optional[float]): Minimum salary filter
            max_salary (Optional[float]): Maximum salary filter
            search_term (Optional[str]): Search term for text search
            
        Returns:
            List[Vacancy]: List of vacancies
        """
        query = self.db.query(Vacancy)
        
        # Apply filters
        if status:
            query = query.filter(Vacancy.status == status)
        else:
            # By default, exclude deleted vacancies
            query = query.filter(Vacancy.status != VacancyStatus.DELETED)
        
        if min_salary is not None:
            query = query.filter(Vacancy.salary >= min_salary)
        
        if max_salary is not None:
            query = query.filter(Vacancy.salary <= max_salary)
        
        if search_term:
            search_term = f"%{search_term}%"
            query = query.filter(
                or_(
                    Vacancy.name.ilike(search_term),
                    Vacancy.short_description.ilike(search_term),
                    Vacancy.full_description.ilike(search_term)
                )
            )
        
        return query.offset(skip).limit(limit).all()
    
    def create_vacancy(self, vacancy: VacancyCreate) -> Vacancy:
        """
        Create a new vacancy
        
        Args:
            vacancy (VacancyCreate): Vacancy data
            
        Returns:
            Vacancy: Created vacancy instance
        """
        db_vacancy = Vacancy(
            name=vacancy.name,
            salary=vacancy.salary,
            short_description=vacancy.short_description,
            full_description=vacancy.full_description,
            status=VacancyStatus.CREATED
        )
        self.db.add(db_vacancy)
        self.db.commit()
        self.db.refresh(db_vacancy)
        return db_vacancy
    
    def update_vacancy(self, vacancy_id: int, vacancy: VacancyUpdate) -> Optional[Vacancy]:
        """
        Update a vacancy
        
        Args:
            vacancy_id (int): Vacancy ID
            vacancy (VacancyUpdate): Vacancy data
            
        Returns:
            Optional[Vacancy]: Updated vacancy instance or None if not found
        """
        db_vacancy = self.get_vacancy(vacancy_id)
        if not db_vacancy:
            return None
        
        update_data = vacancy.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_vacancy, key, value)
        
        self.db.commit()
        self.db.refresh(db_vacancy)
        return db_vacancy
    
    def update_vacancy_status(self, vacancy_id: int, status: VacancyStatus) -> Optional[Vacancy]:
        """
        Update vacancy status
        
        Args:
            vacancy_id (int): Vacancy ID
            status (VacancyStatus): New status
            
        Returns:
            Optional[Vacancy]: Updated vacancy instance or None if not found
        """
        db_vacancy = self.get_vacancy(vacancy_id)
        if not db_vacancy:
            return None
        
        db_vacancy.status = status
        self.db.commit()
        self.db.refresh(db_vacancy)
        return db_vacancy
    
    def delete_vacancy(self, vacancy_id: int) -> Optional[Vacancy]:
        """
        Soft delete a vacancy
        
        Args:
            vacancy_id (int): Vacancy ID
            
        Returns:
            Optional[Vacancy]: Updated vacancy instance or None if not found
        """
        return self.update_vacancy_status(vacancy_id, VacancyStatus.DELETED)


# For backwards compatibility with function-based approach
def get_vacancy(db: Session, vacancy_id: int) -> Optional[Vacancy]:
    return VacancyService(db).get_vacancy(vacancy_id)


def get_vacancies(
    db: Session, 
    skip: int = 0, 
    limit: int = 20,
    status: Optional[VacancyStatus] = None,
    min_salary: Optional[float] = None,
    max_salary: Optional[float] = None,
    search_term: Optional[str] = None
) -> List[Vacancy]:
    return VacancyService(db).get_vacancies(
        skip=skip,
        limit=limit,
        status=status,
        min_salary=min_salary,
        max_salary=max_salary,
        search_term=search_term
    )


def create_vacancy(db: Session, vacancy: VacancyCreate) -> Vacancy:
    return VacancyService(db).create_vacancy(vacancy)


def update_vacancy(db: Session, vacancy_id: int, vacancy: VacancyUpdate) -> Optional[Vacancy]:
    return VacancyService(db).update_vacancy(vacancy_id, vacancy)


def update_vacancy_status(db: Session, vacancy_id: int, status: VacancyStatus) -> Optional[Vacancy]:
    return VacancyService(db).update_vacancy_status(vacancy_id, status)


def delete_vacancy(db: Session, vacancy_id: int) -> Optional[Vacancy]:
    return VacancyService(db).delete_vacancy(vacancy_id)
