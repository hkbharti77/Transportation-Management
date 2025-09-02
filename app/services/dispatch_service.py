from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from datetime import datetime
from app.models.dispatch import Dispatch, DispatchStatus
from app.models.booking import Booking, BookingStatus
from app.models.fleet import Driver
from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.dispatch import DispatchCreate, DispatchUpdate, DispatchStatusUpdate
from fastapi import HTTPException, status

class DispatchService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_dispatch(self, dispatch_data: DispatchCreate) -> Dispatch:
        """Create a new dispatch for a booking"""
        # Check if booking exists
        booking = self.db.query(Booking).filter(Booking.booking_id == dispatch_data.booking_id).first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Check if dispatch already exists for this booking
        existing_dispatch = self.db.query(Dispatch).filter(Dispatch.booking_id == dispatch_data.booking_id).first()
        if existing_dispatch:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dispatch already exists for this booking"
            )
        
        # Auto-assign driver if booking has a truck
        assigned_driver = None
        if booking.truck_id:
            truck = self.db.query(Vehicle).filter(Vehicle.id == booking.truck_id).first()
            if truck and truck.assigned_driver_id:
                assigned_driver = truck.assigned_driver_id
        
        dispatch = Dispatch(
            booking_id=dispatch_data.booking_id,
            assigned_driver=assigned_driver,
            status=DispatchStatus.PENDING
        )
        
        self.db.add(dispatch)
        self.db.commit()
        self.db.refresh(dispatch)
        return dispatch
    
    def get_dispatch(self, dispatch_id: int) -> Optional[Dispatch]:
        """Get dispatch by ID"""
        return self.db.query(Dispatch).filter(Dispatch.dispatch_id == dispatch_id).first()
    
    def get_dispatch_by_booking(self, booking_id: int) -> Optional[Dispatch]:
        """Get dispatch by booking ID"""
        return self.db.query(Dispatch).filter(Dispatch.booking_id == booking_id).first()
    
    def get_all_dispatches(self, skip: int = 0, limit: int = 100, status: Optional[DispatchStatus] = None) -> List[Dispatch]:
        """Get all dispatches with optional status filter"""
        query = self.db.query(Dispatch)
        if status:
            query = query.filter(Dispatch.status == status)
        return query.offset(skip).limit(limit).all()
    
    def get_driver_dispatches(self, driver_id: int, skip: int = 0, limit: int = 100) -> List[Dispatch]:
        """Get all dispatches for a specific driver"""
        return self.db.query(Dispatch).filter(
            Dispatch.assigned_driver == driver_id
        ).offset(skip).limit(limit).all()
    
    def assign_driver(self, dispatch_id: int, driver_id: int) -> Dispatch:
        """Assign a driver to a dispatch"""
        dispatch = self.get_dispatch(dispatch_id)
        if not dispatch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dispatch not found"
            )
        
        # Check if driver exists and is available
        driver = self.db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        if not driver.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver is not available"
            )
        
        dispatch.assigned_driver = driver_id
        dispatch.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(dispatch)
        return dispatch
    
    def update_dispatch_status(self, dispatch_id: int, status_update: DispatchStatusUpdate) -> Dispatch:
        """Update dispatch status and related times"""
        dispatch = self.get_dispatch(dispatch_id)
        if not dispatch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dispatch not found"
            )
        
        dispatch.status = status_update.status
        
        # Update times based on status
        if status_update.status == DispatchStatus.DISPATCHED and status_update.dispatch_time:
            dispatch.dispatch_time = status_update.dispatch_time
        elif status_update.status == DispatchStatus.ARRIVED and status_update.arrival_time:
            dispatch.arrival_time = status_update.arrival_time
        
        dispatch.updated_at = datetime.utcnow()
        
        # Update booking status if dispatch is completed
        if status_update.status == DispatchStatus.COMPLETED:
            booking = self.db.query(Booking).filter(Booking.booking_id == dispatch.booking_id).first()
            if booking:
                booking.booking_status = BookingStatus.COMPLETED
                booking.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(dispatch)
        return dispatch
    
    def update_dispatch(self, dispatch_id: int, dispatch_update: DispatchUpdate) -> Dispatch:
        """Update dispatch details"""
        dispatch = self.get_dispatch(dispatch_id)
        if not dispatch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dispatch not found"
            )
        
        # Only allow updates if dispatch is not completed or cancelled
        if dispatch.status in [DispatchStatus.COMPLETED, DispatchStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update completed or cancelled dispatch"
            )
        
        update_data = dispatch_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(dispatch, field, value)
        
        dispatch.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(dispatch)
        return dispatch
    
    def cancel_dispatch(self, dispatch_id: int) -> Dispatch:
        """Cancel a dispatch"""
        dispatch = self.get_dispatch(dispatch_id)
        if not dispatch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dispatch not found"
            )
        
        if dispatch.status in [DispatchStatus.COMPLETED, DispatchStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dispatch is already completed or cancelled"
            )
        
        dispatch.status = DispatchStatus.CANCELLED
        dispatch.updated_at = datetime.utcnow()
        
        # Update booking status
        booking = self.db.query(Booking).filter(Booking.booking_id == dispatch.booking_id).first()
        if booking:
            booking.booking_status = BookingStatus.CANCELLED
            booking.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(dispatch)
        return dispatch
    
    def get_dispatch_with_details(self, dispatch_id: int):
        """Get dispatch with booking and driver details"""
        dispatch = self.db.query(Dispatch).filter(Dispatch.dispatch_id == dispatch_id).first()
        if not dispatch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dispatch not found"
            )
        
        booking = self.db.query(Booking).filter(Booking.booking_id == dispatch.booking_id).first()
        driver = None
        if dispatch.assigned_driver:
            driver = self.db.query(Driver).filter(Driver.id == dispatch.assigned_driver).first()
        
        return {
            "dispatch": dispatch,
            "booking": booking,
            "driver": driver
        }
    
    def get_available_drivers(self) -> List[Driver]:
        """Get list of available drivers"""
        return self.db.query(Driver).filter(
            and_(
                Driver.is_available == True
            )
        ).all()
