from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin, require_driver_or_admin
from app.models.user import User
from app.models.service import Service, ServiceStatus, ServiceType
from app.models.parts_inventory import PartsInventory
from app.models.parts_usage import PartsUsage
from app.schemas.service import ServiceCreate, Service as ServiceSchema, ServiceUpdate, ServiceStatusUpdate, ServiceList
from app.schemas.parts import PartsInventoryCreate, PartsInventory as PartsInventorySchema, PartsInventoryUpdate, PartsUsageCreate, StockUpdate
from app.models.log import Log
from datetime import datetime

router = APIRouter(prefix="/services", tags=["services"])

# Service Management Endpoints
@router.post("/", response_model=ServiceSchema)
def create_service(
    service: ServiceCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new service record (Admin only)"""
    # Dump enums as their values to align with DB enums
    try:
        service_data = service.model_dump(by_alias=False, exclude_unset=True, exclude_none=True, round_trip=False, warnings=None, use_enum_values=True)  # type: ignore[arg-type]
    except TypeError:
        # Fallback for Pydantic v1
        service_data = service.dict()
        if hasattr(service, 'service_type'):
            service_data['service_type'] = getattr(service.service_type, 'value', service.service_type)
        if hasattr(service, 'priority'):
            service_data['priority'] = getattr(service.priority, 'value', service.priority)

    # Coerce status to DB's expected label (enum VALUE, e.g., 'scheduled') if provided
    from app.models.service import ServiceStatus as _SvcStatus  # local alias to avoid confusion
    input_status = service_data.pop('status', None)
    if input_status is not None:
        # Try interpret as enum value first (e.g., 'scheduled'), else as name (e.g., 'SCHEDULED')
        try:
            status_enum = _SvcStatus(input_status)
        except Exception:
            try:
                status_enum = _SvcStatus[input_status]
            except Exception:
                # Fallback: lowercase string
                service_data['status'] = str(input_status).lower()
            else:
                service_data['status'] = status_enum.value
        else:
            service_data['status'] = status_enum.value

    # Validate optional foreign keys
    assigned_mechanic_id = service_data.get("assigned_mechanic_id")
    if assigned_mechanic_id is not None:
        mechanic = db.query(User).filter(User.id == assigned_mechanic_id).first()
        if mechanic is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Assigned mechanic with ID {assigned_mechanic_id} not found")

    db_service = Service(**service_data)
    db.add(db_service)

    try:
        db.commit()
    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create service: {str(ex)}")

    db.refresh(db_service)
    
    # Log the action (best-effort)
    try:
        log = Log(
            user_id=current_user.id,
            action="create_service",
            resource_type="service",
            resource_id=db_service.id,
            details={"service_type": getattr(service.service_type, 'value', service.service_type), "vehicle_id": service.vehicle_id}
        )
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()
    
    return db_service

@router.get("/", response_model=List[ServiceList])
def get_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[ServiceStatus] = None,
    service_type: Optional[ServiceType] = None,
    vehicle_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get services with pagination and filtering (limited fields)"""
    query = db.query(Service)
    
    if status:
        query = query.filter(Service.status == status)
    if service_type:
        query = query.filter(Service.service_type == service_type)
    if vehicle_id:
        query = query.filter(Service.vehicle_id == vehicle_id)
    
    # Non-admin users can only see services for vehicles they have access to
    if current_user.role.value != "admin":
        if current_user.role.value == "driver":
            if hasattr(current_user, 'driver_profile') and current_user.driver_profile.assigned_vehicle:
                query = query.filter(Service.vehicle_id == current_user.driver_profile.assigned_vehicle.id)
            else:
                query = query.filter(Service.id == 0)
        else:
            query = query.filter(Service.id == 0)
    
    services = query.offset(skip).limit(limit).all()
    return services

@router.get("/{service_id:int}", response_model=ServiceSchema)
def get_service(
    service_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific service by ID"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Check access permissions
    if current_user.role.value != "admin":
        if current_user.role.value == "driver":
            if not hasattr(current_user, 'driver_profile') or not current_user.driver_profile.assigned_vehicle:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No vehicle assigned")
            if service.vehicle_id != current_user.driver_profile.assigned_vehicle.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    return service

@router.put("/{service_id:int}/status", response_model=ServiceSchema)
def update_service_status(
    service_id: int,
    status_update: ServiceStatusUpdate,
    current_user: User = Depends(require_driver_or_admin),
    db: Session = Depends(get_db)
):
    """Update service status (Driver or Admin only)"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Check if user has access to this service
    if current_user.role.value == "driver":
        if not hasattr(current_user, 'driver_profile') or not current_user.driver_profile.assigned_vehicle:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No vehicle assigned")
        if service.vehicle_id != current_user.driver_profile.assigned_vehicle.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    # Update service
    new_status_value = getattr(status_update.status, 'value', None)
    if not new_status_value:
        tmp = getattr(status_update.status, 'name', status_update.status)
        new_status_value = str(tmp).lower()
    service.status = new_status_value
    if status_update.actual_duration:
        service.actual_duration = status_update.actual_duration
    if status_update.notes:
        service.notes = status_update.notes
    
    # Set completion time if service is completed
    from app.models.service import ServiceStatus as _SvcStatus  # local alias to avoid confusion
    if new_status_value == _SvcStatus.COMPLETED.value:
        service.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(service)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="update_service_status",
        resource_type="service",
        resource_id=service.id,
        details={"new_status": new_status_value}
    )
    db.add(log)
    db.commit()
    
    return service

# Parts Inventory Management Endpoints
@router.post("/parts", response_model=PartsInventorySchema)
def create_part(
    part: PartsInventoryCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new part in inventory (Admin only)"""
    # Build payload and serialize enum fields
    try:
        part_data = part.model_dump(use_enum_values=True)  # pydantic v2
    except Exception:
        part_data = part.dict()
        if hasattr(part, 'category'):
            part_data['category'] = getattr(part.category, 'value', part.category)
    
    db_part = PartsInventory(**part_data)
    
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="create_part",
        resource_type="parts_inventory",
        resource_id=db_part.id,
        details={"part_number": db_part.part_number, "name": db_part.name}
    )
    db.add(log)
    db.commit()
    
    return db_part

@router.get("/parts", response_model=List[PartsInventorySchema])
def get_parts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get parts inventory with pagination and filtering"""
    query = db.query(PartsInventory)
    
    if category:
        query = query.filter(PartsInventory.category == category)
    if status:
        query = query.filter(PartsInventory.status == status)
    
    parts = query.offset(skip).limit(limit).all()
    return parts

@router.put("/parts/{part_id}/stock", response_model=PartsInventorySchema)
def update_part_stock(
    part_id: int,
    stock_update: StockUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update part stock levels (Admin only)"""
    part = db.query(PartsInventory).filter(PartsInventory.id == part_id).first()
    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )
    
    # Update stock
    new_stock = part.current_stock + stock_update.quantity_change
    if new_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock for this operation"
        )
    
    part.current_stock = new_stock
    
    # Update status based on stock levels
    if part.current_stock <= part.min_stock_level:
        part.status = "low_stock"
    elif part.current_stock == 0:
        part.status = "out_of_stock"
    else:
        part.status = "available"
    
    db.commit()
    db.refresh(part)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="update_part_stock",
        resource_type="parts_inventory",
        resource_id=part.id,
        details={
            "quantity_change": stock_update.quantity_change,
            "new_stock": new_stock,
            "reason": stock_update.reason
        }
    )
    db.add(log)
    db.commit()
    
    return part

