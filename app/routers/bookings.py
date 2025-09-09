from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.services.booking_service import BookingService
from app.schemas.booking import (
    BookingCreate, BookingUpdate, BookingResponse, 
    BookingStatusUpdate, BookingListResponse
)
from app.models.booking import BookingStatus
from datetime import datetime, timedelta

router = APIRouter(prefix="/bookings", tags=["bookings"])

# Analytics endpoints (must be before any /{booking_id} routes)
@router.get("/analytics", response_model=Dict[str, Any])
def get_booking_analytics(
    start_date: Optional[datetime] = Query(None, description="Start date for analytics"),
    end_date: Optional[datetime] = Query(None, description="End date for analytics"),
    db: Session = Depends(get_db)
):
    """Get booking analytics data"""
    from app.models.booking import Booking
    
    # Set default date range if not provided
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    
    query = db.query(Booking).filter(
        and_(Booking.created_at >= start_date, Booking.created_at <= end_date)
    )
    
    # Total bookings
    total_bookings = query.count()
    
    # Bookings by status
    status_counts = db.query(
        Booking.booking_status,
        func.count(Booking.booking_id).label('count')
    ).filter(
        and_(Booking.created_at >= start_date, Booking.created_at <= end_date)
    ).group_by(Booking.booking_status).all()
    
    # Bookings by service type
    service_type_counts = db.query(
        Booking.service_type,
        func.count(Booking.booking_id).label('count')
    ).filter(
        and_(Booking.created_at >= start_date, Booking.created_at <= end_date)
    ).group_by(Booking.service_type).all()
    
    # Total revenue
    total_revenue = db.query(func.sum(Booking.price)).filter(
        and_(Booking.created_at >= start_date, Booking.created_at <= end_date)
    ).scalar() or 0
    
    # Average booking value
    avg_booking_value = total_revenue / total_bookings if total_bookings > 0 else 0
    
    # Completion rate
    completed_bookings = query.filter(Booking.booking_status == BookingStatus.COMPLETED).count()
    completion_rate = (completed_bookings / total_bookings * 100) if total_bookings > 0 else 0
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "summary": {
            "total_bookings": total_bookings,
            "completed_bookings": completed_bookings,
            "total_revenue": total_revenue,
            "average_booking_value": round(avg_booking_value, 2),
            "completion_rate": round(completion_rate, 2)
        },
        "by_status": [{
            "status": count.booking_status.value,
            "count": count.count
        } for count in status_counts],
        "by_service_type": [{
            "service_type": count.service_type.value,
            "count": count.count
        } for count in service_type_counts]
    }

@router.get("/revenue", response_model=Dict[str, Any])
def get_booking_revenue(
    start_date: Optional[datetime] = Query(None, description="Start date for revenue analytics"),
    end_date: Optional[datetime] = Query(None, description="End date for revenue analytics"),
    db: Session = Depends(get_db)
):
    """Get booking revenue data"""
    from app.models.booking import Booking
    
    # Set default date range if not provided
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    
    # Total revenue
    total_revenue = db.query(func.sum(Booking.price)).filter(
        and_(Booking.created_at >= start_date, Booking.created_at <= end_date)
    ).scalar() or 0
    
    # Revenue by status
    revenue_by_status = db.query(
        Booking.booking_status,
        func.sum(Booking.price).label('revenue')
    ).filter(
        and_(Booking.created_at >= start_date, Booking.created_at <= end_date)
    ).group_by(Booking.booking_status).all()
    
    # Revenue by service type
    revenue_by_service_type = db.query(
        Booking.service_type,
        func.sum(Booking.price).label('revenue')
    ).filter(
        and_(Booking.created_at >= start_date, Booking.created_at <= end_date)
    ).group_by(Booking.service_type).all()
    
    # Daily revenue trend
    daily_revenue = db.query(
        func.date(Booking.created_at).label('date'),
        func.sum(Booking.price).label('revenue')
    ).filter(
        and_(Booking.created_at >= start_date, Booking.created_at <= end_date)
    ).group_by(func.date(Booking.created_at)).order_by('date').all()
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "total_revenue": total_revenue,
        "revenue_by_status": [{
            "status": rev.booking_status.value,
            "revenue": rev.revenue or 0
        } for rev in revenue_by_status],
        "revenue_by_service_type": [{
            "service_type": rev.service_type.value,
            "revenue": rev.revenue or 0
        } for rev in revenue_by_service_type],
        "daily_revenue_trend": [{
            "date": rev.date.isoformat(),
            "revenue": rev.revenue or 0
        } for rev in daily_revenue]
    }

