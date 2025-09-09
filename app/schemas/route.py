from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime

# Base Route Schema
class RouteBase(BaseModel):
    route_number: str
    start_point: str
    end_point: str
    stops: List[str]
    estimated_time: int  # in minutes
    distance: float  # in km
    base_fare: float
    description: Optional[str] = None
    is_active: bool = True

# Create Route Schema
class RouteCreate(RouteBase):
    @field_validator('route_number')
    @classmethod
    def validate_route_number(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Route number cannot be empty')
        if len(v) > 20:
            raise ValueError('Route number cannot exceed 20 characters')
        return v.strip().upper()
    
    @field_validator('start_point', 'end_point')
    @classmethod
    def validate_points(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Start and end points cannot be empty')
        if len(v) > 255:
            raise ValueError('Point name cannot exceed 255 characters')
        return v.strip()
    
    @field_validator('stops')
    @classmethod
    def validate_stops(cls, v):
        if not v or len(v) < 2:
            raise ValueError('Route must have at least 2 stops')
        if len(v) > 20:
            raise ValueError('Route cannot have more than 20 stops')
        
        # Remove empty stops and duplicates
        clean_stops = []
        seen = set()
        for stop in v:
            stop = stop.strip()
            if stop and stop not in seen:
                clean_stops.append(stop)
                seen.add(stop)
        
        if len(clean_stops) < 2:
            raise ValueError('Route must have at least 2 unique, non-empty stops')
        
        return clean_stops
    
    @field_validator('estimated_time')
    @classmethod
    def validate_estimated_time(cls, v):
        if v <= 0:
            raise ValueError('Estimated time must be positive')
        if v > 1440:  # 24 hours
            raise ValueError('Estimated time cannot exceed 24 hours (1440 minutes)')
        return v
    
    @field_validator('distance')
    @classmethod
    def validate_distance(cls, v):
        if v <= 0:
            raise ValueError('Distance must be positive')
        if v > 10000:  # 10,000 km max
            raise ValueError('Distance cannot exceed 10,000 km')
        return v
    
    @field_validator('base_fare')
    @classmethod
    def validate_base_fare(cls, v):
        if v < 0:
            raise ValueError('Base fare must be non-negative')
        if v > 10000:  # $10,000 max
            raise ValueError('Base fare cannot exceed $10,000')
        return round(v, 2)

# Update Route Schema
class RouteUpdate(BaseModel):
    route_number: Optional[str] = None
    start_point: Optional[str] = None
    end_point: Optional[str] = None
    stops: Optional[List[str]] = None
    estimated_time: Optional[int] = None
    distance: Optional[float] = None
    base_fare: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    
    @field_validator('route_number')
    @classmethod
    def validate_route_number(cls, v):
        if v is not None:
            if not v or len(v.strip()) == 0:
                raise ValueError('Route number cannot be empty')
            if len(v) > 20:
                raise ValueError('Route number cannot exceed 20 characters')
            return v.strip().upper()
        return v
    
    @field_validator('start_point', 'end_point')
    @classmethod
    def validate_points(cls, v):
        if v is not None:
            if not v or len(v.strip()) == 0:
                raise ValueError('Start and end points cannot be empty')
            if len(v) > 255:
                raise ValueError('Point name cannot exceed 255 characters')
            return v.strip()
        return v
    
    @field_validator('stops')
    @classmethod
    def validate_stops(cls, v):
        if v is not None:
            if not v or len(v) < 2:
                raise ValueError('Route must have at least 2 stops')
            if len(v) > 20:
                raise ValueError('Route cannot have more than 20 stops')
            
            # Remove empty stops and duplicates
            clean_stops = []
            seen = set()
            for stop in v:
                stop = stop.strip()
                if stop and stop not in seen:
                    clean_stops.append(stop)
                    seen.add(stop)
            
            if len(clean_stops) < 2:
                raise ValueError('Route must have at least 2 unique, non-empty stops')
            
            return clean_stops
        return v
    
    @field_validator('estimated_time')
    @classmethod
    def validate_estimated_time(cls, v):
        if v is not None:
            if v <= 0:
                raise ValueError('Estimated time must be positive')
            if v > 1440:  # 24 hours
                raise ValueError('Estimated time cannot exceed 24 hours (1440 minutes)')
        return v
    
    @field_validator('distance')
    @classmethod
    def validate_distance(cls, v):
        if v is not None:
            if v <= 0:
                raise ValueError('Distance must be positive')
            if v > 10000:  # 10,000 km max
                raise ValueError('Distance cannot exceed 10,000 km')
        return v
    
    @field_validator('base_fare')
    @classmethod
    def validate_base_fare(cls, v):
        if v is not None:
            if v < 0:
                raise ValueError('Base fare must be non-negative')
            if v > 10000:  # $10,000 max
                raise ValueError('Base fare cannot exceed $10,000')
            return round(v, 2)
        return v

# Route Response Schema
class Route(RouteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Route Summary Schema (for lists)
class RouteSummary(BaseModel):
    id: int
    route_number: str
    start_point: str
    end_point: str
    base_fare: float
    estimated_time: int
    distance: float
    is_active: bool
    
    class Config:
        from_attributes = True

# Route with Statistics
class RouteWithStats(Route):
    total_trips: int = 0
    active_trips: int = 0
    completed_trips: int = 0
    completion_rate: float = 0.0