from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.models.route import Route
from app.models.trip import Trip
from app.schemas.route import RouteCreate, Route as RouteSchema, RouteUpdate
from app.models.log import Log
from datetime import datetime

router = APIRouter(prefix="/routes", tags=["routes"])

@router.post("/", response_model=RouteSchema)
def create_route(
    route: RouteCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new route (Admin only)"""
    
    # Validate route number uniqueness
    existing_route = db.query(Route).filter(Route.route_number == route.route_number).first()
    if existing_route:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Route number {route.route_number} already exists"
        )
    
    # Validate business logic
    if route.estimated_time <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Estimated time must be positive"
        )
    
    if route.distance <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Distance must be positive"
        )
    
    if route.base_fare < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Base fare must be non-negative"
        )
    
    if not route.stops or len(route.stops) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Route must have at least 2 stops"
        )
    
    # Create the route
    db_route = Route(**route.dict())
    
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="create_route",
        resource_type="route",
        resource_id=db_route.id,
        details={
            "route_id": db_route.id, 
            "route_number": route.route_number,
            "start_point": route.start_point,
            "end_point": route.end_point
        }
    )
    db.add(log)
    db.commit()
    
    return db_route

@router.get("/", response_model=List[RouteSchema])
def get_routes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get routes with pagination and filtering"""
    query = db.query(Route)
    
    # Filter by active status
    if is_active is not None:
        query = query.filter(Route.is_active == is_active)
    
    # Search filter (route number, start/end points)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Route.route_number.ilike(search_filter)) |
            (Route.start_point.ilike(search_filter)) |
            (Route.end_point.ilike(search_filter))
        )
    
    routes = query.offset(skip).limit(limit).all()
    return routes

@router.get("/{route_id}", response_model=RouteSchema)
def get_route(route_id: int, db: Session = Depends(get_db)):
    """Get a specific route by ID"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    return route

@router.put("/{route_id}", response_model=RouteSchema)
def update_route(
    route_id: int,
    route_update: RouteUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a route (Admin only)"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Validate route number uniqueness if being updated
    if route_update.route_number and route_update.route_number != route.route_number:
        existing_route = db.query(Route).filter(
            Route.route_number == route_update.route_number,
            Route.id != route_id
        ).first()
        if existing_route:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Route number {route_update.route_number} already exists"
            )
    
    # Validate business logic
    if route_update.estimated_time is not None and route_update.estimated_time <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Estimated time must be positive"
        )
    
    if route_update.distance is not None and route_update.distance <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Distance must be positive"
        )
    
    if route_update.base_fare is not None and route_update.base_fare < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Base fare must be non-negative"
        )
    
    if route_update.stops is not None and (not route_update.stops or len(route_update.stops) < 2):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Route must have at least 2 stops"
        )
    
    # Update route fields
    update_data = route_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(route, field, value)
    
    db.commit()
    db.refresh(route)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="update_route",
        resource_type="route",
        resource_id=route.id,
        details={"route_id": route.id, "updated_fields": list(update_data.keys())}
    )
    db.add(log)
    db.commit()
    
    return route

@router.delete("/{route_id}")
def delete_route(
    route_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a route (Admin only) - Only if no active trips exist"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Check if route has active trips
    active_trips = db.query(Trip).filter(
        Trip.route_id == route_id,
        Trip.status.in_(["SCHEDULED", "IN_PROGRESS"])
    ).count()
    
    if active_trips > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete route with {active_trips} active trips. Cancel or complete trips first."
        )
    
    # Log the action before deletion
    log = Log(
        user_id=current_user.id,
        action="delete_route",
        resource_type="route",
        resource_id=route.id,
        details={
            "route_id": route.id,
            "route_number": route.route_number,
            "start_point": route.start_point,
            "end_point": route.end_point
        }
    )
    db.add(log)
    
    # Soft delete - mark as inactive instead of hard delete
    setattr(route, 'is_active', False)
    db.commit()
    
    db.add(log)
    db.commit()
    
    return {"message": f"Route {route.route_number} has been deactivated"}

@router.get("/{route_id}/trips", response_model=List[dict])
def get_route_trips(
    route_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all trips for a specific route"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    trips = db.query(Trip).filter(Trip.route_id == route_id).offset(skip).limit(limit).all()
    
    return [
        {
            "id": trip.id,
            "departure_time": trip.departure_time,
            "arrival_time": trip.arrival_time,
            "status": trip.status.value,
            "fare": trip.fare,
            "available_seats": trip.available_seats,
            "total_seats": trip.total_seats
        }
        for trip in trips
    ]

@router.get("/{route_id}/stats", response_model=dict)
def get_route_stats(route_id: int, db: Session = Depends(get_db)):
    """Get statistics for a specific route"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Get trip statistics
    total_trips = db.query(Trip).filter(Trip.route_id == route_id).count()
    active_trips = db.query(Trip).filter(
        Trip.route_id == route_id,
        Trip.status.in_(["SCHEDULED", "IN_PROGRESS"])
    ).count()
    completed_trips = db.query(Trip).filter(
        Trip.route_id == route_id,
        Trip.status == "COMPLETED"
    ).count()
    
    return {
        "route_id": route_id,
        "route_number": route.route_number,
        "total_trips": total_trips,
        "active_trips": active_trips,
        "completed_trips": completed_trips,
        "completion_rate": (completed_trips / total_trips * 100) if total_trips > 0 else 0,
        "base_fare": route.base_fare,
        "estimated_time": route.estimated_time,
        "distance": route.distance
    }