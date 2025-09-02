from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.tracking import LocationType

# Location schemas
class LocationBase(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    altitude: Optional[float] = Field(None, description="Altitude in meters")
    speed: Optional[float] = Field(None, ge=0, description="Speed in km/h")
    heading: Optional[float] = Field(None, ge=0, le=360, description="Direction in degrees")
    accuracy: Optional[float] = Field(None, ge=0, description="GPS accuracy in meters")
    location_type: LocationType = Field(default=LocationType.GPS, description="Location type")

class LocationCreate(LocationBase):
    truck_id: int = Field(..., description="Truck ID")
    timestamp: Optional[datetime] = Field(None, description="Location timestamp")

class LocationUpdate(BaseModel):
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    altitude: Optional[float] = None
    speed: Optional[float] = Field(None, ge=0)
    heading: Optional[float] = Field(None, ge=0, le=360)
    accuracy: Optional[float] = Field(None, ge=0)
    location_type: Optional[LocationType] = None

class LocationResponse(LocationBase):
    location_id: int
    truck_id: int
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Trip Location schemas
class TripLocationBase(BaseModel):
    sequence_number: int = Field(..., ge=1, description="Order in trip")
    is_checkpoint: bool = Field(default=False, description="Important location point")
    notes: Optional[str] = Field(None, description="Location notes")

class TripLocationCreate(TripLocationBase):
    trip_id: int = Field(..., description="Trip ID")
    location_id: int = Field(..., description="Location ID")

class TripLocationResponse(TripLocationBase):
    trip_location_id: int
    trip_id: int
    location_id: int
    location: LocationResponse
    created_at: datetime

    class Config:
        from_attributes = True

# Geofence schemas
class GeofenceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Geofence name")
    description: Optional[str] = Field(None, description="Geofence description")
    latitude: float = Field(..., ge=-90, le=90, description="Center latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Center longitude")
    radius: float = Field(..., gt=0, description="Radius in meters")
    is_active: bool = Field(default=True, description="Geofence status")

class GeofenceCreate(GeofenceBase):
    pass

class GeofenceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    radius: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None

class GeofenceResponse(GeofenceBase):
    geofence_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Geofence Event schemas
class GeofenceEventBase(BaseModel):
    event_type: str = Field(..., description="Event type (enter/exit)")
    timestamp: Optional[datetime] = Field(None, description="Event timestamp")

class GeofenceEventResponse(GeofenceEventBase):
    event_id: int
    geofence_id: int
    truck_id: int
    location_id: int
    geofence: GeofenceResponse
    location: LocationResponse
    timestamp: datetime

    class Config:
        from_attributes = True

# Real-time tracking schemas
class TruckLocationResponse(BaseModel):
    truck_id: int
    truck_name: str
    current_location: LocationResponse
    last_updated: datetime
    is_online: bool
    current_speed: Optional[float] = None
    heading: Optional[float] = None

class ETARequest(BaseModel):
    source_lat: float = Field(..., ge=-90, le=90, description="Source latitude")
    source_lng: float = Field(..., ge=-180, le=180, description="Source longitude")
    dest_lat: float = Field(..., ge=-90, le=90, description="Destination latitude")
    dest_lng: float = Field(..., ge=-180, le=180, description="Destination longitude")
    transport_mode: str = Field(default="driving", description="Transport mode")

class ETAResponse(BaseModel):
    distance_km: float = Field(..., description="Distance in kilometers")
    duration_minutes: int = Field(..., description="Duration in minutes")
    eta: datetime = Field(..., description="Estimated arrival time")
    route_summary: Dict[str, Any] = Field(..., description="Route information")

class TrackingFilter(BaseModel):
    truck_id: Optional[int] = Field(None, description="Filter by truck ID")
    start_time: Optional[datetime] = Field(None, description="Start time filter")
    end_time: Optional[datetime] = Field(None, description="End time filter")
    location_type: Optional[LocationType] = Field(None, description="Filter by location type")

class LocationListResponse(BaseModel):
    locations: List[LocationResponse]
    total: int
    page: int
    size: int

class TruckTrackingResponse(BaseModel):
    truck_id: int
    truck_name: str
    locations: List[LocationResponse]
    total_locations: int
    tracking_period: Dict[str, datetime]

# Dashboard schemas
class TrackingDashboardResponse(BaseModel):
    total_trucks: int
    online_trucks: int
    active_trips: int
    total_distance_today: float
    average_speed: float
    recent_locations: List[LocationResponse]
    geofence_alerts: List[GeofenceEventResponse]

class FleetStatusResponse(BaseModel):
    truck_id: int
    truck_name: str
    status: str  # online, offline, in_trip, maintenance
    current_location: Optional[LocationResponse] = None
    last_seen: Optional[datetime] = None
    current_trip: Optional[Dict[str, Any]] = None
