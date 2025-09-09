#!/usr/bin/env python3
"""
Test script for Routes API
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)

def test_routes_api():
    """Test the routes API endpoints"""
    print("🧪 Testing Routes API...")
    print("=" * 50)
    
    # Test get routes (should work without auth)
    print("1. Testing GET /api/v1/routes")
    response = client.get("/api/v1/routes")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        routes = response.json()
        print(f"   Found {len(routes)} routes")
        if routes:
            print(f"   First route: {routes[0]['route_number']} - {routes[0]['start_point']} → {routes[0]['end_point']}")
    else:
        print(f"   Error: {response.text}")
    
    # Test get specific route
    if response.status_code == 200 and routes:
        route_id = routes[0]['id']
        print(f"\\n2. Testing GET /api/v1/routes/{route_id}")
        response = client.get(f"/api/v1/routes/{route_id}")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            route = response.json()
            print(f"   Route: {route['route_number']} - {route['start_point']} → {route['end_point']}")
            print(f"   Stops: {route['stops']}")
            print(f"   Fare: ${route['base_fare']}, Time: {route['estimated_time']} min")
        else:
            print(f"   Error: {response.text}")
    
    # Test search functionality
    print(f"\\n3. Testing GET /api/v1/routes?search=Downtown")
    response = client.get("/api/v1/routes?search=Downtown")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        routes = response.json()
        print(f"   Found {len(routes)} routes matching 'Downtown'")
    
    # Test route statistics (if routes exist)
    if response.status_code == 200 and routes:
        route_id = routes[0]['id']
        print(f"\\n4. Testing GET /api/v1/routes/{route_id}/stats")
        response = client.get(f"/api/v1/routes/{route_id}/stats")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            stats = response.json()
            print(f"   Stats: {stats['total_trips']} total trips, {stats['active_trips']} active")
        else:
            print(f"   Error: {response.text}")
    
    print("\\n✅ Routes API test completed!")

if __name__ == "__main__":
    test_routes_api()