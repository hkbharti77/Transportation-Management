#!/usr/bin/env python3
"""
Test script to verify truck creation works
"""

import requests
import json

def test_truck_creation():
    base_url = "http://localhost:8000/api/v1"
    
    # Test data with fleet_id = 0 (should be converted to None)
    truck_data = {
        "fleet_id": 0,
        "truck_number": "TRK001",
        "number_plate": "ABC123",
        "truck_type": "SMALL_TRUCK",
        "capacity_kg": 5000.0,
        "length_m": 6.0,
        "width_m": 2.5,
        "height_m": 2.8,
        "fuel_type": "diesel",
        "fuel_capacity_l": 200.0,
        "year_of_manufacture": 2020,
        "manufacturer": "Freightliner",
        "model": "Cascadia"
    }
    
    try:
        # First, try to login as admin to get a token
        login_data = {
            "username": "hkbharti777@outlook.com",
            "password": "Pass@123"
        }
        
        login_response = requests.post(f"{base_url}/auth/login", data=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            print(login_response.text)
            return
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to create a truck
        response = requests.post(
            f"{base_url}/fleet/trucks",
            json=truck_data,
            headers=headers
        )
        
        if response.status_code == 200:
            truck = response.json()
            print(f"✅ Truck created successfully!")
            print(f"   ID: {truck['id']}")
            print(f"   Fleet ID: {truck['fleet_id']}")
            print(f"   Truck Number: {truck['truck_number']}")
        else:
            print(f"❌ Failed to create truck: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🧪 Testing truck creation...")
    test_truck_creation()
