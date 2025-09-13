#!/usr/bin/env python3
"""
Test script to verify the fix for getting all tickets
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
HEADERS = {"Content-Type": "application/json"}

def test_get_all_tickets():
    """Test getting all tickets"""
    print("Testing get all tickets...")
    
    # Get all tickets
    response = requests.get(f"{BASE_URL}/public-services/tickets/")
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        tickets = response.json()
        print(f"✅ Successfully retrieved {len(tickets)} tickets")
        if len(tickets) > 0:
            print("First ticket details:")
            print(json.dumps(tickets[0], indent=2))
        return True
    else:
        print("❌ Failed to get tickets")
        print(f"Error: {response.text}")
        return False

def test_get_tickets_with_filters():
    """Test getting tickets with filters"""
    print("\nTesting get tickets with filters...")
    
    # Get tickets for a specific service (if any exist)
    response = requests.get(f"{BASE_URL}/public-services/tickets/?service_id=1")
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        tickets = response.json()
        print(f"✅ Successfully retrieved {len(tickets)} tickets for service 1")
        return True
    else:
        print("❌ Failed to get tickets with filter")
        print(f"Error: {response.text}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Ticket Retrieval Fix")
    success1 = test_get_all_tickets()
    success2 = test_get_tickets_with_filters()
    
    if success1 and success2:
        print("\n✅ All ticket tests completed successfully!")
    else:
        print("\n❌ Some ticket tests failed!")