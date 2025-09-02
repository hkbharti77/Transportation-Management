from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from datetime import datetime
from app.models.booking import Booking, BookingStatus, ServiceType
from app.models.dispatch import Dispatch, DispatchStatus
from app.models.vehicle import Vehicle, VehicleStatus, VehicleType
from app.models.fleet import Driver
from app.schemas.booking import BookingCreate, BookingUpdate, BookingStatusUpdate
from app.schemas.dispatch import DispatchCreate
from fastapi import HTTPException, status

class BookingService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_booking(self, booking_data: BookingCreate) -> Booking:
        """Create a new booking and auto-assign truck and driver"""
        # Create the booking
        booking = Booking(
            user_id=booking_data.user_id,
            source=booking_data.source,
            destination=booking_data.destination,
            service_type=booking_data.service_type,
            price=booking_data.price,
            booking_status=BookingStatus.PENDING
        )
        
        self.db.add(booking)
        self.db.flush()  # Get the booking ID
        
        # Auto-assign truck and driver
        self._auto_assign_truck_and_driver(booking)
        
        # Create dispatch record
        dispatch = Dispatch(
            booking_id=booking.booking_id,
            status=DispatchStatus.PENDING
        )
        self.db.add(dispatch)
        
        self.db.commit()
        self.db.refresh(booking)
        return booking
    
    def _auto_assign_truck_and_driver(self, booking: Booking):
        """Auto-assign available truck and driver based on service type"""
        # Find available truck based on service type
        truck_query = self.db.query(Vehicle).filter(
            and_(
                Vehicle.status == VehicleStatus.ACTIVE,
                Vehicle.type == VehicleType.TRUCK,
                Vehicle.assigned_driver_id.isnot(None)  # Has assigned driver
            )
        )
        
        # For cargo service, prefer trucks with higher capacity
        if booking.service_type == ServiceType.CARGO:
            truck_query = truck_query.order_by(Vehicle.capacity.desc())
        else:
            # For public service, any truck is fine
            truck_query = truck_query.order_by(Vehicle.id)
        
        available_truck = truck_query.first()
        
        if not available_truck:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="No available trucks with drivers for this service"
            )
        
        # Assign truck and driver
        booking.truck_id = available_truck.id
        booking.booking_status = BookingStatus.CONFIRMED
        
        # Update truck status to indicate it's assigned
        available_truck.status = VehicleStatus.ACTIVE  # Keep active but assigned
    
    def get_booking(self, booking_id: int) -> Optional[Booking]:
        """Get booking by ID"""
        return self.db.query(Booking).filter(Booking.booking_id == booking_id).first()
    
    def get_user_bookings(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Booking]:
        """Get all bookings for a specific user"""
        return self.db.query(Booking).filter(
            Booking.user_id == user_id
        ).offset(skip).limit(limit).all()
    
    def get_all_bookings(self, skip: int = 0, limit: int = 100, status: Optional[BookingStatus] = None) -> List[Booking]:
        """Get all bookings with optional status filter"""
        query = self.db.query(Booking)
        if status:
            query = query.filter(Booking.booking_status == status)
        return query.offset(skip).limit(limit).all()
    
    def update_booking_status(self, booking_id: int, status_update: BookingStatusUpdate) -> Booking:
        """Update booking status"""
        booking = self.get_booking(booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking.booking_status = status_update.booking_status
        booking.updated_at = datetime.utcnow()
        
        # If booking is completed, update dispatch status
        if status_update.booking_status == BookingStatus.COMPLETED:
            dispatch = self.db.query(Dispatch).filter(Dispatch.booking_id == booking_id).first()
            if dispatch:
                dispatch.status = DispatchStatus.COMPLETED
                dispatch.arrival_time = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(booking)
        return booking
    
    def update_booking(self, booking_id: int, booking_update: BookingUpdate) -> Booking:
        """Update booking details"""
        booking = self.get_booking(booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Only allow updates if booking is not completed or cancelled
        if booking.booking_status in [BookingStatus.COMPLETED, BookingStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update completed or cancelled booking"
            )
        
        update_data = booking_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(booking, field, value)
        
        booking.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(booking)
        return booking
    
    def cancel_booking(self, booking_id: int) -> Booking:
        """Cancel a booking"""
        booking = self.get_booking(booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        if booking.booking_status in [BookingStatus.COMPLETED, BookingStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking is already completed or cancelled"
            )
        
        booking.booking_status = BookingStatus.CANCELLED
        booking.updated_at = datetime.utcnow()
        
        # Update dispatch status
        dispatch = self.db.query(Dispatch).filter(Dispatch.booking_id == booking_id).first()
        if dispatch:
            dispatch.status = DispatchStatus.CANCELLED
        
        # Free up the truck
        if booking.truck_id:
            truck = self.db.query(Vehicle).filter(Vehicle.id == booking.truck_id).first()
            if truck:
                truck.status = VehicleStatus.ACTIVE
        
        self.db.commit()
        self.db.refresh(booking)
        return booking
    
    def get_booking_with_dispatch(self, booking_id: int):
        """Get booking with dispatch information"""
        booking = self.db.query(Booking).filter(Booking.booking_id == booking_id).first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        dispatch = self.db.query(Dispatch).filter(Dispatch.booking_id == booking_id).first()
        
        return {
            "booking": booking,
            "dispatch": dispatch
        }
