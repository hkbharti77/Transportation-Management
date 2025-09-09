from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.parts_inventory import PartCategory, PartStatus

# Base Parts Inventory Schema
class PartsInventoryBase(BaseModel):
    part_number: str
    name: str
    category: PartCategory
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    supplier: Optional[str] = None
    unit_cost: float
    current_stock: int = 0
    min_stock_level: int = 0
    max_stock_level: Optional[int] = None
    location: Optional[str] = None

    @field_validator('category', mode='before')
    def convert_category_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

# Create Parts Inventory Schema
class PartsInventoryCreate(PartsInventoryBase):
    pass

# Update Parts Inventory Schema
class PartsInventoryUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[PartCategory] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    supplier: Optional[str] = None
    unit_cost: Optional[float] = None
    current_stock: Optional[int] = None
    min_stock_level: Optional[int] = None
    max_stock_level: Optional[int] = None
    location: Optional[str] = None
    status: Optional[PartStatus] = None
    is_active: Optional[bool] = None

    @field_validator('category', mode='before')
    def convert_category_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

# Parts Inventory Response Schema
class PartsInventory(PartsInventoryBase):
    id: int
    status: PartStatus
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Parts Usage Schema
class PartsUsageCreate(BaseModel):
    service_id: int
    part_id: int
    quantity_used: int
    unit_cost_at_time: float
    notes: Optional[str] = None

# Parts Usage Response Schema
class PartsUsage(BaseModel):
    id: int
    service_id: int
    part_id: int
    quantity_used: int
    unit_cost_at_time: float
    total_cost: float
    notes: Optional[str] = None
    used_at: datetime
    
    class Config:
        from_attributes = True

# Stock Update Schema
class StockUpdate(BaseModel):
    quantity_change: int  # Positive for addition, negative for reduction
    reason: str  # e.g., "service_usage", "restock", "damage"
    notes: Optional[str] = None