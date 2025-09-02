from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ServiceHistory(Base):
    __tablename__ = "service_history"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    service_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    performed_by = Column(String(100), nullable=False)
    performed_at = Column(DateTime, nullable=False)
    cost = Column(Float, nullable=False)
    parts_used = Column(JSON, nullable=True)  # List of parts and their costs
    mileage_at_service = Column(Integer, nullable=True)  # Vehicle mileage when service was performed
    next_service_mileage = Column(Integer, nullable=True)  # Recommended next service mileage
    notes = Column(Text, nullable=True)
    warranty_info = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="service_history")
