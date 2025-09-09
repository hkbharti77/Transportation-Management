#!/usr/bin/env python3
"""
Create sample routes for testing
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_sample_routes():
    """Create sample routes for testing"""
    database_url = os.getenv("DATABASE_URL", "postgresql://postgres:root@localhost:5432/transportation_db")
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as connection:
            print("🗺️  Creating sample routes...")
            print("=" * 50)
            
            # Sample routes data
            routes_data = [
                ("R001", "Downtown Station", "Airport Terminal", '["Downtown Station", "Central Mall", "University", "Airport Terminal"]', 45, 25.5, 15.0, "Route from Downtown Station to Airport Terminal"),
                ("R002", "Suburban Center", "Industrial Park", '["Suburban Center", "Shopping District", "Industrial Park"]', 30, 18.0, 12.0, "Route from Suburban Center to Industrial Park"),
                ("R003", "City Center", "Shopping Mall", '["City Center", "Business District", "Shopping Mall"]', 25, 12.0, 10.0, "Route from City Center to Shopping Mall"),
                ("R004", "Residential Area", "Hospital", '["Residential Area", "School", "Hospital"]', 35, 20.0, 13.0, "Route from Residential Area to Hospital"),
                ("R005", "Train Station", "University", '["Train Station", "City Park", "Library", "University"]', 40, 22.0, 14.0, "Route from Train Station to University")
            ]
            
            for route_data in routes_data:
                route_num, start, end, stops, est_time, distance, fare, description = route_data
                
                # Check if route already exists
                result = connection.execute(text("SELECT id FROM routes WHERE route_number = :route_num"), {"route_num": route_num})
                if result.fetchone():
                    print(f"  ⚠️  Route {route_num} already exists, skipping...")
                    continue
                
                # Insert route
                connection.execute(text("""
                    INSERT INTO routes (route_number, start_point, end_point, stops, estimated_time, distance, base_fare, description, is_active, created_at)
                    VALUES (:route_num, :start, :end, :stops, :est_time, :distance, :fare, :description, true, NOW())
                """), {
                    "route_num": route_num,
                    "start": start,
                    "end": end,
                    "stops": stops,
                    "est_time": est_time,
                    "distance": distance,
                    "fare": fare,
                    "description": description
                })
                
                print(f"  ✅ Created route {route_num}: {start} → {end}")
            
            connection.commit()
            
            # Verify routes were created
            print("\\n🔍 Verifying created routes...")
            result = connection.execute(text("SELECT id, route_number, start_point, end_point, base_fare FROM routes"))
            routes = result.fetchall()
            print(f"✅ Total routes in database: {len(routes)}")
            for route in routes:
                print(f"  ID: {route[0]}, Number: {route[1]}, {route[2]} → {route[3]}, Fare: ${route[4]}")
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_sample_routes()