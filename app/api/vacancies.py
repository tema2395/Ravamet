from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas.requests import (
    VacancyCreate,
    VacancyUpdate,
    VacancyResponse,
    PaginationParams,
)
from app.db.session import get_db
from app.services import vacancy as vacancy_service
from app.core.auth import get_current_user
from app.db.models import User, VacancyStatus

router = APIRouter(tags=["vacancies"])


@router.post("/", response_model=VacancyResponse)
def create_vacancy(
    vacancy: VacancyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new vacancy"""
    return vacancy_service.create_vacancy(db=db, vacancy=vacancy)


@router.get("/", response_model=List[VacancyResponse])
def get_vacancies(
    pagination: PaginationParams = Depends(),
    status: Optional[str] = Query(None, description="Filter by status"),
    min_salary: Optional[float] = Query(None, description="Minimum salary"),
    max_salary: Optional[float] = Query(None, description="Maximum salary"),
    q: Optional[str] = Query(None, description="Search term"),
    db: Session = Depends(get_db),
):
    """Get list of vacancies (filtered and paginated)"""
    skip = (pagination.page - 1) * pagination.per_page
    
    # Convert string status to enum if provided
    status_enum = None
    if status:
        try:
            status_enum = VacancyStatus[status.upper()]
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status value. Valid values are: {', '.join([s.name for s in VacancyStatus])}"
            )
    
    vacancies = vacancy_service.get_vacancies(
        db=db,
        skip=skip,
        limit=pagination.per_page,
        status=status_enum,
        min_salary=min_salary,
        max_salary=max_salary,
        search_term=q
    )
    return vacancies


@router.get("/{vacancy_id}", response_model=VacancyResponse)
def get_vacancy_by_id(
    vacancy_id: int,
    db: Session = Depends(get_db),
):
    """Get vacancy by ID"""
    db_vacancy = vacancy_service.get_vacancy(db, vacancy_id=vacancy_id)
    if db_vacancy is None:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return db_vacancy


@router.put("/{vacancy_id}", response_model=VacancyResponse)
def update_vacancy_by_id(
    vacancy_id: int,
    vacancy_update: VacancyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update vacancy by ID"""
    db_vacancy = vacancy_service.update_vacancy(
        db, vacancy_id=vacancy_id, vacancy=vacancy_update
    )
    if db_vacancy is None:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return db_vacancy


@router.delete("/{vacancy_id}", response_model=VacancyResponse)
def delete_vacancy_by_id(
    vacancy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete vacancy by ID (soft delete)"""
    db_vacancy = vacancy_service.delete_vacancy(db, vacancy_id=vacancy_id)
    if db_vacancy is None:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return db_vacancy


@router.post("/{vacancy_id}/status/{status}", response_model=VacancyResponse)
def update_vacancy_status(
    vacancy_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update vacancy status by ID"""
    try:
        status_enum = VacancyStatus[status.upper()]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status value. Valid values are: {', '.join([s.name for s in VacancyStatus])}"
        )
    
    db_vacancy = vacancy_service.update_vacancy_status(
        db, vacancy_id=vacancy_id, status=status_enum
    )
    if db_vacancy is None:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return db_vacancy
