from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class VehicleType(str, enum.Enum):
    TRUCK = "truck"
    BUS = "bus"
    VAN = "van"
    CAR = "car"
    MOTORCYCLE = "motorcycle"

class VehicleStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(VehicleType), nullable=False)
    capacity = Column(Float, nullable=False)  # Weight capacity in kg
    license_plate = Column(String(20), unique=True, index=True, nullable=False)
    model = Column(String(100))
    year = Column(Integer)
    assigned_driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    assigned_driver = relationship("Driver", foreign_keys=[assigned_driver_id])
    orders = relationship("Order", back_populates="vehicle")
    trips = relationship("Trip", back_populates="vehicle")
    services = relationship("Service", back_populates="vehicle")
    service_history = relationship("ServiceHistory", back_populates="vehicle")
    maintenance_schedules = relationship("MaintenanceSchedule", back_populates="vehicle")
    bookings = relationship("Booking", back_populates="vehicle")
    public_services = relationship("PublicService", back_populates="vehicle")
    locations = relationship("Location", back_populates="vehicle")
