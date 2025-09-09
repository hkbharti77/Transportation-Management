#!/usr/bin/env python3
"""
Simple script to check database content without complex relationships
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_database_content():
    """Check what data exists in key tables"""
    database_url = os.getenv("DATABASE_URL", "postgresql://postgres:root@localhost:5432/transportation_db")
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as connection:
            print("🔍 Checking database content...")
            print("=" * 50)
            
            # Check routes
            print("📍 ROUTES:")
            result = connection.execute(text("SELECT id, route_number, start_point, end_point, base_fare, is_active FROM routes"))
            routes = result.fetchall()
            if routes:
                for route in routes:
                    print(f"  ID: {route[0]}, Number: {route[1]}, {route[2]} → {route[3]}, Fare: ${route[4]}, Active: {route[5]}")
            else:
                print("  ❌ No routes found")
            
            print("\\n🚗 VEHICLES:")
            result = connection.execute(text("SELECT id, type, license_plate, model, capacity, status FROM vehicles"))
            vehicles = result.fetchall()
            if vehicles:
                for vehicle in vehicles:
                    print(f"  ID: {vehicle[0]}, Type: {vehicle[1]}, Plate: {vehicle[2]}, Model: {vehicle[3]}, Capacity: {vehicle[4]}, Status: {vehicle[5]}")
            else:
                print("  ❌ No vehicles found")
            
            print("\\n👨‍✈️ DRIVERS:")
            result = connection.execute(text("SELECT id, user_id, license_number, is_available FROM drivers"))
            drivers = result.fetchall()
            if drivers:
                for driver in drivers:
                    print(f"  ID: {driver[0]}, User ID: {driver[1]}, License: {driver[2]}, Available: {driver[3]}")
            else:
                print("  ❌ No drivers found")
                
            print("\\n🎫 TRIPS:")
            result = connection.execute(text("SELECT id, route_id, vehicle_id, driver_id, status, fare FROM trips LIMIT 5"))
            trips = result.fetchall()
            if trips:
                for trip in trips:
                    print(f"  ID: {trip[0]}, Route: {trip[1]}, Vehicle: {trip[2]}, Driver: {trip[3]}, Status: {trip[4]}, Fare: ${trip[5]}")
            else:
                print("  ❌ No trips found")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_database_content()