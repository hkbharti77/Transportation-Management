from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.models.booking import ServiceType, BookingStatus

class BookingBase(BaseModel):
    source: str = Field(..., description="Pickup location")
    destination: str = Field(..., description="Delivery location")
    service_type: ServiceType = Field(..., description="Type of service (cargo or public)")
    price: float = Field(..., gt=0, description="Booking price")

    @field_validator('service_type', mode='before')
    def convert_service_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class BookingCreate(BookingBase):
    user_id: int = Field(..., description="Customer user ID")

class BookingUpdate(BaseModel):
    source: Optional[str] = Field(None, description="Pickup location")
    destination: Optional[str] = Field(None, description="Delivery location")
    service_type: Optional[ServiceType] = Field(None, description="Type of service")
    price: Optional[float] = Field(None, gt=0, description="Booking price")
    booking_status: Optional[BookingStatus] = Field(None, description="Booking status")
    truck_id: Optional[int] = Field(None, description="Assigned truck ID")

    @field_validator('service_type', mode='before')
    def convert_service_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('booking_status', mode='before')
    def convert_booking_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class BookingResponse(BookingBase):
    booking_id: int
    user_id: int
    truck_id: Optional[int] = None
    booking_status: BookingStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class BookingStatusUpdate(BaseModel):
    booking_status: BookingStatus = Field(..., description="New booking status")

    @field_validator('booking_status', mode='before')
    def convert_booking_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class BookingListResponse(BaseModel):
    bookings: list[BookingResponse]
    total: int
    page: int
    size: int