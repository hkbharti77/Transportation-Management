from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import Optional, List, Dict, Any
from datetime import datetime, date, time
from app.models.public_service import PublicService, Ticket, ServiceSchedule, ServiceStatus, TicketStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.public_service import (
    PublicServiceCreate, PublicServiceUpdate, TicketCreate, TicketUpdate,
    TicketBookingRequest, ServiceAvailability, ServiceTimetable
)
from fastapi import HTTPException, status
import json

class PublicServiceService:
    def __init__(self, db: Session):
        self.db = db
    
    # Public Service CRUD operations
    def create_service(self, service_data: PublicServiceCreate) -> PublicService:
        """Create a new public service"""
        # Validate assigned vehicle if provided
        if service_data.vehicle_id:
            vehicle = self.db.query(Vehicle).filter(Vehicle.id == service_data.vehicle_id).first()
            if not vehicle:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Assigned vehicle not found"
                )
            if vehicle.status != VehicleStatus.ACTIVE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assigned vehicle is not active"
                )
        
        service = PublicService(
            route_name=service_data.route_name,
            stops=json.dumps([stop.dict() for stop in service_data.stops]),
            schedule=json.dumps([slot.dict() for slot in service_data.schedule]),
            vehicle_id=service_data.vehicle_id,
            capacity=service_data.capacity,
            fare=service_data.fare,
            status=ServiceStatus.ACTIVE
        )
        
        self.db.add(service)
        self.db.commit()
        self.db.refresh(service)
        return service
    
    def get_service(self, service_id: int) -> Optional[PublicService]:
        """Get service by ID"""
        return self.db.query(PublicService).filter(PublicService.service_id == service_id).first()
    
    def get_all_services(self, skip: int = 0, limit: int = 100, status: Optional[ServiceStatus] = None) -> List[PublicService]:
        """Get all services with optional status filter"""
        query = self.db.query(PublicService)
        if status:
            query = query.filter(PublicService.status == status)
        return query.offset(skip).limit(limit).all()
    
    def update_service(self, service_id: int, service_update: PublicServiceUpdate) -> PublicService:
        """Update service details"""
        service = self.get_service(service_id)
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        update_data = service_update.dict(exclude_unset=True)
        
        # Handle JSON fields
        if 'stops' in update_data:
            update_data['stops'] = json.dumps([stop.dict() for stop in update_data['stops']])
        if 'schedule' in update_data:
            update_data['schedule'] = json.dumps([slot.dict() for slot in update_data['schedule']])
        
        for field, value in update_data.items():
            setattr(service, field, value)
        
        service.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(service)
        return service
    
    def delete_service(self, service_id: int) -> bool:
        """Delete a service"""
        service = self.get_service(service_id)
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        # Check if service has active tickets
        active_tickets = self.db.query(Ticket).filter(
            and_(
                Ticket.service_id == service_id,
                Ticket.booking_status.in_([TicketStatus.BOOKED, TicketStatus.RESERVED])
            )
        ).count()
        
        if active_tickets > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete service with active tickets"
            )
        
        self.db.delete(service)
        self.db.commit()
        return True
    
    # Ticket operations
    def create_ticket(self, ticket_data: TicketCreate) -> Ticket:
        """Create a new ticket"""
        # Validate service exists
        service = self.get_service(ticket_data.service_id)
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        # Check if seat is available
        existing_ticket = self.db.query(Ticket).filter(
            and_(
                Ticket.service_id == ticket_data.service_id,
                Ticket.seat_number == ticket_data.seat_number,
                Ticket.travel_date == ticket_data.travel_date,
                Ticket.booking_status.in_([TicketStatus.BOOKED, TicketStatus.RESERVED])
            )
        ).first()
        
        if existing_ticket:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Seat is already booked for this service and date"
            )
        
        ticket = Ticket(
            service_id=ticket_data.service_id,
            passenger_name=ticket_data.passenger_name,
            seat_number=ticket_data.seat_number,
            travel_date=ticket_data.travel_date,
            fare_paid=ticket_data.fare_paid,
            user_id=ticket_data.user_id,
            booking_status=TicketStatus.BOOKED
        )
        
        self.db.add(ticket)
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
    
    def get_ticket(self, ticket_id: int) -> Optional[Ticket]:
        """Get ticket by ID"""
        return self.db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    
    def get_service_tickets(self, service_id: int, travel_date: Optional[date] = None) -> List[Ticket]:
        """Get all tickets for a service"""
        query = self.db.query(Ticket).filter(Ticket.service_id == service_id)
        if travel_date:
            query = query.filter(func.date(Ticket.travel_date) == travel_date)
        return query.all()
    
    def update_ticket(self, ticket_id: int, ticket_update: TicketUpdate) -> Ticket:
        """Update ticket details"""
        ticket = self.get_ticket(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        update_data = ticket_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(ticket, field, value)
        
        ticket.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
    
    def cancel_ticket(self, ticket_id: int) -> Ticket:
        """Cancel a ticket"""
        ticket = self.get_ticket(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        if ticket.booking_status in [TicketStatus.CANCELLED, TicketStatus.USED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ticket is already cancelled or used"
            )
        
        ticket.booking_status = TicketStatus.CANCELLED
        ticket.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
    
    # Seat availability
    def get_seat_availability(self, service_id: int, travel_date: date) -> ServiceAvailability:
        """Get seat availability for a service on a specific date"""
        service = self.get_service(service_id)
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        # Get all tickets for this service and date
        tickets = self.get_service_tickets(service_id, travel_date)
        
        # Create seat availability map
        seat_map = {}
        for i in range(1, service.capacity + 1):
            seat_map[str(i)] = {
                "seat_number": str(i),
                "status": TicketStatus.AVAILABLE,
                "passenger_name": None,
                "ticket_id": None
            }
        
        # Update with booked seats
        for ticket in tickets:
            if ticket.booking_status in [TicketStatus.BOOKED, TicketStatus.RESERVED]:
                seat_map[ticket.seat_number] = {
                    "seat_number": ticket.seat_number,
                    "status": ticket.booking_status,
                    "passenger_name": ticket.passenger_name,
                    "ticket_id": ticket.ticket_id
                }
        
        available_seats = sum(1 for seat in seat_map.values() if seat["status"] == TicketStatus.AVAILABLE)
        booked_seats = service.capacity - available_seats
        
        return ServiceAvailability(
            service_id=service_id,
            route_name=service.route_name,
            travel_date=travel_date,
            total_seats=service.capacity,
            available_seats=available_seats,
            booked_seats=booked_seats,
            seat_details=list(seat_map.values())
        )
    
    # Ticket booking with seat assignment
    def book_ticket(self, booking_request: TicketBookingRequest) -> Dict[str, Any]:
        """Book a ticket with automatic seat assignment"""
        service = self.get_service(booking_request.service_id)
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        # Get seat availability
        availability = self.get_seat_availability(
            booking_request.service_id, 
            booking_request.travel_date.date()
        )
        
        if availability.available_seats == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No seats available for this service and date"
            )
        
        # Assign seat
        assigned_seat = booking_request.preferred_seat
        if not assigned_seat or assigned_seat not in [seat["seat_number"] for seat in availability.seat_details if seat["status"] == TicketStatus.AVAILABLE]:
            # Find first available seat
            for seat in availability.seat_details:
                if seat["status"] == TicketStatus.AVAILABLE:
                    assigned_seat = seat["seat_number"]
                    break
        
        # Create ticket
        ticket_data = TicketCreate(
            service_id=booking_request.service_id,
            passenger_name=booking_request.passenger_name,
            seat_number=assigned_seat,
            travel_date=booking_request.travel_date,
            fare_paid=service.fare,
            user_id=booking_request.user_id
        )
        
        ticket = self.create_ticket(ticket_data)
        
        return {
            "ticket": ticket,
            "seat_assigned": assigned_seat,
            "booking_confirmation": f"Ticket booked successfully. Seat: {assigned_seat}"
        }
    
    # Service timetable
    def get_service_timetable(self, service_id: int) -> List[ServiceTimetable]:
        """Get service timetable"""
        service = self.get_service(service_id)
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        schedule_data = json.loads(service.schedule)
        timetable = []
        
        for slot in schedule_data:
            timetable.append(ServiceTimetable(
                service_id=service_id,
                route_name=service.route_name,
                day_of_week=slot["day"],
                departure_time=slot["departure_time"],
                arrival_time=slot["arrival_time"],
                is_active=service.status == ServiceStatus.ACTIVE
            ))
        
        return timetable
    
    # Service statistics
    def get_service_statistics(self, service_id: int) -> Dict[str, Any]:
        """Get service statistics"""
        service = self.get_service(service_id)
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        # Get all tickets for this service
        tickets = self.db.query(Ticket).filter(Ticket.service_id == service_id).all()
        
        total_tickets = len(tickets)
        total_revenue = sum(ticket.fare_paid for ticket in tickets)
        average_occupancy = (total_tickets / service.capacity) * 100 if service.capacity > 0 else 0
        
        # Most popular times (simplified)
        popular_times = ["Morning", "Afternoon", "Evening"]  # This could be enhanced with actual time analysis
        
        return {
            "service_id": service_id,
            "route_name": service.route_name,
            "total_tickets_sold": total_tickets,
            "total_revenue": total_revenue,
            "average_occupancy": round(average_occupancy, 2),
            "most_popular_times": popular_times
        }
