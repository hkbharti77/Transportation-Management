from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.models.order import OrderStatus, CargoType

# Base Order Schema
class OrderBase(BaseModel):
    pickup_location: str
    drop_location: str
    cargo_type: CargoType
    cargo_weight: float
    cargo_description: Optional[str] = None
    pickup_time: datetime
    estimated_delivery_time: datetime
    total_amount: float

    @field_validator('cargo_type', mode='before')
    def convert_cargo_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

# Create Order Schema
class OrderCreate(OrderBase):
    pass

# Update Order Schema
class OrderUpdate(BaseModel):
    pickup_location: Optional[str] = None
    drop_location: Optional[str] = None
    cargo_type: Optional[CargoType] = None
    cargo_weight: Optional[float] = None
    cargo_description: Optional[str] = None
    pickup_time: Optional[datetime] = None
    estimated_delivery_time: Optional[datetime] = None
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    status: Optional[OrderStatus] = None
    actual_delivery_time: Optional[datetime] = None
    total_amount: Optional[float] = None

    @field_validator('cargo_type', mode='before')
    def convert_cargo_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

# Order Response Schema
class Order(OrderBase):
    id: int
    customer_id: int
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    status: OrderStatus
    actual_delivery_time: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Order Assignment Schema
class OrderAssignment(BaseModel):
    vehicle_id: int
    driver_id: int