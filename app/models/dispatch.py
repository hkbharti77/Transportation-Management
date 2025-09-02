from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class DispatchStatus(str, enum.Enum):
    PENDING = "pending"
    DISPATCHED = "dispatched"
    IN_TRANSIT = "in_transit"
    ARRIVED = "arrived"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Dispatch(Base):
    __tablename__ = "dispatches"
    
    dispatch_id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"), nullable=False)
    assigned_driver = Column(Integer, ForeignKey("drivers.id"), nullable=True)  # Auto-assigned
    dispatch_time = Column(DateTime, nullable=True)  # When driver is dispatched
    arrival_time = Column(DateTime, nullable=True)  # When driver arrives at destination
    status = Column(Enum(DispatchStatus), default=DispatchStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    booking = relationship("Booking", back_populates="dispatch")
    driver = relationship("Driver", back_populates="dispatches", foreign_keys=[assigned_driver])
