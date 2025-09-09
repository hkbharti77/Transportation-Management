from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin, require_driver_or_admin
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from app.models.fleet import Driver
from app.schemas.vehicle import VehicleCreate, Vehicle as VehicleSchema, VehicleUpdate
from app.models.log import Log
from datetime import datetime

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

# ==================== VEHICLE MANAGEMENT ====================

@router.post("/", response_model=VehicleSchema)
def create_vehicle(
    vehicle: VehicleCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new vehicle (Admin only)"""
    # Check if license plate already exists
    existing_vehicle = db.query(Vehicle).filter(Vehicle.license_plate == vehicle.license_plate).first()
    if existing_vehicle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vehicle with license plate '{vehicle.license_plate}' already exists"
        )
    
    # Validate assigned_driver_id if provided
    if vehicle.assigned_driver_id is not None:
        driver = db.query(Driver).filter(Driver.id == vehicle.assigned_driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Driver with ID {vehicle.assigned_driver_id} not found"
            )
    
    db_vehicle = Vehicle(**vehicle.dict())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="create_vehicle",
        resource_type="vehicle",
        resource_id=db_vehicle.id,
        details={"license_plate": vehicle.license_plate, "type": vehicle.type.value}
    )
    db.add(log)
    db.commit()
    
    return db_vehicle

@router.get("/", response_model=List[VehicleSchema])
def get_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    vehicle_type: Optional[VehicleType] = None,
    status: Optional[VehicleStatus] = None,
    assigned_driver_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get vehicles with filtering and pagination"""
    query = db.query(Vehicle)
    
    # Apply filters
    if vehicle_type:
        query = query.filter(Vehicle.type == vehicle_type)
    if status:
        query = query.filter(Vehicle.status == status)
    if assigned_driver_id is not None:
        if assigned_driver_id == 0:
            # Filter for unassigned vehicles
            query = query.filter(Vehicle.assigned_driver_id.is_(None))
        else:
            query = query.filter(Vehicle.assigned_driver_id == assigned_driver_id)
    
    # Apply pagination
    vehicles = query.offset(skip).limit(limit).all()
    return vehicles

@router.get("/{vehicle_id}", response_model=VehicleSchema)
def get_vehicle(
    vehicle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get vehicle by ID"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleSchema)
def update_vehicle(
    vehicle_id: int,
    vehicle_update: VehicleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update vehicle (Admin only)"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Check license plate uniqueness if being updated
    if vehicle_update.license_plate and vehicle_update.license_plate != vehicle.license_plate:
        existing = db.query(Vehicle).filter(
            Vehicle.license_plate == vehicle_update.license_plate,
            Vehicle.id != vehicle_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vehicle with license plate '{vehicle_update.license_plate}' already exists"
            )
    
    # Validate assigned_driver_id if being updated
    if vehicle_update.assigned_driver_id is not None:
        driver = db.query(Driver).filter(Driver.id == vehicle_update.assigned_driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Driver with ID {vehicle_update.assigned_driver_id} not found"
            )
    
    # Update vehicle fields
    update_data = vehicle_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        # Handle enum fields explicitly
        if field == 'type' and hasattr(value, 'value'):
            setattr(vehicle, field, value.value)
        elif field == 'status' and hasattr(value, 'value'):
            setattr(vehicle, field, value.value)
        else:
            setattr(vehicle, field, value)
    
    db.commit()
    db.refresh(vehicle)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="update_vehicle",
        resource_type="vehicle",
        resource_id=vehicle_id,
        details={"updated_fields": list(update_data.keys())}
    )
    db.add(log)
    db.commit()
    
    return vehicle

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Soft delete vehicle (Admin only)"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Check if vehicle has active orders or trips
    from app.models.order import Order, OrderStatus
    from app.models.trip import Trip, TripStatus
    
    active_orders = db.query(Order).filter(
        Order.vehicle_id == vehicle_id,
        Order.status.in_([OrderStatus.PENDING, OrderStatus.ASSIGNED, OrderStatus.IN_PROGRESS])
    ).count()
    
    active_trips = db.query(Trip).filter(
        Trip.vehicle_id == vehicle_id,
        Trip.status.in_([TripStatus.SCHEDULED, TripStatus.IN_PROGRESS])
    ).count()
    
    if active_orders > 0 or active_trips > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete vehicle with active orders or trips. Please complete or reassign them first."
        )
    
    # Soft delete by setting status to retired
    vehicle.status = VehicleStatus.RETIRED
    db.commit()
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="delete_vehicle",
        resource_type="vehicle",
        resource_id=vehicle_id,
        details={"license_plate": vehicle.license_plate}
    )
    db.add(log)
    db.commit()
    
    return {"message": f"Vehicle {vehicle.license_plate} has been retired successfully"}

