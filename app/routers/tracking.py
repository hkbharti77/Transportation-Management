from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.services.tracking_service import TrackingService
from app.schemas.tracking import (
    LocationCreate, LocationUpdate, LocationResponse,
    ETARequest, ETAResponse,
    GeofenceCreate, GeofenceUpdate, GeofenceResponse,
    TruckTrackingResponse, TrackingDashboardResponse
)

router = APIRouter(prefix="/tracking", tags=["tracking"])

# GPS location update
@router.post("/location", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(
    payload: LocationCreate,
    db: Session = Depends(get_db)
):
    service = TrackingService(db)
    return service.create_location(payload)

@router.put("/location/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: int,
    payload: LocationUpdate,
    db: Session = Depends(get_db)
):
    service = TrackingService(db)
    return service.update_location(location_id, payload)

# Fetch real-time truck position by booking_id
@router.get("/booking/{booking_id}/position", response_model=LocationResponse)
def get_position_by_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    service = TrackingService(db)
    loc = service.get_booking_truck_location(booking_id)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found for booking")
    return loc

# Current truck position
@router.get("/truck/{truck_id}/current", response_model=LocationResponse)
def get_truck_current_location(
    truck_id: int,
    db: Session = Depends(get_db)
):
    service = TrackingService(db)
    loc = service.get_truck_current_location(truck_id)
    if not loc:
        raise HTTPException(status_code=404, detail="No location found")
    return loc

# Truck tracking history
@router.get("/truck/{truck_id}/history", response_model=TruckTrackingResponse)
def get_truck_history(
    truck_id: int,
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    service = TrackingService(db)
    return service.get_truck_tracking_history(truck_id, start_time, end_time)

# ETA calculation
@router.post("/eta", response_model=ETAResponse)
def calculate_eta(
    payload: ETARequest,
    db: Session = Depends(get_db)
):
    service = TrackingService(db)
    return service.calculate_eta(payload)

# Geofences
@router.post("/geofences", response_model=GeofenceResponse, status_code=status.HTTP_201_CREATED)
def create_geofence(
    payload: GeofenceCreate,
    db: Session = Depends(get_db)
):
    service = TrackingService(db)
    return service.create_geofence(payload)

@router.get("/geofences", response_model=List[GeofenceResponse])
def list_geofences(
    db: Session = Depends(get_db)
):
    service = TrackingService(db)
    return service.get_all_geofences()

@router.put("/geofences/{geofence_id}", response_model=GeofenceResponse)
def update_geofence(
    geofence_id: int,
    payload: GeofenceUpdate,
    db: Session = Depends(get_db)
):
    service = TrackingService(db)
    return service.update_geofence(geofence_id, payload)

@router.delete("/geofences/{geofence_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_geofence(
    geofence_id: int,
    db: Session = Depends(get_db)
):
    service = TrackingService(db)
    service.delete_geofence(geofence_id)
    return {"message": "Deleted"}

# Dashboard overview
@router.get("/dashboard", response_model=TrackingDashboardResponse)
def tracking_dashboard(
    db: Session = Depends(get_db)
):
    service = TrackingService(db)
    data = service.get_tracking_dashboard_data()
    return TrackingDashboardResponse(
        total_trucks=data["total_trucks"],
        online_trucks=data["online_trucks"],
        active_trips=data["active_trips"],
        total_distance_today=data["total_distance_today"],
        average_speed=data["average_speed"],
        recent_locations=data["recent_locations"],
        geofence_alerts=data["geofence_alerts"]
    )
