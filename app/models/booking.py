from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class ServiceType(str, enum.Enum):
    CARGO = "cargo"
    PUBLIC = "public"

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Booking(Base):
    __tablename__ = "bookings"
    
    booking_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    truck_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)  # Auto-assigned
    service_type = Column(Enum(ServiceType), nullable=False)
    booking_status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    price = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="bookings")
    vehicle = relationship("Vehicle", back_populates="bookings")
    dispatch = relationship("Dispatch", back_populates="booking", uselist=False)
    payments = relationship("Payment", back_populates="booking")
    invoices = relationship("Invoice", back_populates="booking")
