from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.dispatch import DispatchStatus

class DispatchBase(BaseModel):
    booking_id: int = Field(..., description="Associated booking ID")

class DispatchCreate(DispatchBase):
    pass

class DispatchUpdate(BaseModel):
    assigned_driver: Optional[int] = Field(None, description="Assigned driver ID")
    dispatch_time: Optional[datetime] = Field(None, description="When driver is dispatched")
    arrival_time: Optional[datetime] = Field(None, description="When driver arrives at destination")
    status: Optional[DispatchStatus] = Field(None, description="Dispatch status")

class DispatchResponse(DispatchBase):
    dispatch_id: int
    assigned_driver: Optional[int] = None
    dispatch_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    status: DispatchStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DispatchStatusUpdate(BaseModel):
    status: DispatchStatus = Field(..., description="New dispatch status")
    dispatch_time: Optional[datetime] = Field(None, description="Dispatch time")
    arrival_time: Optional[datetime] = Field(None, description="Arrival time")

class DispatchListResponse(BaseModel):
    dispatches: list[DispatchResponse]
    total: int
    page: int
    size: int
