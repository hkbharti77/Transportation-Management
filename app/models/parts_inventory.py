from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class PartCategory(str, enum.Enum):
    ENGINE = "engine"
    TRANSMISSION = "transmission"
    BRAKES = "brakes"
    TIRES = "tires"
    ELECTRICAL = "electrical"
    BODY = "body"
    INTERIOR = "interior"
    FLUIDS = "fluids"
    FILTERS = "filters"
    OTHER = "other"

class PartStatus(str, enum.Enum):
    AVAILABLE = "available"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    DISCONTINUED = "discontinued"

class PartsInventory(Base):
    __tablename__ = "parts_inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    part_number = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(Enum(PartCategory), nullable=False)
    description = Column(Text, nullable=True)
    manufacturer = Column(String(100), nullable=True)
    supplier = Column(String(100), nullable=True)
    unit_cost = Column(Float, nullable=False)
    current_stock = Column(Integer, default=0, nullable=False)
    min_stock_level = Column(Integer, default=0, nullable=False)
    max_stock_level = Column(Integer, nullable=True)
    location = Column(String(100), nullable=True)  # Warehouse location
    status = Column(Enum(PartStatus), default=PartStatus.AVAILABLE, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    usage_records = relationship("PartsUsage", back_populates="part")
