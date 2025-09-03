from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.models.fleet import Fleet, Truck, Driver, TruckStatus, DriverStatus, TruckLocation
from app.schemas.fleet import (
    FleetCreate, Fleet as FleetSchema, FleetUpdate, FleetWithTrucks, FleetSummary,
    TruckCreate, Truck as TruckSchema, TruckUpdate, TruckWithDriver, TruckStatusUpdate,
    DriverCreate, Driver as DriverSchema, DriverUpdate, DriverWithTruck, DriverStatusUpdate,
    DriverTruckAssignment, TruckLocationCreate, TruckLocation as TruckLocationSchema
)
from app.models.log import Log
from datetime import datetime

router = APIRouter(prefix="/fleet", tags=["fleet"])

# ==================== TRUCK MANAGEMENT ====================

@router.post("/trucks", response_model=TruckSchema)
def create_truck(
    truck: TruckCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new truck (Admin only)"""
    # Validate fleet_id if provided
    if truck.fleet_id is not None:
        fleet = db.query(Fleet).filter(Fleet.id == truck.fleet_id).first()
        if not fleet:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Fleet with ID {truck.fleet_id} not found"
            )
    
    # Validate assigned_driver_id if provided
    if truck.assigned_driver_id is not None:
        driver = db.query(Driver).filter(Driver.id == truck.assigned_driver_id).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Driver with ID {truck.assigned_driver_id} not found"
            )
    
    db_truck = Truck(**truck.dict())
    db.add(db_truck)
    db.commit()
    db.refresh(db_truck)
    
    log = Log(
        user_id=current_user.id,
        action="create_truck",
        resource_type="truck",
        resource_id=db_truck.id,
        details={"truck_number": truck.truck_number}
    )
    db.add(log)
    db.commit()
    
    return db_truck

@router.get("/trucks", response_model=List[TruckSchema])
def get_trucks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[TruckStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get trucks with filtering"""
    query = db.query(Truck)
    
    if status:
        query = query.filter(Truck.status == status)
    
    trucks = query.offset(skip).limit(limit).all()
    return trucks

@router.get("/trucks/{truck_id}", response_model=TruckSchema)
def get_truck(
    truck_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get truck by ID"""
    truck = db.query(Truck).filter(Truck.id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    return truck

@router.put("/trucks/{truck_id}", response_model=TruckSchema)
def update_truck(
    truck_id: int,
    truck_update: TruckUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update truck (Admin only)"""
    truck = db.query(Truck).filter(Truck.id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    for field, value in truck_update.dict(exclude_unset=True).items():
        setattr(truck, field, value)
    
    db.commit()
    db.refresh(truck)
    
    log = Log(
        user_id=current_user.id,
        action="update_truck",
        resource_type="truck",
        resource_id=truck_id,
        details={"updated_fields": list(truck_update.dict(exclude_unset=True).keys())}
    )
    db.add(log)
    db.commit()
    
    return truck

@router.put("/trucks/{truck_id}/status", response_model=TruckSchema)
def update_truck_status(
    truck_id: int,
    status_update: TruckStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update truck status (Admin only)"""
    truck = db.query(Truck).filter(Truck.id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    truck.status = status_update.status
    db.commit()
    db.refresh(truck)
    
    log = Log(
        user_id=current_user.id,
        action="update_truck_status",
        resource_type="truck",
        resource_id=truck_id,
        details={"new_status": status_update.status.value, "notes": status_update.notes}
    )
    db.add(log)
    db.commit()
    
    return truck

# ==================== DRIVER MANAGEMENT ====================

@router.post("/drivers", response_model=DriverSchema)
def create_driver(
    driver: DriverCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new driver (Admin only)"""
    db_driver = Driver(**driver.dict())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    
    log = Log(
        user_id=current_user.id,
        action="create_driver",
        resource_type="driver",
        resource_id=db_driver.id,
        details={"employee_id": driver.employee_id}
    )
    db.add(log)
    db.commit()
    
    return db_driver

@router.get("/drivers", response_model=List[DriverSchema])
def get_drivers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get drivers"""
    drivers = db.query(Driver).offset(skip).limit(limit).all()
    return drivers

@router.get("/drivers/{driver_id}", response_model=DriverSchema)
def get_driver(
    driver_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get driver by ID"""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.put("/drivers/{driver_id}", response_model=DriverSchema)
def update_driver(
    driver_id: int,
    driver_update: DriverUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update driver (Admin only)"""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    for field, value in driver_update.dict(exclude_unset=True).items():
        setattr(driver, field, value)
    
    db.commit()
    db.refresh(driver)
    
    log = Log(
        user_id=current_user.id,
        action="update_driver",
        resource_type="driver",
        resource_id=driver_id,
        details={"updated_fields": list(driver_update.dict(exclude_unset=True).keys())}
    )
    db.add(log)
    db.commit()
    
    return driver

@router.put("/drivers/{driver_id}/status", response_model=DriverSchema)
def update_driver_status(
    driver_id: int,
    status_update: DriverStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update driver status (Admin only)"""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    driver.status = status_update.status
    db.commit()
    db.refresh(driver)
    
    log = Log(
        user_id=current_user.id,
        action="update_driver_status",
        resource_type="driver",
        resource_id=driver_id,
        details={"new_status": status_update.status.value, "notes": status_update.notes}
    )
    db.add(log)
    db.commit()
    
    return driver

# ==================== FLEET MANAGEMENT ====================

@router.post("/", response_model=FleetSchema)
def create_fleet(
    fleet: FleetCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new fleet (Admin only)"""
    db_fleet = Fleet(**fleet.dict())
    db.add(db_fleet)
    db.commit()
    db.refresh(db_fleet)
    
    log = Log(
        user_id=current_user.id,
        action="create_fleet",
        resource_type="fleet",
        resource_id=db_fleet.id,
        details={"fleet_name": fleet.name}
    )
    db.add(log)
    db.commit()
    
    return db_fleet

@router.post("/default", response_model=FleetSchema)
def create_default_fleet(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a default fleet for the system (Admin only)"""
    # Check if default fleet already exists
    existing_fleet = db.query(Fleet).filter(Fleet.name == "Default Fleet").first()
    if existing_fleet:
        return existing_fleet
    
    default_fleet = Fleet(
        name="Default Fleet",
        description="Default fleet for the transportation system",
        is_active=True
    )
    db.add(default_fleet)
    db.commit()
    db.refresh(default_fleet)
    
    log = Log(
        user_id=current_user.id,
        action="create_default_fleet",
        resource_type="fleet",
        resource_id=default_fleet.id,
        details={"fleet_name": "Default Fleet"}
    )
    db.add(log)
    db.commit()
    
    return default_fleet

@router.get("/", response_model=List[FleetSchema])
def get_fleets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all fleets"""
    query = db.query(Fleet)
    
    if is_active is not None:
        query = query.filter(Fleet.is_active == is_active)
    
    fleets = query.offset(skip).limit(limit).all()
    return fleets

# ==================== FLEET SUMMARY ====================

@router.get("/summary", response_model=FleetSummary)
def get_fleet_summary(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get fleet summary (Admin only)"""
    total_trucks = db.query(Truck).filter(Truck.is_active == True).count()
    available_trucks = db.query(Truck).filter(
        Truck.is_active == True, Truck.status == TruckStatus.AVAILABLE
    ).count()
    busy_trucks = db.query(Truck).filter(
        Truck.is_active == True, Truck.status == TruckStatus.BUSY
    ).count()
    maintenance_trucks = db.query(Truck).filter(
        Truck.is_active == True, Truck.status == TruckStatus.MAINTENANCE
    ).count()
    
    total_drivers = db.query(Driver).filter(Driver.status != DriverStatus.SUSPENDED).count()
    available_drivers = db.query(Driver).filter(
        Driver.status == DriverStatus.ACTIVE, Driver.is_available == True
    ).count()
    on_trip_drivers = db.query(Driver).filter(Driver.status == DriverStatus.ON_TRIP).count()
    
    return FleetSummary(
        total_trucks=total_trucks,
        available_trucks=available_trucks,
        busy_trucks=busy_trucks,
        maintenance_trucks=maintenance_trucks,
        total_drivers=total_drivers,
        available_drivers=available_drivers,
        on_trip_drivers=on_trip_drivers
    )

@router.get("/{fleet_id}", response_model=FleetWithTrucks)
def get_fleet(
    fleet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get fleet by ID with trucks"""
    fleet = db.query(Fleet).filter(Fleet.id == fleet_id).first()
    if not fleet:
        raise HTTPException(status_code=404, detail="Fleet not found")
    return fleet

@router.put("/{fleet_id}", response_model=FleetSchema)
def update_fleet(
    fleet_id: int,
    fleet_update: FleetUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update fleet (Admin only)"""
    fleet = db.query(Fleet).filter(Fleet.id == fleet_id).first()
    if not fleet:
        raise HTTPException(status_code=404, detail="Fleet not found")
    
    for field, value in fleet_update.dict(exclude_unset=True).items():
        setattr(fleet, field, value)
    
    db.commit()
    db.refresh(fleet)
    
    log = Log(
        user_id=current_user.id,
        action="update_fleet",
        resource_type="fleet",
        resource_id=fleet_id,
        details={"updated_fields": list(fleet_update.dict(exclude_unset=True).keys())}
    )
    db.add(log)
    db.commit()
    
    return fleet

# ==================== ASSIGNMENT MANAGEMENT ====================

@router.post("/assign", response_model=dict)
def assign_driver_to_truck(
    assignment: DriverTruckAssignment,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Assign driver to truck (Admin only)"""
    driver = db.query(Driver).filter(Driver.id == assignment.driver_id).first()
    truck = db.query(Truck).filter(Truck.id == assignment.truck_id).first()
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    # Check if driver is available
    if not driver.is_available:
        raise HTTPException(status_code=400, detail="Driver is not available")
    
    # Check if truck is available
    if truck.status != TruckStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Truck is not available")
    
    # Update assignments
    driver.assigned_truck_id = assignment.truck_id
    truck.assigned_driver_id = assignment.driver_id
    
    db.commit()
    
    log = Log(
        user_id=current_user.id,
        action="assign_driver_to_truck",
        resource_type="assignment",
        resource_id=0,
        details={"driver_id": assignment.driver_id, "truck_id": assignment.truck_id}
    )
    db.add(log)
    db.commit()
    
    return {"message": "Driver assigned to truck successfully"}

@router.delete("/assign/{driver_id}")
def unassign_driver(
    driver_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Unassign driver from truck (Admin only)"""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    if not driver.assigned_truck_id:
        raise HTTPException(status_code=400, detail="Driver is not assigned to any truck")
    
    truck_id = driver.assigned_truck_id
    
    # Remove assignments
    driver.assigned_truck_id = None
    truck = db.query(Truck).filter(Truck.id == truck_id).first()
    if truck:
        truck.assigned_driver_id = None
    
    db.commit()
    
    log = Log(
        user_id=current_user.id,
        action="unassign_driver",
        resource_type="assignment",
        resource_id=0,
        details={"driver_id": driver_id, "truck_id": truck_id}
    )
    db.add(log)
    db.commit()
    
    return {"message": "Driver unassigned successfully"}

# ==================== LOCATION TRACKING ====================

@router.post("/trucks/{truck_id}/location", response_model=TruckLocationSchema)
def update_truck_location(
    truck_id: int,
    location: TruckLocationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update truck location (Driver or Admin only)"""
    truck = db.query(Truck).filter(Truck.id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    # Create location record
    db_location = TruckLocation(**location.dict())
    db.add(db_location)
    
    # Update truck's current location
    truck.current_location_lat = location.latitude
    truck.current_location_lng = location.longitude
    truck.last_location_update = datetime.utcnow()
    
    db.commit()
    db.refresh(db_location)
    
    return db_location

@router.get("/trucks/{truck_id}/location", response_model=List[TruckLocationSchema])
def get_truck_location_history(
    truck_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get truck location history"""
    truck = db.query(Truck).filter(Truck.id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    locations = db.query(TruckLocation).filter(
        TruckLocation.truck_id == truck_id
    ).order_by(TruckLocation.timestamp.desc()).offset(skip).limit(limit).all()
    
    return locations

# ==================== ASSIGNMENT MANAGEMENT ====================
