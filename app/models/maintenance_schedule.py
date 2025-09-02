from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class ScheduleType(str, enum.Enum):
    MILEAGE_BASED = "mileage_based"
    TIME_BASED = "time_based"
    CONDITION_BASED = "condition_based"

class MaintenanceSchedule(Base):
    __tablename__ = "maintenance_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    service_type = Column(String(50), nullable=False)
    schedule_type = Column(Enum(ScheduleType), nullable=False)
    interval_value = Column(Float, nullable=False)  # Miles or days
    last_service_mileage = Column(Integer, nullable=True)
    last_service_date = Column(DateTime, nullable=True)
    next_service_mileage = Column(Integer, nullable=True)
    next_service_date = Column(DateTime, nullable=True)
    description = Column(Text, nullable=False)
    estimated_cost = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_schedules")