@router.get("/peak-hours", response_model=Dict[str, Any])
def get_peak_booking_hours(
    start_date: Optional[datetime] = Query(None, description="Start date for peak hours analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for peak hours analysis"),
    db: Session = Depends(get_db)
):
    """Get peak booking hours"""
    from app.models.booking import Booking
    
    # Set default date range if not provided
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    
    # Bookings by hour of day
    hourly_bookings = db.query(
        func.extract('hour', Booking.created_at).label('hour'),
        func.count(Booking.booking_id).label('booking_count')
    ).filter(
        and_(Booking.created_at >= start_date, Booking.created_at <= end_date)
    ).group_by(func.extract('hour', Booking.created_at)).order_by('hour').all()
    
    # Bookings by day of week
    daily_bookings = db.query(
        func.extract('dow', Booking.created_at).label('day_of_week'),
        func.count(Booking.booking_id).label('booking_count')
    ).filter(
        and_(Booking.created_at >= start_date, Booking.created_at <= end_date)
    ).group_by(func.extract('dow', Booking.created_at)).order_by('day_of_week').all()
    
    # Map day of week numbers to names
    day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    # Find peak hour and day
    peak_hour = max(hourly_bookings, key=lambda x: x.booking_count) if hourly_bookings else None
    peak_day = max(daily_bookings, key=lambda x: x.booking_count) if daily_bookings else None
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "peak_hour": {
            "hour": int(peak_hour.hour) if peak_hour else None,
            "booking_count": peak_hour.booking_count if peak_hour else 0
        },
        "peak_day": {
            "day": day_names[int(peak_day.day_of_week)] if peak_day else None,
            "booking_count": peak_day.booking_count if peak_day else 0
        },
        "hourly_distribution": [{
            "hour": int(booking.hour),
            "booking_count": booking.booking_count
        } for booking in hourly_bookings],
        "daily_distribution": [{
            "day": day_names[int(booking.day_of_week)],
            "booking_count": booking.booking_count
        } for booking in daily_bookings]
    }

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

# Moved to after analytics routes to avoid path conflicts

# Moved user route to avoid path conflicts

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

# Moved status route to top to avoid path conflicts

@router.put("/{booking_id}/confirm", response_model=BookingResponse)
def confirm_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    """Confirm booking"""
    booking_service = BookingService(db)
    booking = booking_service.get_booking(booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Update booking status to confirmed
    from app.schemas.booking import BookingStatusUpdate
    from app.models.booking import BookingStatus
    
    status_update = BookingStatusUpdate(booking_status=BookingStatus.CONFIRMED)
    return booking_service.update_booking_status(booking_id, status_update)

@router.put("/{booking_id}/complete", response_model=BookingResponse)
def complete_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    """Mark booking as completed"""
    booking_service = BookingService(db)
    booking = booking_service.get_booking(booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Update booking status to completed
    from app.schemas.booking import BookingStatusUpdate
    from app.models.booking import BookingStatus
    
    status_update = BookingStatusUpdate(booking_status=BookingStatus.COMPLETED)
    return booking_service.update_booking_status(booking_id, status_update)

@router.delete("/{booking_id}", response_model=dict)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    """Delete booking"""
    booking_service = BookingService(db)
    booking = booking_service.get_booking(booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if booking can be deleted (only pending or cancelled bookings)
    from app.models.booking import BookingStatus
    if booking.booking_status not in [BookingStatus.PENDING, BookingStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending or cancelled bookings can be deleted"
        )
    
    # Delete the booking from database
    db.delete(booking)
    db.commit()
    
    return {"message": "Booking deleted successfully"}

# Moved analytics endpoints to top of file to avoid path conflicts

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
