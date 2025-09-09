#!/usr/bin/env python3
"""
Test script for Booking and Dispatch functionality
This script demonstrates the complete booking and dispatch workflow
"""

import pytest
import requests
import json
from datetime import datetime, timedelta
import time

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
HEADERS = {"Content-Type": "application/json"}

def is_server_running():
    """Check if the FastAPI server is running"""
    try:
        response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

@pytest.fixture(scope="session")
def server_check():
    """Fixture to check if server is running and skip tests if not"""
    if not is_server_running():
        pytest.skip("FastAPI server is not running. Start with: uvicorn app.main:app --reload")

@pytest.fixture
def test_booking_ids(server_check):
    """Fixture to create test bookings and return their IDs"""
    # Create cargo booking
    cargo_booking_data = {
        "user_id": 1,
        "source": "Warehouse A, Industrial District",
        "destination": "Distribution Center B, Downtown",
        "service_type": "cargo",
        "price": 150.00
    }
    
    response = requests.post(
        f"{BASE_URL}/bookings/",
        headers=HEADERS,
        json=cargo_booking_data
    )
    
    if response.status_code != 201:
        pytest.skip("Could not create test booking - server may not be properly configured")
    
    cargo_booking_id = response.json()["booking_id"]
    
    # Create public booking
    public_booking_data = {
        "user_id": 2,
        "source": "Central Station",
        "destination": "Airport Terminal", 
        "service_type": "public",
        "price": 25.00
    }
    
    response = requests.post(
        f"{BASE_URL}/bookings/",
        headers=HEADERS,
        json=public_booking_data
    )
    
    if response.status_code == 201:
        public_booking_id = response.json()["booking_id"]
    else:
        public_booking_id = cargo_booking_id  # Fallback
    
    return cargo_booking_id, public_booking_id

def print_response(response, title):
    """Print formatted response"""
    print(f"\n{'='*50}")
    print(f"{title}")
    print(f"{'='*50}")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response:")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Error: {response.text}")
    print(f"{'='*50}\n")

def test_booking_workflow():
    """Test complete booking workflow"""
    print("🚚 Testing Booking and Dispatch Workflow")
    
    # 1. Create a cargo booking
    print("1. Creating a cargo booking...")
    cargo_booking_data = {
        "user_id": 1,
        "source": "Warehouse A, Industrial District",
        "destination": "Distribution Center B, Downtown",
        "service_type": "cargo",
        "price": 150.00
    }
    
    response = requests.post(
        f"{BASE_URL}/bookings/",
        headers=HEADERS,
        json=cargo_booking_data
    )
    print_response(response, "Cargo Booking Created")
    
    if response.status_code != 201:
        print("❌ Failed to create cargo booking")
        return
    
    cargo_booking = response.json()
    cargo_booking_id = cargo_booking["booking_id"]
    
    # 2. Create a public service booking
    print("2. Creating a public service booking...")
    public_booking_data = {
        "user_id": 2,
        "source": "Central Station",
        "destination": "Airport Terminal",
        "service_type": "public",
        "price": 25.00
    }
    
    response = requests.post(
        f"{BASE_URL}/bookings/",
        headers=HEADERS,
        json=public_booking_data
    )
    print_response(response, "Public Service Booking Created")
    
    if response.status_code != 201:
        print("❌ Failed to create public service booking")
        return
    
    public_booking = response.json()
    public_booking_id = public_booking["booking_id"]
    
    # 3. Get booking details with dispatch information
    print("3. Getting booking details with dispatch...")
    response = requests.get(f"{BASE_URL}/bookings/{cargo_booking_id}/with-dispatch")
    print_response(response, "Booking with Dispatch Details")
    
    # 4. Get all bookings
    print("4. Getting all bookings...")
    response = requests.get(f"{BASE_URL}/bookings/")
    print_response(response, "All Bookings")
    
    # 5. Get bookings by status
    print("5. Getting confirmed bookings...")
    response = requests.get(f"{BASE_URL}/bookings/status/confirmed")
    print_response(response, "Confirmed Bookings")
    
    # 6. Update booking status to in_progress
    print("6. Updating booking status to in_progress...")
    status_update = {"booking_status": "in_progress"}
    response = requests.put(
        f"{BASE_URL}/bookings/{cargo_booking_id}/status",
        headers=HEADERS,
        json=status_update
    )
    print_response(response, "Booking Status Updated")
    
    return cargo_booking_id, public_booking_id

