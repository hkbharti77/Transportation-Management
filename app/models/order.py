from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class CargoType(str, enum.Enum):
    GENERAL = "general"
    PERISHABLE = "perishable"
    HAZARDOUS = "hazardous"
    HEAVY = "heavy"
    FRAGILE = "fragile"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    pickup_location = Column(String(255), nullable=False)
    drop_location = Column(String(255), nullable=False)
    cargo_type = Column(Enum(CargoType), nullable=False)
    cargo_weight = Column(Float, nullable=False)  # in kg
    cargo_description = Column(Text)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    pickup_time = Column(DateTime, nullable=False)
    estimated_delivery_time = Column(DateTime, nullable=False)
    actual_delivery_time = Column(DateTime, nullable=True)
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("User", back_populates="orders")
    vehicle = relationship("Vehicle", back_populates="orders")
    driver = relationship("Driver", back_populates="orders", foreign_keys=[driver_id])
    payments = relationship("Payment", back_populates="order")
    invoices = relationship("Invoice", back_populates="order")
