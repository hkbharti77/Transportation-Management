from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from app.models.fleet import TruckStatus, TruckType, DriverStatus

# Fleet Schemas
class FleetBase(BaseModel):
    name: str
    description: Optional[str] = None

class FleetCreate(FleetBase):
    pass

class FleetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class Fleet(FleetBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Truck Schemas
class TruckBase(BaseModel):
    fleet_id: Optional[int] = None
    truck_number: str
    number_plate: str
    truck_type: TruckType
    capacity_kg: float
    length_m: Optional[float] = None
    width_m: Optional[float] = None
    height_m: Optional[float] = None
    fuel_type: Optional[str] = None
    fuel_capacity_l: Optional[float] = None
    year_of_manufacture: Optional[int] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    assigned_driver_id: Optional[int] = None

class TruckCreate(TruckBase):
    @validator('fleet_id', 'assigned_driver_id', pre=True)
    def convert_zero_to_none(cls, v):
        """Convert 0 values to None for foreign key fields"""
        if v == 0:
            return None
        return v

class TruckUpdate(BaseModel):
    fleet_id: Optional[int] = None
    truck_number: Optional[str] = None
    number_plate: Optional[str] = None
    truck_type: Optional[TruckType] = None
    capacity_kg: Optional[float] = None
    length_m: Optional[float] = None
    width_m: Optional[float] = None
    height_m: Optional[float] = None
    fuel_type: Optional[str] = None
    fuel_capacity_l: Optional[float] = None
    year_of_manufacture: Optional[int] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    assigned_driver_id: Optional[int] = None
    status: Optional[TruckStatus] = None
    is_active: Optional[bool] = None
    
    @validator('fleet_id', 'assigned_driver_id', pre=True)
    def convert_zero_to_none(cls, v):
        """Convert 0 values to None for foreign key fields"""
        if v == 0:
            return None
        return v

class Truck(TruckBase):
    id: int
    status: TruckStatus
    mileage_km: int
    current_location_lat: Optional[float] = None
    current_location_lng: Optional[float] = None
    last_location_update: Optional[datetime] = None
    insurance_expiry: Optional[datetime] = None
    permit_expiry: Optional[datetime] = None
    fitness_expiry: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Driver Schemas
class DriverBase(BaseModel):
    user_id: int
    employee_id: str
    license_number: str
    license_type: str
    license_expiry: datetime
    experience_years: Optional[int] = 0
    phone_emergency: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    assigned_truck_id: Optional[int] = None
    shift_start: Optional[str] = None
    shift_end: Optional[str] = None

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    employee_id: Optional[str] = None
    license_number: Optional[str] = None
    license_type: Optional[str] = None
    license_expiry: Optional[datetime] = None
    experience_years: Optional[int] = None
    phone_emergency: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    assigned_truck_id: Optional[int] = None
    shift_start: Optional[str] = None
    shift_end: Optional[str] = None
    status: Optional[DriverStatus] = None
    is_available: Optional[bool] = None

class Driver(DriverBase):
    id: int
    status: DriverStatus
    is_available: bool
    rating: float = 0.0
    total_trips: int = 0
    total_distance_km: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Location Schemas
class TruckLocationBase(BaseModel):
    truck_id: int
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    altitude: Optional[float] = None
    speed_kmh: Optional[float] = None
    heading_degrees: Optional[float] = None
    accuracy_meters: Optional[float] = None
    source: Optional[str] = None

class TruckLocationCreate(TruckLocationBase):
    pass

class TruckLocation(TruckLocationBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Assignment Schemas
class DriverTruckAssignment(BaseModel):
    driver_id: int
    truck_id: int

class TruckStatusUpdate(BaseModel):
    status: TruckStatus
    notes: Optional[str] = None

class DriverStatusUpdate(BaseModel):
    status: DriverStatus
    notes: Optional[str] = None

# Search and Filter Schemas
class TruckSearchParams(BaseModel):
    status: Optional[TruckStatus] = None
    truck_type: Optional[TruckType] = None
    capacity_min: Optional[float] = None
    capacity_max: Optional[float] = None
    fleet_id: Optional[int] = None
    is_available: Optional[bool] = None

class DriverSearchParams(BaseModel):
    status: Optional[DriverStatus] = None
    is_available: Optional[bool] = None
    experience_min: Optional[int] = None
    experience_max: Optional[int] = None
    rating_min: Optional[float] = None

# Response Schemas
class FleetWithTrucks(Fleet):
    trucks: List[Truck] = []

class TruckWithDriver(Truck):
    assigned_driver: Optional[Driver] = None

class DriverWithTruck(Driver):
    assigned_truck: Optional[Truck] = None

class FleetSummary(BaseModel):
    total_trucks: int
    available_trucks: int
    busy_trucks: int
    maintenance_trucks: int
    total_drivers: int
    available_drivers: int
    on_trip_drivers: int
