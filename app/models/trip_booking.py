from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class BookingStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class TripBooking(Base):
    __tablename__ = "trip_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seat_number = Column(String(10), nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.CONFIRMED, nullable=False)
    booking_time = Column(DateTime(timezone=True), server_default=func.now())
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    trip = relationship("Trip", back_populates="bookings")
    user = relationship("User")
