#!/usr/bin/env python3
"""
Test script to verify the fix for public service JSON field validation error
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
HEADERS = {"Content-Type": "application/json"}

def test_public_service_creation():
    """Test creating a public service and verify the response format"""
    print("Testing public service creation...")
    
    # Service data with stops and schedule
    service_data = {
        "route_name": "City Center Express",
        "stops": [
            {
                "name": "City Center Terminal",
                "location": "Downtown, Main Street",
                "sequence": 1,
                "estimated_time": "08:00 AM"
            },
            {
                "name": "Central Park Stop",
                "location": "Central Park Avenue",
                "sequence": 2,
                "estimated_time": "08:15 AM"
            },
            {
                "name": "North Station",
                "location": "North Road, Block 12",
                "sequence": 3,
                "estimated_time": "08:30 AM"
            },
            {
                "name": "International Airport",
                "location": "Airport Terminal 1",
                "sequence": 4,
                "estimated_time": "09:00 AM"
            }
        ],
        "schedule": [
            {
                "day": "Monday",
                "departure_time": "08:00 AM",
                "arrival_time": "09:00 AM"
            },
            {
                "day": "Tuesday",
                "departure_time": "08:00 AM",
                "arrival_time": "09:00 AM"
            },
            {
                "day": "Wednesday",
                "departure_time": "08:00 AM",
                "arrival_time": "09:00 AM"
            },
            {
                "day": "Thursday",
                "departure_time": "08:00 AM",
                "arrival_time": "09:00 AM"
            },
            {
                "day": "Friday",
                "departure_time": "08:00 AM",
                "arrival_time": "09:00 AM"
            }
        ],
        "capacity": 50,
        "fare": 25.00
    }
    
    # Create the service
    response = requests.post(
        f"{BASE_URL}/public-services/",
        headers=HEADERS,
        json=service_data
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 201:
        print("✅ Service created successfully!")
        service = response.json()
        print("Service details:")
        print(json.dumps(service, indent=2))
        
        # Verify that stops and schedule are properly formatted as lists
        if isinstance(service.get('stops'), list):
            print("✅ Stops field is correctly formatted as a list")
        else:
            print("❌ Stops field is not properly formatted")
            print(f"Stops type: {type(service.get('stops'))}")
            print(f"Stops value: {service.get('stops')}")
            
        if isinstance(service.get('schedule'), list):
            print("✅ Schedule field is correctly formatted as a list")
        else:
            print("❌ Schedule field is not properly formatted")
            print(f"Schedule type: {type(service.get('schedule'))}")
            print(f"Schedule value: {service.get('schedule')}")
            
        return service.get('service_id')
    else:
        print("❌ Failed to create service")
        print(f"Error: {response.text}")
        return None

def test_get_service(service_id):
    """Test getting a service by ID"""
    if not service_id:
        print("No service ID provided")
        return
        
    print(f"\nTesting retrieval of service {service_id}...")
    
    response = requests.get(f"{BASE_URL}/public-services/{service_id}")
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Service retrieved successfully!")
        service = response.json()
        print("Service details:")
        print(json.dumps(service, indent=2))
        
        # Verify that stops and schedule are properly formatted as lists
        if isinstance(service.get('stops'), list):
            print("✅ Stops field is correctly formatted as a list")
        else:
            print("❌ Stops field is not properly formatted")
            
        if isinstance(service.get('schedule'), list):
            print("✅ Schedule field is correctly formatted as a list")
        else:
            print("❌ Schedule field is not properly formatted")
    else:
        print("❌ Failed to retrieve service")
        print(f"Error: {response.text}")

if __name__ == "__main__":
    print("🚀 Testing Public Service JSON Field Fix")
    service_id = test_public_service_creation()
    test_get_service(service_id)
    print("\n✅ Test completed!")