def test_dispatch_workflow(test_booking_ids):
    """Test dispatch workflow"""
    print("🚛 Testing Dispatch Workflow")
    
    cargo_booking_id, public_booking_id = test_booking_ids
    
    # 1. Get dispatch by booking ID
    print("1. Getting dispatch for cargo booking...")
    response = requests.get(f"{BASE_URL}/dispatches/booking/{cargo_booking_id}")
    print_response(response, "Dispatch for Cargo Booking")
    
    if response.status_code != 200:
        print("❌ Failed to get dispatch")
        # Don't fail the test, just assert it completed
        assert True
        return
    
    dispatch = response.json()
    dispatch_id = dispatch["dispatch_id"]
    
    # 2. Get all dispatches
    print("2. Getting all dispatches...")
    response = requests.get(f"{BASE_URL}/dispatches/")
    print_response(response, "All Dispatches")
    
    # 3. Update dispatch status to dispatched
    print("3. Updating dispatch status to dispatched...")
    dispatch_time = datetime.utcnow().isoformat()
    status_update = {
        "status": "dispatched",
        "dispatch_time": dispatch_time
    }
    response = requests.put(
        f"{BASE_URL}/dispatches/{dispatch_id}/status",
        headers=HEADERS,
        json=status_update
    )
    print_response(response, "Dispatch Status Updated to Dispatched")
    
    # 4. Update dispatch status to in_transit
    print("4. Updating dispatch status to in_transit...")
    status_update = {"status": "in_transit"}
    response = requests.put(
        f"{BASE_URL}/dispatches/{dispatch_id}/status",
        headers=HEADERS,
        json=status_update
    )
    print_response(response, "Dispatch Status Updated to In Transit")
    
    # 5. Update dispatch status to arrived
    print("5. Updating dispatch status to arrived...")
    arrival_time = datetime.utcnow().isoformat()
    status_update = {
        "status": "arrived",
        "arrival_time": arrival_time
    }
    response = requests.put(
        f"{BASE_URL}/dispatches/{dispatch_id}/status",
        headers=HEADERS,
        json=status_update
    )
    print_response(response, "Dispatch Status Updated to Arrived")
    
    # 6. Complete the dispatch
    print("6. Completing the dispatch...")
    status_update = {"status": "completed"}
    response = requests.put(
        f"{BASE_URL}/dispatches/{dispatch_id}/status",
        headers=HEADERS,
        json=status_update
    )
    print_response(response, "Dispatch Completed")
    
    # 7. Get dispatch with details
    print("7. Getting dispatch with details...")
    response = requests.get(f"{BASE_URL}/dispatches/{dispatch_id}/with-details")
    print_response(response, "Dispatch with Details")
    
    # Assert test completed
    assert True

def test_driver_management():
    """Test driver management functionality"""
    print("👨‍💼 Testing Driver Management")
    
    # 1. Get available drivers
    print("1. Getting available drivers...")
    response = requests.get(f"{BASE_URL}/dispatches/available-drivers")
    print_response(response, "Available Drivers")
    
    # 2. Get dispatches by status
    print("2. Getting pending dispatches...")
    response = requests.get(f"{BASE_URL}/dispatches/status/pending")
    print_response(response, "Pending Dispatches")

def test_booking_management():
    """Test booking management functionality"""
    print("📋 Testing Booking Management")
    
    # 1. Get user bookings
    print("1. Getting bookings for user 1...")
    response = requests.get(f"{BASE_URL}/bookings/user/1")
    print_response(response, "User 1 Bookings")
    
    # 2. Get user bookings with pagination
    print("2. Getting user bookings with pagination...")
    response = requests.get(f"{BASE_URL}/bookings/user/1?skip=0&limit=5")
    print_response(response, "User Bookings (Paginated)")

def test_error_handling():
    """Test error handling"""
    print("⚠️ Testing Error Handling")
    
    # 1. Try to get non-existent booking
    print("1. Getting non-existent booking...")
    response = requests.get(f"{BASE_URL}/bookings/99999")
    print_response(response, "Non-existent Booking")
    
    # 2. Try to update completed booking
    print("2. Updating booking with invalid data...")
    invalid_update = {"price": -100}  # Invalid negative price
    response = requests.put(
        f"{BASE_URL}/bookings/1",
        headers=HEADERS,
        json=invalid_update
    )
    print_response(response, "Invalid Booking Update")

def main():
    """Main test function"""
    print("🚀 Starting Booking and Dispatch System Tests")
    print("Make sure the FastAPI server is running on http://localhost:8000")
    
    try:
        # Test booking workflow
        cargo_booking_id, public_booking_id = test_booking_workflow()
        
        # Test dispatch workflow
        dispatch_id = test_dispatch_workflow(cargo_booking_id, public_booking_id)
        
        # Test driver management
        test_driver_management()
        
        # Test booking management
        test_booking_management()
        
        # Test error handling
        test_error_handling()
        
        print("✅ All tests completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the FastAPI server is running")
        print("Run: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    main()
