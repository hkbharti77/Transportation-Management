from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services.booking_service import BookingService
from app.schemas.booking import (
    BookingCreate, BookingUpdate, BookingResponse, 
    BookingStatusUpdate, BookingListResponse
)
from app.models.booking import BookingStatus

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new booking for truck or public service.
    
    The system will automatically:
    - Assign an available truck and driver
    - Create a dispatch record
    - Set initial booking status
    """
    booking_service = BookingService(db)
    return booking_service.create_booking(booking_data)

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    """Get booking details by ID"""
    booking_service = BookingService(db)
    booking = booking_service.get_booking(booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    return booking

@router.get("/user/{user_id}", response_model=List[BookingResponse])
def get_user_bookings(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all bookings for a specific user"""
    booking_service = BookingService(db)
    return booking_service.get_user_bookings(user_id, skip=skip, limit=limit)

@router.get("/", response_model=List[BookingResponse])
def get_all_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[BookingStatus] = Query(None, description="Filter by booking status"),
    db: Session = Depends(get_db)
):
    """Get all bookings with optional status filter"""
    booking_service = BookingService(db)
    return booking_service.get_all_bookings(skip=skip, limit=limit, status=status)

@router.put("/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    status_update: BookingStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update booking status"""
    booking_service = BookingService(db)
    return booking_service.update_booking_status(booking_id, status_update)

@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    booking_update: BookingUpdate,
    db: Session = Depends(get_db)
):
    """Update booking details"""
    booking_service = BookingService(db)
    return booking_service.update_booking(booking_id, booking_update)

@router.delete("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    """Cancel a booking"""
    booking_service = BookingService(db)
    return booking_service.cancel_booking(booking_id)

@router.get("/{booking_id}/with-dispatch")
def get_booking_with_dispatch(
    booking_id: int,
    db: Session = Depends(get_db)
):
    """Get booking with dispatch information"""
    booking_service = BookingService(db)
    return booking_service.get_booking_with_dispatch(booking_id)

@router.get("/status/{status}", response_model=List[BookingResponse])
def get_bookings_by_status(
    status: BookingStatus,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get bookings by specific status"""
    booking_service = BookingService(db)
    return booking_service.get_all_bookings(skip=skip, limit=limit, status=status)
