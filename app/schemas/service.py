from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.service import ServiceType, ServiceStatus, ServicePriority

# Base Service Schema
class ServiceBase(BaseModel):
    vehicle_id: int
    service_type: ServiceType
    description: str
    scheduled_date: datetime
    estimated_duration: int  # in minutes
    cost: float
    priority: ServicePriority = ServicePriority.MEDIUM
    assigned_mechanic_id: Optional[int] = None
    notes: Optional[str] = None

    @field_validator('service_type', mode='before')
    def convert_service_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('priority', mode='before')
    def convert_priority_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

# Create Service Schema
class ServiceCreate(ServiceBase):
    pass

# Update Service Schema
class ServiceUpdate(BaseModel):
    service_type: Optional[ServiceType] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    cost: Optional[float] = None
    status: Optional[ServiceStatus] = None
    priority: Optional[ServicePriority] = None
    assigned_mechanic_id: Optional[int] = None
    notes: Optional[str] = None
    actual_duration: Optional[int] = None
    completed_at: Optional[datetime] = None

    @field_validator('service_type', mode='before')
    def convert_service_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('priority', mode='before')
    def convert_priority_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

# Service Response Schema
class Service(ServiceBase):
    id: int
    status: ServiceStatus
    actual_duration: Optional[int] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        use_enum_values = True

# Service Status Update Schema
class ServiceStatusUpdate(BaseModel):
    status: ServiceStatus
    actual_duration: Optional[int] = None
    notes: Optional[str] = None

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    class Config:
        use_enum_values = True

# Service List Item Schema (limited fields for list views)
class ServiceList(BaseModel):
    id: int
    vehicle_id: int
    service_type: ServiceType
    description: str
    scheduled_date: datetime
    cost: float
    status: ServiceStatus
    priority: ServicePriority
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        use_enum_values = True