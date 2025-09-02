from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class TripStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DELAYED = "delayed"

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    actual_departure_time = Column(DateTime, nullable=True)
    actual_arrival_time = Column(DateTime, nullable=True)
    fare = Column(Float, nullable=False)
    available_seats = Column(Integer, nullable=False)
    total_seats = Column(Integer, nullable=False)
    status = Column(Enum(TripStatus), default=TripStatus.SCHEDULED, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    route = relationship("Route", back_populates="trips")
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips", foreign_keys=[driver_id])
    bookings = relationship("TripBooking", back_populates="trip")
    payments = relationship("Payment", back_populates="trip")
    invoices = relationship("Invoice", back_populates="trip")
    trip_locations = relationship("TripLocation", back_populates="trip")
