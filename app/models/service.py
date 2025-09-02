from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class ServiceType(str, enum.Enum):
    MAINTENANCE = "maintenance"
    REPAIR = "repair"
    INSPECTION = "inspection"
    CLEANING = "cleaning"
    FUEL_REFILL = "fuel_refill"
    TIRE_CHANGE = "tire_change"
    OIL_CHANGE = "oil_change"

class ServiceStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    OVERDUE = "overdue"

class ServicePriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    service_type = Column(Enum(ServiceType), nullable=False)
    description = Column(Text, nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    estimated_duration = Column(Integer, nullable=False)  # in minutes
    actual_duration = Column(Integer, nullable=True)  # in minutes
    cost = Column(Float, nullable=False)
    status = Column(Enum(ServiceStatus), default=ServiceStatus.SCHEDULED, nullable=False)
    priority = Column(Enum(ServicePriority), default=ServicePriority.MEDIUM, nullable=False)
    assigned_mechanic_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="services")
    assigned_mechanic = relationship("User")
    parts_used = relationship("PartsUsage", back_populates="service")