# Service Parts Usage Endpoints
@router.post("/{service_id:int}/parts", response_model=dict)
def add_parts_to_service(
    service_id: int,
    parts_usage: List[PartsUsageCreate],
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add parts usage to a service (Admin only)"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    total_cost = 0
    used_parts = []
    
    for part_usage in parts_usage:
        # Check if part exists and has sufficient stock
        part = db.query(PartsInventory).filter(PartsInventory.id == part_usage.part_id).first()
        if not part:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Part with ID {part_usage.part_id} not found"
            )
        
        if part.current_stock < part_usage.quantity_used:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for part {part.name}"
            )
        
        # Calculate total cost
        total_cost_for_part = part_usage.quantity_used * part_usage.unit_cost_at_time
        total_cost += total_cost_for_part
        
        # Create parts usage record
        db_parts_usage = PartsUsage(
            service_id=service_id,
            part_id=part_usage.part_id,
            quantity_used=part_usage.quantity_used,
            unit_cost_at_time=part_usage.unit_cost_at_time,
            total_cost=total_cost_for_part,
            notes=part_usage.notes
        )
        
        # Update part stock
        part.current_stock -= part_usage.quantity_used
        if part.current_stock <= part.min_stock_level:
            part.status = "low_stock"
        if part.current_stock == 0:
            part.status = "out_of_stock"
        
        db.add(db_parts_usage)
        used_parts.append({
            "part_name": part.name,
            "quantity": part_usage.quantity_used,
            "cost": total_cost_for_part
        })
    
    # Update service cost
    service.cost += total_cost
    
    db.commit()
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="add_parts_to_service",
        resource_type="service",
        resource_id=service_id,
        details={"parts_added": len(parts_usage), "total_cost": total_cost}
    )
    db.add(log)
    db.commit()
    
    return {
        "message": "Parts added to service successfully",
        "total_cost": total_cost,
        "used_parts": used_parts
    }
