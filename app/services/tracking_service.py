from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import math
import json

from app.models.tracking import Location, TripLocation, Geofence, GeofenceEvent, LocationType
from app.models.vehicle import Vehicle
from app.models.booking import Booking
from app.models.trip import Trip
from app.schemas.tracking import (
    LocationCreate, LocationUpdate, TripLocationCreate,
    GeofenceCreate, GeofenceUpdate, ETARequest, ETAResponse
)
from fastapi import HTTPException, status

class TrackingService:
    """Service for real-time tracking functionality"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # Location management
    def create_location(self, location_data: LocationCreate) -> Location:
        """Create a new location record"""
        # Validate truck exists
        truck = self.db.query(Vehicle).filter(Vehicle.id == location_data.truck_id).first()
        if not truck:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Truck not found"
            )
        
        location = Location(
            truck_id=location_data.truck_id,
            latitude=location_data.latitude,
            longitude=location_data.longitude,
            altitude=location_data.altitude,
            speed=location_data.speed,
            heading=location_data.heading,
            accuracy=location_data.accuracy,
            location_type=location_data.location_type,
            timestamp=location_data.timestamp or datetime.utcnow()
        )
        
        self.db.add(location)
        self.db.commit()
        self.db.refresh(location)
        
        # Check geofence events
        self._check_geofence_events(location)
        
        return location
    
    def get_location(self, location_id: int) -> Optional[Location]:
        """Get location by ID"""
        return self.db.query(Location).filter(Location.location_id == location_id).first()
    
    def get_truck_locations(self, truck_id: int, limit: int = 100) -> List[Location]:
        """Get recent locations for a truck"""
        return self.db.query(Location).filter(
            Location.truck_id == truck_id
        ).order_by(desc(Location.timestamp)).limit(limit).all()
    
    def get_truck_current_location(self, truck_id: int) -> Optional[Location]:
        """Get current location for a truck"""
        return self.db.query(Location).filter(
            Location.truck_id == truck_id
        ).order_by(desc(Location.timestamp)).first()
    
    def get_booking_truck_location(self, booking_id: int) -> Optional[Location]:
        """Get truck location for a specific booking"""
        booking = self.db.query(Booking).filter(Booking.booking_id == booking_id).first()
        if not booking or not booking.truck_id:
            return None
        
        return self.get_truck_current_location(booking.truck_id)
    
    def update_location(self, location_id: int, location_update: LocationUpdate) -> Location:
        """Update location details"""
        location = self.get_location(location_id)
        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )
        
        update_data = location_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(location, field, value)
        
        self.db.commit()
        self.db.refresh(location)
        return location
    
    # ETA calculation
    def calculate_eta(self, eta_request: ETARequest) -> ETAResponse:
        """Calculate ETA between two points"""
        # Calculate distance using Haversine formula
        distance_km = self._calculate_distance(
            eta_request.source_lat, eta_request.source_lng,
            eta_request.dest_lat, eta_request.dest_lng
        )
        
        # Estimate duration based on transport mode
        avg_speed_kmh = self._get_average_speed(eta_request.transport_mode)
        duration_minutes = int((distance_km / avg_speed_kmh) * 60)
        
        # Calculate ETA
        eta = datetime.utcnow() + timedelta(minutes=duration_minutes)
        
        return ETAResponse(
            distance_km=distance_km,
            duration_minutes=duration_minutes,
            eta=eta,
            route_summary={
                "distance_km": distance_km,
                "duration_minutes": duration_minutes,
                "transport_mode": eta_request.transport_mode,
                "avg_speed_kmh": avg_speed_kmh
            }
        )
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    def _get_average_speed(self, transport_mode: str) -> float:
        """Get average speed for transport mode"""
        speeds = {
            "driving": 60.0,  # 60 km/h average
            "walking": 5.0,   # 5 km/h average
            "cycling": 15.0,  # 15 km/h average
            "transit": 30.0   # 30 km/h average
        }
        return speeds.get(transport_mode, 60.0)
    
    # Trip location management
    def add_trip_location(self, trip_location_data: TripLocationCreate) -> TripLocation:
        """Add location to a trip"""
        # Validate trip exists
        trip = self.db.query(Trip).filter(Trip.id == trip_location_data.trip_id).first()
        if not trip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trip not found"
            )
        
        # Validate location exists
        location = self.get_location(trip_location_data.location_id)
        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )
        
        trip_location = TripLocation(
            trip_id=trip_location_data.trip_id,
            location_id=trip_location_data.location_id,
            sequence_number=trip_location_data.sequence_number,
            is_checkpoint=trip_location_data.is_checkpoint,
            notes=trip_location_data.notes
        )
        
        self.db.add(trip_location)
        self.db.commit()
        self.db.refresh(trip_location)
        return trip_location
    
    def get_trip_locations(self, trip_id: int) -> List[TripLocation]:
        """Get all locations for a trip"""
        return self.db.query(TripLocation).filter(
            TripLocation.trip_id == trip_id
        ).order_by(TripLocation.sequence_number).all()
    
    # Geofence management
    def create_geofence(self, geofence_data: GeofenceCreate) -> Geofence:
        """Create a new geofence"""
        geofence = Geofence(
            name=geofence_data.name,
            description=geofence_data.description,
            latitude=geofence_data.latitude,
            longitude=geofence_data.longitude,
            radius=geofence_data.radius,
            is_active=geofence_data.is_active
        )
        
        self.db.add(geofence)
        self.db.commit()
        self.db.refresh(geofence)
        return geofence
    
    def get_geofence(self, geofence_id: int) -> Optional[Geofence]:
        """Get geofence by ID"""
        return self.db.query(Geofence).filter(Geofence.geofence_id == geofence_id).first()
    
    def get_all_geofences(self) -> List[Geofence]:
        """Get all active geofences"""
        return self.db.query(Geofence).filter(Geofence.is_active == True).all()
    
    def update_geofence(self, geofence_id: int, geofence_update: GeofenceUpdate) -> Geofence:
        """Update geofence details"""
        geofence = self.get_geofence(geofence_id)
        if not geofence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Geofence not found"
            )
        
        update_data = geofence_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(geofence, field, value)
        
        geofence.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(geofence)
        return geofence
    
    def delete_geofence(self, geofence_id: int) -> bool:
        """Delete a geofence"""
        geofence = self.get_geofence(geofence_id)
        if not geofence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Geofence not found"
            )
        
        self.db.delete(geofence)
        self.db.commit()
        return True
    
    def _check_geofence_events(self, location: Location):
        """Check if location triggers any geofence events"""
        geofences = self.get_all_geofences()
        
        for geofence in geofences:
            distance = self._calculate_distance(
                location.latitude, location.longitude,
                geofence.latitude, geofence.longitude
            ) * 1000  # Convert to meters
            
            # Check if truck is within geofence radius
            if distance <= geofence.radius:
                # Check if this is a new entry
                existing_event = self.db.query(GeofenceEvent).filter(
                    and_(
                        GeofenceEvent.geofence_id == geofence.geofence_id,
                        GeofenceEvent.truck_id == location.truck_id,
                        GeofenceEvent.event_type == "enter"
                    )
                ).order_by(desc(GeofenceEvent.timestamp)).first()
                
                if not existing_event or (datetime.utcnow() - existing_event.timestamp).total_seconds() > 300:  # 5 minutes
                    # Create enter event
                    event = GeofenceEvent(
                        geofence_id=geofence.geofence_id,
                        truck_id=location.truck_id,
                        event_type="enter",
                        location_id=location.location_id
                    )
                    self.db.add(event)
            
            else:
                # Check if truck was previously inside
                last_event = self.db.query(GeofenceEvent).filter(
                    and_(
                        GeofenceEvent.geofence_id == geofence.geofence_id,
                        GeofenceEvent.truck_id == location.truck_id
                    )
                ).order_by(desc(GeofenceEvent.timestamp)).first()
                
                if last_event and last_event.event_type == "enter":
                    # Create exit event
                    event = GeofenceEvent(
                        geofence_id=geofence.geofence_id,
                        truck_id=location.truck_id,
                        event_type="exit",
                        location_id=location.location_id
                    )
                    self.db.add(event)
        
        self.db.commit()
    
    # Fleet tracking
    def get_fleet_status(self) -> List[Dict[str, Any]]:
        """Get status of all trucks in fleet"""
        trucks = self.db.query(Vehicle).all()
        fleet_status = []
        
        for truck in trucks:
            current_location = self.get_truck_current_location(truck.id)
            is_online = False
            last_seen = None
            
            if current_location:
                # Check if truck is online (location within last 5 minutes)
                time_diff = datetime.utcnow() - current_location.timestamp
                is_online = time_diff.total_seconds() < 300  # 5 minutes
                last_seen = current_location.timestamp
            
            # Get current trip if any
            current_trip = self.db.query(Trip).filter(
                and_(
                    Trip.vehicle_id == truck.id,
                    Trip.status.in_(["in_progress", "started"])
                )
            ).first()
            
            fleet_status.append({
                "truck_id": truck.id,
                "truck_name": truck.name,
                "status": self._get_truck_status(truck, is_online, current_trip),
                "current_location": current_location,
                "last_seen": last_seen,
                "current_trip": current_trip,
                "is_online": is_online
            })
        
        return fleet_status
    
    def _get_truck_status(self, truck: Vehicle, is_online: bool, current_trip: Optional[Trip]) -> str:
        """Determine truck status"""
        if not is_online:
            return "offline"
        elif current_trip:
            return "in_trip"
        elif truck.status == "maintenance":
            return "maintenance"
        else:
            return "idle"
    
    # Dashboard analytics
    def get_tracking_dashboard_data(self) -> Dict[str, Any]:
        """Get tracking dashboard data"""
        total_trucks = self.db.query(Vehicle).count()
        
        # Count online trucks
        online_trucks = 0
        trucks = self.db.query(Vehicle).all()
        for truck in trucks:
            current_location = self.get_truck_current_location(truck.id)
            if current_location:
                time_diff = datetime.utcnow() - current_location.timestamp
                if time_diff.total_seconds() < 300:  # 5 minutes
                    online_trucks += 1
        
        # Count active trips
        active_trips = self.db.query(Trip).filter(
            Trip.status.in_(["in_progress", "started"])
        ).count()
        
        # Calculate total distance today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_locations = self.db.query(Location).filter(
            Location.timestamp >= today_start
        ).all()
        
        total_distance_today = 0.0
        if len(today_locations) > 1:
            for i in range(len(today_locations) - 1):
                loc1 = today_locations[i]
                loc2 = today_locations[i + 1]
                if loc1.truck_id == loc2.truck_id:
                    distance = self._calculate_distance(
                        loc1.latitude, loc1.longitude,
                        loc2.latitude, loc2.longitude
                    )
                    total_distance_today += distance
        
        # Calculate average speed
        speeds = [loc.speed for loc in today_locations if loc.speed is not None]
        average_speed = sum(speeds) / len(speeds) if speeds else 0.0
        
        # Get recent locations
        recent_locations = self.db.query(Location).order_by(
            desc(Location.timestamp)
        ).limit(10).all()
        
        # Get recent geofence events
        geofence_alerts = self.db.query(GeofenceEvent).order_by(
            desc(GeofenceEvent.timestamp)
        ).limit(5).all()
        
        return {
            "total_trucks": total_trucks,
            "online_trucks": online_trucks,
            "active_trips": active_trips,
            "total_distance_today": total_distance_today,
            "average_speed": average_speed,
            "recent_locations": recent_locations,
            "geofence_alerts": geofence_alerts
        }
    
    # Search and filtering
    def search_locations(self, truck_id: Optional[int] = None, 
                        start_time: Optional[datetime] = None,
                        end_time: Optional[datetime] = None,
                        location_type: Optional[LocationType] = None,
                        skip: int = 0, limit: int = 100) -> List[Location]:
        """Search locations with filters"""
        query = self.db.query(Location)
        
        if truck_id:
            query = query.filter(Location.truck_id == truck_id)
        
        if start_time:
            query = query.filter(Location.timestamp >= start_time)
        
        if end_time:
            query = query.filter(Location.timestamp <= end_time)
        
        if location_type:
            query = query.filter(Location.location_type == location_type)
        
        return query.order_by(desc(Location.timestamp)).offset(skip).limit(limit).all()
    
    def get_truck_tracking_history(self, truck_id: int, 
                                 start_time: Optional[datetime] = None,
                                 end_time: Optional[datetime] = None) -> Dict[str, Any]:
        """Get complete tracking history for a truck"""
        truck = self.db.query(Vehicle).filter(Vehicle.id == truck_id).first()
        if not truck:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Truck not found"
            )
        
        query = self.db.query(Location).filter(Location.truck_id == truck_id)
        
        if start_time:
            query = query.filter(Location.timestamp >= start_time)
        
        if end_time:
            query = query.filter(Location.timestamp <= end_time)
        
        locations = query.order_by(Location.timestamp).all()
        
        return {
            "truck_id": truck_id,
            "truck_name": truck.name,
            "locations": locations,
            "total_locations": len(locations),
            "tracking_period": {
                "start": locations[0].timestamp if locations else None,
                "end": locations[-1].timestamp if locations else None
            }
        }
