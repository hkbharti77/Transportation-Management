from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class PartsUsage(Base):
    __tablename__ = "parts_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    part_id = Column(Integer, ForeignKey("parts_inventory.id"), nullable=False)
    quantity_used = Column(Integer, nullable=False)
    unit_cost_at_time = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    used_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    service = relationship("Service", back_populates="parts_used")
    part = relationship("PartsInventory", back_populates="usage_records")
