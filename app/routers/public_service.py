from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.services.public_service_service import PublicServiceService
from app.schemas.public_service import (
    PublicServiceCreate, PublicServiceUpdate, PublicServiceResponse,
    TicketCreate, TicketUpdate, TicketResponse,
    TicketBookingRequest, TicketBookingResponse,
    ServiceAvailability, ServiceTimetable, ServiceTimetableResponse,
    PublicServiceFilter, TicketFilter, PublicServiceListResponse, TicketListResponse,
    ServiceStatistics
)
from app.models.public_service import ServiceStatus, TicketStatus

router = APIRouter(prefix="/public-services", tags=["public-services"])

# Public Service CRUD endpoints
@router.post("/", response_model=PublicServiceResponse, status_code=status.HTTP_201_CREATED)
def create_public_service(
    service_data: PublicServiceCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new public service route.
    
    The system will:
    - Validate assigned truck if provided
    - Store stops and schedule as JSON
    - Set initial status to active
    """
    service = PublicServiceService(db)
    return service.create_service(service_data)

@router.get("/{service_id}", response_model=PublicServiceResponse)
def get_public_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Get public service details by ID"""
    service = PublicServiceService(db)
    public_service = service.get_service(service_id)
    if not public_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Public service not found"
        )
    return public_service

@router.get("/", response_model=List[PublicServiceResponse])
def get_all_public_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[ServiceStatus] = Query(None, description="Filter by service status"),
    db: Session = Depends(get_db)
):
    """Get all public services with optional status filter"""
    service = PublicServiceService(db)
    return service.get_all_services(skip=skip, limit=limit, status=status)

@router.put("/{service_id}", response_model=PublicServiceResponse)
def update_public_service(
    service_id: int,
    service_update: PublicServiceUpdate,
    db: Session = Depends(get_db)
):
    """Update public service details"""
    service = PublicServiceService(db)
    return service.update_service(service_id, service_update)

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_public_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Delete a public service (only if no active tickets)"""
    service = PublicServiceService(db)
    service.delete_service(service_id)
    return {"message": "Service deleted successfully"}

# Ticket management endpoints
@router.post("/tickets/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db)
):
    """Create a new ticket for a public service"""
    service = PublicServiceService(db)
    return service.create_ticket(ticket_data)

@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db)
):
    """Get ticket details by ID"""
    service = PublicServiceService(db)
    ticket = service.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    return ticket

@router.get("/tickets/", response_model=List[TicketResponse])
def get_all_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    service_id: Optional[int] = Query(None, description="Filter by service ID"),
    booking_status: Optional[TicketStatus] = Query(None, description="Filter by booking status"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    travel_date: Optional[date] = Query(None, description="Filter by travel date"),
    db: Session = Depends(get_db)
):
    """Get all tickets with optional filters"""
    service = PublicServiceService(db)
    # This would need to be implemented in the service layer for complex filtering
    return service.get_service_tickets(service_id) if service_id else []

@router.put("/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    ticket_update: TicketUpdate,
    db: Session = Depends(get_db)
):
    """Update ticket details"""
    service = PublicServiceService(db)
    return service.update_ticket(ticket_id, ticket_update)

@router.delete("/tickets/{ticket_id}/cancel", response_model=TicketResponse)
def cancel_ticket(
    ticket_id: int,
    db: Session = Depends(get_db)
):
    """Cancel a ticket"""
    service = PublicServiceService(db)
    return service.cancel_ticket(ticket_id)

# Seat availability endpoints
@router.get("/{service_id}/availability", response_model=ServiceAvailability)
def get_seat_availability(
    service_id: int,
    travel_date: date = Query(..., description="Travel date"),
    db: Session = Depends(get_db)
):
    """Get seat availability for a service on a specific date"""
    service = PublicServiceService(db)
    return service.get_seat_availability(service_id, travel_date)

# Ticket booking with seat assignment
@router.post("/book-ticket", response_model=TicketBookingResponse)
def book_ticket(
    booking_request: TicketBookingRequest,
    db: Session = Depends(get_db)
):
    """
    Book a ticket with automatic seat assignment.
    
    The system will:
    - Check seat availability
    - Assign preferred seat or first available seat
    - Create ticket with booking status
    """
    service = PublicServiceService(db)
    result = service.book_ticket(booking_request)
    return TicketBookingResponse(
        ticket=result["ticket"],
        seat_assigned=result["seat_assigned"],
        booking_confirmation=result["booking_confirmation"]
    )

# Service timetable endpoints
@router.get("/{service_id}/timetable", response_model=List[ServiceTimetable])
def get_service_timetable(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Get service timetable"""
    service = PublicServiceService(db)
    return service.get_service_timetable(service_id)

# Service statistics
@router.get("/{service_id}/statistics", response_model=ServiceStatistics)
def get_service_statistics(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Get service statistics including revenue and occupancy"""
    service = PublicServiceService(db)
    stats = service.get_service_statistics(service_id)
    return ServiceStatistics(**stats)

# Service management endpoints
@router.put("/{service_id}/status")
def update_service_status(
    service_id: int,
    new_status: ServiceStatus,
    db: Session = Depends(get_db)
):
    """Update service status"""
    service = PublicServiceService(db)
    update_data = PublicServiceUpdate(status=new_status)
    return service.update_service(service_id, update_data)

@router.get("/{service_id}/tickets", response_model=List[TicketResponse])
def get_service_tickets(
    service_id: int,
    travel_date: Optional[date] = Query(None, description="Filter by travel date"),
    db: Session = Depends(get_db)
):
    """Get all tickets for a specific service"""
    service = PublicServiceService(db)
    return service.get_service_tickets(service_id, travel_date)

# User ticket management
@router.get("/user/{user_id}/tickets", response_model=List[TicketResponse])
def get_user_tickets(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all tickets for a specific user"""
    service = PublicServiceService(db)
    # This would need to be implemented in the service layer
    return []

# Search and filter endpoints
@router.get("/search/routes")
def search_routes(
    route_name: Optional[str] = Query(None, description="Search by route name"),
    status: Optional[ServiceStatus] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """Search public services by route name and status"""
    service = PublicServiceService(db)
    return service.get_all_services(status=status)

# Integration with trip system
@router.post("/{service_id}/create-trip")
def create_trip_from_service(
    service_id: int,
    departure_date: date = Query(..., description="Departure date"),
    db: Session = Depends(get_db)
):
    """
    Create a trip from a public service schedule.
    This integrates with the existing trip system.
    """
    service = PublicServiceService(db)
    public_service = service.get_service(service_id)
    if not public_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Public service not found"
        )
    
    # This would create a trip in the trip system
    # Implementation would depend on the trip service
    return {"message": "Trip creation from service would be implemented here"}
