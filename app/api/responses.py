from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas.requests import (
    ResponseCreate,
    ResponseUpdate,
    ResponseResponse,
    PaginationParams,
)
from app.db.session import get_db
from app.services import response as response_service
from app.core.auth import get_current_user
from app.db.models import User, ResponseStatus

router = APIRouter(tags=["responses"])


@router.post("/", response_model=ResponseResponse)
def create_response(
    response: ResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new response to a vacancy"""
    # Ensure the user can only create responses for themselves
    if response.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create responses for yourself"
        )
    return response_service.create_response(db=db, response=response)


@router.get("/user", response_model=List[ResponseResponse])
def get_user_responses(
    pagination: PaginationParams = Depends(),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get list of user's responses (filtered and paginated)"""
    skip = (pagination.page - 1) * pagination.per_page
    
    # Convert string status to enum if provided
    status_enum = None
    if status:
        try:
            status_enum = ResponseStatus[status.upper()]
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status value. Valid values are: {', '.join([s.name for s in ResponseStatus])}"
            )
    
    responses = response_service.get_responses_for_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=pagination.per_page,
        status=status_enum
    )
    return responses


@router.get("/vacancy/{vacancy_id}", response_model=List[ResponseResponse])
def get_vacancy_responses(
    vacancy_id: int,
    pagination: PaginationParams = Depends(),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get list of responses for a vacancy (for employers)"""
    skip = (pagination.page - 1) * pagination.per_page
    
    # Convert string status to enum if provided
    status_enum = None
    if status:
        try:
            status_enum = ResponseStatus[status.upper()]
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status value. Valid values are: {', '.join([s.name for s in ResponseStatus])}"
            )
    
    responses = response_service.get_responses_for_vacancy(
        db=db,
        vacancy_id=vacancy_id,
        skip=skip,
        limit=pagination.per_page,
        status=status_enum
    )
    return responses


@router.get("/{response_id}", response_model=ResponseResponse)
def get_response_by_id(
    response_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get response by ID"""
    db_response = response_service.get_response(db, response_id=response_id)
    if db_response is None:
        raise HTTPException(status_code=404, detail="Response not found")
    
    # Check if user has access to this response (owner or employer)
    if db_response.user_id != current_user.id:
        # TODO: Check if current user is the employer for this vacancy
        pass
    
    return db_response


@router.patch("/{response_id}/status/{status}", response_model=ResponseResponse)
def update_response_status(
    response_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update response status by ID (for employers)"""
    try:
        status_enum = ResponseStatus[status.upper()]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status value. Valid values are: {', '.join([s.name for s in ResponseStatus])}"
        )
    
    db_response = response_service.update_response_status(
        db, response_id=response_id, status=status_enum
    )
    if db_response is None:
        raise HTTPException(status_code=404, detail="Response not found")
    
    # TODO: Check if current user is the employer for this vacancy
    
    return db_response
