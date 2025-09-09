from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services.dispatch_service import DispatchService
from app.schemas.dispatch import (
    DispatchCreate, DispatchUpdate, DispatchResponse,
    DispatchStatusUpdate, DispatchListResponse
)
from app.models.dispatch import DispatchStatus

router = APIRouter(prefix="/dispatches", tags=["dispatches"])

@router.post("/", response_model=DispatchResponse, status_code=status.HTTP_201_CREATED)
def create_dispatch(
    dispatch_data: DispatchCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new dispatch for a booking.
    
    The system will automatically:
    - Check if booking exists
    - Auto-assign driver if booking has a truck
    - Set initial dispatch status
    """
    dispatch_service = DispatchService(db)
    return dispatch_service.create_dispatch(dispatch_data)

@router.get("/available-drivers")
def get_available_drivers(
    db: Session = Depends(get_db)
):
    """Get list of available drivers for assignment"""
    dispatch_service = DispatchService(db)
    return dispatch_service.get_available_drivers()

@router.get("/{dispatch_id}", response_model=DispatchResponse)
def get_dispatch(
    dispatch_id: int,
    db: Session = Depends(get_db)
):
    """Get dispatch details by ID"""
    dispatch_service = DispatchService(db)
    dispatch = dispatch_service.get_dispatch(dispatch_id)
    if not dispatch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispatch not found"
        )
    return dispatch

@router.get("/booking/{booking_id}", response_model=DispatchResponse)
def get_dispatch_by_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    """Get dispatch by booking ID"""
    dispatch_service = DispatchService(db)
    dispatch = dispatch_service.get_dispatch_by_booking(booking_id)
    if not dispatch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispatch not found for this booking"
        )
    return dispatch

@router.get("/", response_model=List[DispatchResponse])
def get_all_dispatches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[DispatchStatus] = Query(None, description="Filter by dispatch status"),
    db: Session = Depends(get_db)
):
    """Get all dispatches with optional status filter"""
    dispatch_service = DispatchService(db)
    return dispatch_service.get_all_dispatches(skip=skip, limit=limit, status=status)

@router.get("/driver/{driver_id}", response_model=List[DispatchResponse])
def get_driver_dispatches(
    driver_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all dispatches for a specific driver"""
    dispatch_service = DispatchService(db)
    return dispatch_service.get_driver_dispatches(driver_id, skip=skip, limit=limit)

@router.put("/{dispatch_id}/assign-driver", response_model=DispatchResponse)
def assign_driver(
    dispatch_id: int,
    driver_id: int,
    db: Session = Depends(get_db)
):
    """Assign a driver to a dispatch"""
    dispatch_service = DispatchService(db)
    return dispatch_service.assign_driver(dispatch_id, driver_id)

@router.put("/{dispatch_id}/status", response_model=DispatchResponse)
def update_dispatch_status(
    dispatch_id: int,
    status_update: DispatchStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update dispatch status and related times"""
    dispatch_service = DispatchService(db)
    return dispatch_service.update_dispatch_status(dispatch_id, status_update)

@router.put("/{dispatch_id}", response_model=DispatchResponse)
def update_dispatch(
    dispatch_id: int,
    dispatch_update: DispatchUpdate,
    db: Session = Depends(get_db)
):
    """Update dispatch details"""
    dispatch_service = DispatchService(db)
    return dispatch_service.update_dispatch(dispatch_id, dispatch_update)

@router.delete("/{dispatch_id}/cancel", response_model=DispatchResponse)
def cancel_dispatch(
    dispatch_id: int,
    db: Session = Depends(get_db)
):
    """Cancel a dispatch"""
    dispatch_service = DispatchService(db)
    return dispatch_service.cancel_dispatch(dispatch_id)

@router.get("/{dispatch_id}/with-details")
def get_dispatch_with_details(
    dispatch_id: int,
    db: Session = Depends(get_db)
):
    """Get dispatch with booking and driver details"""
    dispatch_service = DispatchService(db)
    return dispatch_service.get_dispatch_with_details(dispatch_id)

@router.get("/status/{status}", response_model=List[DispatchResponse])
def get_dispatches_by_status(
    status: DispatchStatus,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get dispatches by specific status"""
    dispatch_service = DispatchService(db)
    return dispatch_service.get_all_dispatches(skip=skip, limit=limit, status=status)
