from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.models.trip import TripStatus

# Base Trip Schema
class TripBase(BaseModel):
    route_id: int
    vehicle_id: int
    driver_id: int
    departure_time: datetime
    arrival_time: datetime
    fare: float
    available_seats: int
    total_seats: int

# Create Trip Schema
class TripCreate(TripBase):
    pass

# Update Trip Schema
class TripUpdate(BaseModel):
    route_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    actual_departure_time: Optional[datetime] = None
    actual_arrival_time: Optional[datetime] = None
    fare: Optional[float] = None
    available_seats: Optional[int] = None
    total_seats: Optional[int] = None
    status: Optional[TripStatus] = None

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

# Trip Response Schema
class Trip(TripBase):
    id: int
    actual_departure_time: Optional[datetime] = None
    actual_arrival_time: Optional[datetime] = None
    status: TripStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Trip Booking Schema
class TripBookingCreate(BaseModel):
    trip_id: int
    seat_number: str

# Trip Booking Response Schema
class TripBooking(BaseModel):
    id: int
    trip_id: int
    user_id: int
    seat_number: str
    status: str
    booking_time: datetime
    
    class Config:
        from_attributes = True