from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, time, date
from app.models.public_service import ServiceStatus, TicketStatus

# Stop and Schedule schemas
class Stop(BaseModel):
    name: str = Field(..., description="Stop name")
    location: str = Field(..., description="Stop location/address")
    sequence: int = Field(..., description="Stop sequence number")
    estimated_time: Optional[str] = Field(None, description="Estimated arrival time")

class TimeSlot(BaseModel):
    day: str = Field(..., description="Day of week (Monday-Sunday)")
    departure_time: str = Field(..., description="Departure time (HH:MM)")
    arrival_time: str = Field(..., description="Arrival time (HH:MM)")

# Public Service schemas
class PublicServiceBase(BaseModel):
    route_name: str = Field(..., description="Route name")
    stops: List[Stop] = Field(..., description="List of stops")
    schedule: List[TimeSlot] = Field(..., description="Service schedule")
    capacity: int = Field(..., gt=0, description="Service capacity")
    fare: float = Field(..., gt=0, description="Service fare")

class PublicServiceCreate(PublicServiceBase):
    vehicle_id: Optional[int] = Field(None, description="Assigned vehicle ID")

class PublicServiceUpdate(BaseModel):
    route_name: Optional[str] = Field(None, description="Route name")
    stops: Optional[List[Stop]] = Field(None, description="List of stops")
    schedule: Optional[List[TimeSlot]] = Field(None, description="Service schedule")
    vehicle_id: Optional[int] = Field(None, description="Assigned vehicle ID")
    capacity: Optional[int] = Field(None, gt=0, description="Service capacity")
    fare: Optional[float] = Field(None, gt=0, description="Service fare")
    status: Optional[ServiceStatus] = Field(None, description="Service status")

class PublicServiceResponse(PublicServiceBase):
    service_id: int
    vehicle_id: Optional[int] = None
    status: ServiceStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Ticket schemas
class TicketBase(BaseModel):
    service_id: int = Field(..., description="Service ID")
    passenger_name: str = Field(..., description="Passenger name")
    seat_number: str = Field(..., description="Seat number")
    travel_date: datetime = Field(..., description="Travel date and time")
    fare_paid: float = Field(..., gt=0, description="Fare paid")

class TicketCreate(TicketBase):
    user_id: Optional[int] = Field(None, description="User ID for registered users")

class TicketUpdate(BaseModel):
    passenger_name: Optional[str] = Field(None, description="Passenger name")
    seat_number: Optional[str] = Field(None, description="Seat number")
    booking_status: Optional[TicketStatus] = Field(None, description="Booking status")
    travel_date: Optional[datetime] = Field(None, description="Travel date and time")
    fare_paid: Optional[float] = Field(None, gt=0, description="Fare paid")

class TicketResponse(TicketBase):
    ticket_id: int
    booking_status: TicketStatus
    user_id: Optional[int] = None
    booking_time: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Seat availability schemas
class SeatAvailability(BaseModel):
    seat_number: str
    status: TicketStatus
    passenger_name: Optional[str] = None
    ticket_id: Optional[int] = None

class ServiceAvailability(BaseModel):
    service_id: int
    route_name: str
    travel_date: date
    total_seats: int
    available_seats: int
    booked_seats: int
    seat_details: List[SeatAvailability]

# Service timetable schemas
class ServiceTimetable(BaseModel):
    service_id: int
    route_name: str
    day_of_week: str
    departure_time: str
    arrival_time: str
    is_active: bool

class ServiceTimetableResponse(BaseModel):
    service_id: int
    route_name: str
    timetable: List[ServiceTimetable]

# Filter schemas
class PublicServiceFilter(BaseModel):
    status: Optional[ServiceStatus] = Field(None, description="Filter by service status")
    route_name: Optional[str] = Field(None, description="Filter by route name")
    vehicle_id: Optional[int] = Field(None, description="Filter by assigned vehicle")

class TicketFilter(BaseModel):
    service_id: Optional[int] = Field(None, description="Filter by service ID")
    booking_status: Optional[TicketStatus] = Field(None, description="Filter by booking status")
    user_id: Optional[int] = Field(None, description="Filter by user ID")
    travel_date: Optional[date] = Field(None, description="Filter by travel date")

# Response schemas
class PublicServiceListResponse(BaseModel):
    services: List[PublicServiceResponse]
    total: int
    page: int
    size: int

class TicketListResponse(BaseModel):
    tickets: List[TicketResponse]
    total: int
    page: int
    size: int

# Booking request schemas
class TicketBookingRequest(BaseModel):
    service_id: int = Field(..., description="Service ID")
    passenger_name: str = Field(..., description="Passenger name")
    travel_date: datetime = Field(..., description="Travel date and time")
    preferred_seat: Optional[str] = Field(None, description="Preferred seat number")
    user_id: Optional[int] = Field(None, description="User ID for registered users")

class TicketBookingResponse(BaseModel):
    ticket: TicketResponse
    seat_assigned: str
    booking_confirmation: str

# Service statistics
class ServiceStatistics(BaseModel):
    service_id: int
    route_name: str
    total_tickets_sold: int
    total_revenue: float
    average_occupancy: float
    most_popular_times: List[str]
