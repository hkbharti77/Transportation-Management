from sqlalchemy import Column, Integer, String, DateTime, Float, Text, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Route(Base):
    __tablename__ = "routes"
    
    id = Column(Integer, primary_key=True, index=True)
    route_number = Column(String(20), unique=True, index=True, nullable=False)
    start_point = Column(String(255), nullable=False)
    end_point = Column(String(255), nullable=False)
    stops = Column(JSON, nullable=False)  # Array of stop locations
    estimated_time = Column(Integer, nullable=False)  # in minutes
    distance = Column(Float, nullable=False)  # in km
    base_fare = Column(Float, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    trips = relationship("Trip", back_populates="route")
