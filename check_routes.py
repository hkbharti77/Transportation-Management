#!/usr/bin/env python3
"""
Script to check available routes in the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.route import Route
from app.models.vehicle import Vehicle
from app.models.fleet import Driver

def check_routes():
    """Check what routes are available in the database"""
    db = SessionLocal()
    try:
        print("🗺️  Checking available routes...")
        print("=" * 50)
        
        routes = db.query(Route).all()
        
        if not routes:
            print("❌ No routes found in database!")
            return
            
        print(f"✅ Found {len(routes)} routes:")
        print("-" * 30)
        
        for route in routes:
            print(f"ID: {route.id}")
            print(f"Route Number: {route.route_number}")
            print(f"From: {route.start_point}")
            print(f"To: {route.end_point}")
            print(f"Fare: ${route.base_fare}")
            print(f"Active: {route.is_active}")
            print("-" * 30)
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

def check_vehicles():
    """Check what vehicles are available"""
    db = SessionLocal()
    try:
        print("\n🚗 Checking available vehicles...")
        print("=" * 50)
        
        vehicles = db.query(Vehicle).all()
        
        if not vehicles:
            print("❌ No vehicles found in database!")
            return
            
        print(f"✅ Found {len(vehicles)} vehicles:")
        print("-" * 30)
        
        for vehicle in vehicles:
            print(f"ID: {vehicle.id}")
            print(f"Type: {vehicle.type}")
            print(f"Plate: {vehicle.license_plate}")
            print(f"Model: {vehicle.model}")
            print(f"Capacity: {vehicle.capacity}")
            print(f"Status: {vehicle.status}")
            print("-" * 30)
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

def check_drivers():
    """Check what drivers are available"""
    db = SessionLocal()
    try:
        print("\n👨‍✈️ Checking available drivers...")
        print("=" * 50)
        
        drivers = db.query(Driver).all()
        
        if not drivers:
            print("❌ No drivers found in database!")
            return
            
        print(f"✅ Found {len(drivers)} drivers:")
        print("-" * 30)
        
        for driver in drivers:
            print(f"ID: {driver.id}")
            print(f"User ID: {driver.user_id}")
            print(f"License: {driver.license_number}")
            print(f"Available: {driver.is_available}")
            print("-" * 30)
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_routes()
    check_vehicles()
    check_drivers()