# ==================== VEHICLE STATUS MANAGEMENT ====================

@router.put("/{vehicle_id}/status")
def update_vehicle_status(
    vehicle_id: int,
    status: VehicleStatus,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update vehicle status (Admin only)"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    old_status = vehicle.status
    vehicle.status = status
    db.commit()
    db.refresh(vehicle)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="update_vehicle_status",
        resource_type="vehicle",
        resource_id=vehicle_id,
        details={
            "old_status": old_status.value,
            "new_status": status.value,
            "license_plate": vehicle.license_plate
        }
    )
    db.add(log)
    db.commit()
    
    return {
        "message": f"Vehicle {vehicle.license_plate} status updated to {status.value}",
        "vehicle_id": vehicle_id,
        "license_plate": vehicle.license_plate,
        "old_status": old_status.value,
        "new_status": status.value
    }

# ==================== DRIVER ASSIGNMENT ====================

@router.put("/{vehicle_id}/assign-driver")
def assign_driver_to_vehicle(
    vehicle_id: int,
    driver_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Assign driver to vehicle (Admin only)"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found"
        )
    
    # Check if driver is available
    if not driver.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver is not available"
        )
    
    # Check if vehicle is available for assignment
    if vehicle.status not in [VehicleStatus.ACTIVE, VehicleStatus.INACTIVE]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vehicle with status '{vehicle.status.value}' cannot be assigned to driver"
        )
    
    old_driver_id = vehicle.assigned_driver_id
    vehicle.assigned_driver_id = driver_id
    db.commit()
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="assign_driver_to_vehicle",
        resource_type="vehicle",
        resource_id=vehicle_id,
        details={
            "driver_id": driver_id,
            "old_driver_id": old_driver_id,
            "license_plate": vehicle.license_plate
        }
    )
    db.add(log)
    db.commit()
    
    return {
        "message": f"Driver {driver.user.name} assigned to vehicle {vehicle.license_plate}",
        "vehicle_id": vehicle_id,
        "driver_id": driver_id,
        "license_plate": vehicle.license_plate
    }

@router.delete("/{vehicle_id}/unassign-driver")
def unassign_driver_from_vehicle(
    vehicle_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Unassign driver from vehicle (Admin only)"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    if not vehicle.assigned_driver_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle has no assigned driver"
        )
    
    old_driver_id = vehicle.assigned_driver_id
    vehicle.assigned_driver_id = None
    db.commit()
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="unassign_driver_from_vehicle",
        resource_type="vehicle", 
        resource_id=vehicle_id,
        details={
            "old_driver_id": old_driver_id,
            "license_plate": vehicle.license_plate
        }
    )
    db.add(log)
    db.commit()
    
    return {
        "message": f"Driver unassigned from vehicle {vehicle.license_plate}",
        "vehicle_id": vehicle_id,
        "license_plate": vehicle.license_plate
    }

# ==================== VEHICLE STATISTICS ====================

@router.get("/stats/summary")
def get_vehicle_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get vehicle summary statistics"""
    total_vehicles = db.query(Vehicle).count()
    active_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.ACTIVE).count()
    inactive_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.INACTIVE).count()
    maintenance_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.MAINTENANCE).count()
    retired_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.RETIRED).count()
    
    assigned_vehicles = db.query(Vehicle).filter(Vehicle.assigned_driver_id.isnot(None)).count()
    unassigned_vehicles = db.query(Vehicle).filter(Vehicle.assigned_driver_id.is_(None)).count()
    
    # Vehicle count by type
    vehicle_types = {}
    for vehicle_type in VehicleType:
        count = db.query(Vehicle).filter(Vehicle.type == vehicle_type).count()
        vehicle_types[vehicle_type.value] = count
    
    return {
        "total_vehicles": total_vehicles,
        "status_breakdown": {
            "active": active_vehicles,
            "inactive": inactive_vehicles,
            "maintenance": maintenance_vehicles,
            "retired": retired_vehicles
        },
        "assignment_breakdown": {
            "assigned": assigned_vehicles,
            "unassigned": unassigned_vehicles
        },
        "type_breakdown": vehicle_types
    }