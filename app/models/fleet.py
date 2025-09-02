from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class TruckStatus(str, enum.Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    MAINTENANCE = "maintenance"
    OUT_OF_SERVICE = "out_of_service"
    RETIRED = "retired"

class TruckType(str, enum.Enum):
    SMALL_TRUCK = "small_truck"      # < 3.5 tons
    MEDIUM_TRUCK = "medium_truck"    # 3.5 - 7.5 tons
    HEAVY_TRUCK = "heavy_truck"      # 7.5 - 16 tons
    HEAVY_DUTY = "heavy_duty"        # > 16 tons
    FLATBED = "flatbed"
    REFRIGERATED = "refrigerated"
    TANKER = "tanker"
    CONTAINER = "container"

class DriverStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_TRIP = "on_trip"
    OFF_DUTY = "off_duty"
    SUSPENDED = "suspended"

class Fleet(Base):
    __tablename__ = "fleet"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    trucks = relationship("Truck", back_populates="fleet")

class Truck(Base):
    __tablename__ = "trucks"
    
    id = Column(Integer, primary_key=True, index=True)
    fleet_id = Column(Integer, ForeignKey("fleet.id"), nullable=True)
    truck_number = Column(String(50), unique=True, index=True, nullable=False)
    number_plate = Column(String(20), unique=True, index=True, nullable=False)
    truck_type = Column(Enum(TruckType), nullable=False)
    capacity_kg = Column(Float, nullable=False)
    length_m = Column(Float, nullable=True)
    width_m = Column(Float, nullable=True)
    height_m = Column(Float, nullable=True)
    fuel_type = Column(String(20), nullable=True)  # diesel, petrol, electric, hybrid
    fuel_capacity_l = Column(Float, nullable=True)
    mileage_km = Column(Integer, default=0)
    year_of_manufacture = Column(Integer, nullable=True)
    manufacturer = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    status = Column(Enum(TruckStatus), default=TruckStatus.AVAILABLE, nullable=False)
    assigned_driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    current_location_lat = Column(Float, nullable=True)
    current_location_lng = Column(Float, nullable=True)
    last_location_update = Column(DateTime, nullable=True)
    insurance_expiry = Column(DateTime, nullable=True)
    permit_expiry = Column(DateTime, nullable=True)
    fitness_expiry = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    fleet = relationship("Fleet", back_populates="trucks")
    assigned_driver = relationship("Driver", foreign_keys=[assigned_driver_id])
    location_history = relationship("TruckLocation", back_populates="truck")

class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    license_number = Column(String(50), unique=True, index=True, nullable=False)
    license_type = Column(String(20), nullable=False)  # LMV, HMV, etc.
    license_expiry = Column(DateTime, nullable=False)
    experience_years = Column(Integer, default=0)
    phone_emergency = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    blood_group = Column(String(5), nullable=True)
    status = Column(Enum(DriverStatus), default=DriverStatus.ACTIVE, nullable=False)
    assigned_truck_id = Column(Integer, ForeignKey("trucks.id"), nullable=True)
    shift_start = Column(String(10), nullable=True)  # "08:00"
    shift_end = Column(String(10), nullable=True)    # "18:00"
    is_available = Column(Boolean, default=True)
    rating = Column(Float, default=0.0, nullable=False)
    total_trips = Column(Integer, default=0, nullable=False)
    total_distance_km = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="driver_profile")
    assigned_truck = relationship("Truck", foreign_keys=[assigned_truck_id], uselist=False)
    orders = relationship("Order", back_populates="driver")
    trips = relationship("Trip", back_populates="driver")
    dispatches = relationship("Dispatch", back_populates="driver")

class TruckLocation(Base):
    __tablename__ = "truck_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    truck_id = Column(Integer, ForeignKey("trucks.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude = Column(Float, nullable=True)
    speed_kmh = Column(Float, nullable=True)
    heading_degrees = Column(Float, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    accuracy_meters = Column(Float, nullable=True)
    source = Column(String(20), nullable=True)  # GPS, manual, estimated
    
    # Relationships
    truck = relationship("Truck", back_populates="location_history")

class DriverDocument(Base):
    __tablename__ = "driver_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    document_type = Column(String(50), nullable=False)  # license, insurance, medical, etc.
    document_number = Column(String(100), nullable=True)
    issue_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=False)
    issuing_authority = Column(String(100), nullable=True)
    document_url = Column(String(500), nullable=True)  # File storage URL
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    driver = relationship("Driver")
    verified_by_user = relationship("User")
