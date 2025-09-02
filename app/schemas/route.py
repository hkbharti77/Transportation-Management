from pydantic import BaseModel
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

# Create Route Schema
class RouteCreate(RouteBase):
    pass

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

# Route Response Schema
class Route(RouteBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
