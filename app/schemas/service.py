from pydantic import BaseModel
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

# Service Status Update Schema
class ServiceStatusUpdate(BaseModel):
    status: ServiceStatus
    actual_duration: Optional[int] = None
    notes: Optional[str] = None
