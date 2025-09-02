from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class LocationType(str, enum.Enum):
    GPS = "gps"
    MANUAL = "manual"
    ESTIMATED = "estimated"

class Location(Base):
    __tablename__ = "locations"

    location_id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude = Column(Float, nullable=True)
    speed = Column(Float, nullable=True)  # Speed in km/h
    heading = Column(Float, nullable=True)  # Direction in degrees
    accuracy = Column(Float, nullable=True)  # GPS accuracy in meters
    location_type = Column(Enum(LocationType), default=LocationType.GPS, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="locations", foreign_keys=[vehicle_id])

class TripLocation(Base):
    __tablename__ = "trip_locations"

    trip_location_id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.location_id"), nullable=False)
    sequence_number = Column(Integer, nullable=False)  # Order in trip
    is_checkpoint = Column(Boolean, default=False)  # Important location point
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    trip = relationship("Trip", back_populates="trip_locations")
    location = relationship("Location")

class Geofence(Base):
    __tablename__ = "geofences"

    geofence_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius = Column(Float, nullable=False)  # Radius in meters
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class GeofenceEvent(Base):
    __tablename__ = "geofence_events"

    event_id = Column(Integer, primary_key=True, index=True)
    geofence_id = Column(Integer, ForeignKey("geofences.geofence_id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # "enter", "exit"
    location_id = Column(Integer, ForeignKey("locations.location_id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    geofence = relationship("Geofence")
    vehicle = relationship("Vehicle", foreign_keys=[vehicle_id])
    location = relationship("Location")
