from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, JSON, Time
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
from typing import List, Dict, Any
import json

class ServiceStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    CANCELLED = "cancelled"

class TicketStatus(str, enum.Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    BOOKED = "booked"
    CANCELLED = "cancelled"
    USED = "used"

class PublicService(Base):
    __tablename__ = "public_services"
    
    service_id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String(255), nullable=False, index=True)
    stops = Column(JSON, nullable=False)  # List of stop objects with name, location, sequence
    schedule = Column(JSON, nullable=False)  # Time slots for each day
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    capacity = Column(Integer, nullable=False, default=50)
    fare = Column(Float, nullable=False)
    status = Column(Enum(ServiceStatus), default=ServiceStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="public_services", foreign_keys=[vehicle_id])
    tickets = relationship("Ticket", back_populates="service")

class Ticket(Base):
    __tablename__ = "tickets"
    
    ticket_id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("public_services.service_id"), nullable=False)
    passenger_name = Column(String(255), nullable=False)
    seat_number = Column(String(10), nullable=False)
    booking_status = Column(Enum(TicketStatus), default=TicketStatus.AVAILABLE, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # For registered users
    booking_time = Column(DateTime(timezone=True), server_default=func.now())
    travel_date = Column(DateTime, nullable=False)
    fare_paid = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    service = relationship("PublicService", back_populates="tickets")
    user = relationship("User", back_populates="tickets")

class ServiceSchedule(Base):
    __tablename__ = "service_schedules"
    
    schedule_id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("public_services.service_id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    departure_time = Column(Time, nullable=False)
    arrival_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    service = relationship("PublicService")