from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.vehicle import VehicleType, VehicleStatus

# Base Vehicle Schema
class VehicleBase(BaseModel):
    type: VehicleType
    capacity: float
    license_plate: str
    model: Optional[str] = None
    year: Optional[int] = None
    status: VehicleStatus = VehicleStatus.ACTIVE

# Create Vehicle Schema
class VehicleCreate(VehicleBase):
    pass

# Update Vehicle Schema
class VehicleUpdate(BaseModel):
    type: Optional[VehicleType] = None
    capacity: Optional[float] = None
    license_plate: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    assigned_driver_id: Optional[int] = None
    status: Optional[VehicleStatus] = None

# Vehicle Response Schema
class Vehicle(VehicleBase):
    id: int
    assigned_driver_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
