#!/usr/bin/env python3
"""
Test script for fleet summary endpoint
"""
import requests
import json

def test_fleet_summary():
    """Test the fleet summary endpoint"""
    
    # Test URL
    url = "http://localhost:8000/api/v1/fleet/summary"
    
    # Test token (admin user)
    headers = {
        'accept': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzU2OTMwMDEwfQ.EgoJJJTv4QGSV4z-0vfNZCZjsg9-PcHJkX07BnpBFNI'
    }
    
    print("🚛 Testing Fleet Summary Endpoint")
    print("=" * 50)
    
    try:
        # Test the endpoint
        response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Fleet Summary Retrieved:")
            print(json.dumps(data, indent=2))
            
            # Display summary stats
            print("\n📊 Fleet Summary Stats:")
            print(f"  Total Trucks: {data.get('total_trucks', 0)}")
            print(f"  Available Trucks: {data.get('available_trucks', 0)}")
            print(f"  Busy Trucks: {data.get('busy_trucks', 0)}")
            print(f"  Maintenance Trucks: {data.get('maintenance_trucks', 0)}")
            print(f"  Total Drivers: {data.get('total_drivers', 0)}")
            print(f"  Available Drivers: {data.get('available_drivers', 0)}")
            print(f"  On Trip Drivers: {data.get('on_trip_drivers', 0)}")
            
        else:
            print("❌ ERROR:")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Server is not running")
        print("💡 Start the server with: python main.py")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

def test_health_check():
    """Test if server is running"""
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ Server is running")
            assert True  # Server is running
        else:
            print("❌ Server responded with error")
            assert False, "Server responded with error"
    except Exception as e:
        print("❌ Server is not running")
        assert False, f"Server is not running: {e}"

if __name__ == "__main__":
    print("🔍 Fleet Summary Endpoint Test")
    print("=" * 50)
    
    # Check if server is running first
    try:
        test_health_check()
        test_fleet_summary()
    except AssertionError:
        print("\n💡 To start the server:")
        print("   1. python main.py")
        print("   2. Then run this test again")
