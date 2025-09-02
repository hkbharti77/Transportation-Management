from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin, require_driver_or_admin
from app.models.user import User
from app.models.trip import Trip, TripStatus
from app.models.trip_booking import TripBooking, BookingStatus
from app.schemas.trip import TripCreate, Trip as TripSchema, TripUpdate, TripBookingCreate, TripBooking as TripBookingSchema
from app.models.log import Log
from datetime import datetime

router = APIRouter(prefix="/trips", tags=["trips"])

@router.post("/", response_model=TripSchema)
def create_trip(
    trip: TripCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new trip (Admin only)"""
    db_trip = Trip(**trip.dict())
    
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="create_trip",
        resource_type="trip",
        resource_id=db_trip.id,
        details={"trip_id": db_trip.id}
    )
    db.add(log)
    db.commit()
    
    return db_trip

@router.get("/", response_model=List[TripSchema])
def get_trips(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[TripStatus] = None,
    route_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get trips with pagination and filtering"""
    query = db.query(Trip)
    
    if status:
        query = query.filter(Trip.status == status)
    if route_id:
        query = query.filter(Trip.route_id == route_id)
    
    trips = query.offset(skip).limit(limit).all()
    return trips

@router.get("/{trip_id}", response_model=TripSchema)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    """Get a specific trip by ID"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    return trip

@router.post("/{trip_id}/book", response_model=TripBookingSchema)
def book_trip(
    trip_id: int,
    booking: TripBookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Book a seat on a trip"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    if trip.status != TripStatus.SCHEDULED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trip is not available for booking"
        )
    
    if trip.available_seats <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No available seats"
        )
    
    # Check if seat is already booked
    existing_booking = db.query(TripBooking).filter(
        TripBooking.trip_id == trip_id,
        TripBooking.seat_number == booking.seat_number,
        TripBooking.status == BookingStatus.CONFIRMED
    ).first()
    
    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seat already booked"
        )
    
    # Create booking
    db_booking = TripBooking(
        trip_id=trip_id,
        user_id=current_user.id,
        seat_number=booking.seat_number
    )
    
    # Update available seats
    trip.available_seats -= 1
    
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="book_trip",
        resource_type="trip_booking",
        resource_id=db_booking.id,
        details={"trip_id": trip_id, "seat_number": booking.seat_number}
    )
    db.add(log)
    db.commit()
    
    return db_booking

@router.put("/{trip_id}/status", response_model=TripSchema)
def update_trip_status(
    trip_id: int,
    status_update: TripStatus,
    current_user: User = Depends(require_driver_or_admin),
    db: Session = Depends(get_db)
):
    """Update trip status (Driver or Admin only)"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    # Drivers can only update trips assigned to them
    if current_user.role.value == "driver" and trip.driver_id != current_user.driver_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    trip.status = status_update
    
    # Set actual times if starting/completing
    if status_update == TripStatus.IN_PROGRESS:
        trip.actual_departure_time = datetime.utcnow()
    elif status_update == TripStatus.COMPLETED:
        trip.actual_arrival_time = datetime.utcnow()
    
    db.commit()
    db.refresh(trip)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="update_trip_status",
        resource_type="trip",
        resource_id=trip.id,
        details={"new_status": status_update.value}
    )
    db.add(log)
    db.commit()
    
    return trip

@router.get("/{trip_id}/bookings", response_model=List[TripBookingSchema])
def get_trip_bookings(
    trip_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all bookings for a trip (Admin only)"""
    bookings = db.query(TripBooking).filter(TripBooking.trip_id == trip_id).all()
    return bookings
