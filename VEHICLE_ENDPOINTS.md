# 🚗 Vehicle Management API Documentation

## Overview

The Vehicle Management API provides comprehensive CRUD operations for managing vehicles in the Transportation Management System. This includes creating, reading, updating, and deleting vehicles, as well as managing driver assignments and vehicle status.

## 🔗 Base URL Structure

All vehicle endpoints are prefixed with: `/api/v1/vehicles`

## 🔐 Authentication

All API requests require authentication headers:
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

## 📋 Vehicle Types

Available vehicle types:
- `TRUCK` - Cargo trucks
- `BUS` - Passenger buses  
- `VAN` - Delivery vans
- `CAR` - Regular cars
- `MOTORCYCLE` - Motorcycles

## 📊 Vehicle Status

Available status values:
- `ACTIVE` - Vehicle is operational and available
- `INACTIVE` - Vehicle is not currently in use
- `MAINTENANCE` - Vehicle is under maintenance
- `RETIRED` - Vehicle is permanently out of service

## 🚀 API Endpoints

### 1. Create Vehicle

Create a new vehicle in the system.

```http
POST /api/v1/vehicles/
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "TRUCK",
  "capacity": 5000.0,
  "license_plate": "TRK-001",
  "model": "Freightliner Cascadia",
  "year": 2022,
  "status": "ACTIVE",
  "assigned_driver_id": null
}
```

**Response:**
```json
{
  "id": 1,
  "type": "TRUCK", 
  "capacity": 5000.0,
  "license_plate": "TRK-001",
  "model": "Freightliner Cascadia",
  "year": 2022,
  "status": "ACTIVE",
  "assigned_driver_id": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": null
}
```

### 2. Get All Vehicles

Retrieve a list of vehicles with filtering and pagination.

```http
GET /api/v1/vehicles/?skip=0&limit=10&vehicle_type=TRUCK&status=ACTIVE&assigned_driver_id=0
Authorization: Bearer {token}
```

**Query Parameters:**
- `skip` (int, default=0) - Number of records to skip
- `limit` (int, default=100, max=100) - Number of records to return
- `vehicle_type` (VehicleType, optional) - Filter by vehicle type
- `status` (VehicleStatus, optional) - Filter by status
- `assigned_driver_id` (int, optional) - Filter by driver assignment (0 = unassigned)

**Response:**
```json
[
  {
    "id": 1,
    "type": "TRUCK",
    "capacity": 5000.0,
    "license_plate": "TRK-001",
    "model": "Freightliner Cascadia",
    "year": 2022,
    "status": "ACTIVE",
    "assigned_driver_id": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": null
  }
]
```

### 3. Get Vehicle by ID

Retrieve a specific vehicle by its ID.

```http
GET /api/v1/vehicles/{vehicle_id}
Authorization: Bearer {token}
```

### 4. Update Vehicle

Update an existing vehicle's information.

```http
PUT /api/v1/vehicles/{vehicle_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "model": "Updated Model Name",
  "year": 2023,
  "status": "MAINTENANCE"
}
```

### 5. Delete Vehicle (Soft Delete)

Retire a vehicle from service (sets status to RETIRED).

```http
DELETE /api/v1/vehicles/{vehicle_id}
Authorization: Bearer {token}
```

**Note:** Vehicles with active orders or trips cannot be deleted.

### 6. Update Vehicle Status

Change a vehicle's operational status.

```http
PUT /api/v1/vehicles/{vehicle_id}/status
Authorization: Bearer {token}
Content-Type: application/json

"MAINTENANCE"
```

**Response:**
```json
{
  "message": "Vehicle TRK-001 status updated to MAINTENANCE",
  "vehicle_id": 1,
  "license_plate": "TRK-001", 
  "old_status": "ACTIVE",
  "new_status": "MAINTENANCE"
}
```

### 7. Assign Driver to Vehicle

Assign a driver to a specific vehicle.

```http
PUT /api/v1/vehicles/{vehicle_id}/assign-driver
Authorization: Bearer {token}
Content-Type: application/json

3
```

**Response:**
```json
{
  "message": "Driver John Doe assigned to vehicle TRK-001",
  "vehicle_id": 1,
  "driver_id": 3,
  "license_plate": "TRK-001"
}
```

### 8. Unassign Driver from Vehicle

Remove driver assignment from a vehicle.

```http
DELETE /api/v1/vehicles/{vehicle_id}/unassign-driver
Authorization: Bearer {token}
```

### 9. Get Vehicle Statistics

Get summary statistics about all vehicles.

```http
GET /api/v1/vehicles/stats/summary
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_vehicles": 10,
  "status_breakdown": {
    "active": 7,
    "inactive": 1,
    "maintenance": 2,
    "retired": 0
  },
  "assignment_breakdown": {
    "assigned": 5,
    "unassigned": 5  
  },
  "type_breakdown": {
    "truck": 4,
    "bus": 3,
    "van": 2,
    "car": 1,
    "motorcycle": 0
  }
}
```

## 🔐 Access Control

### Role-Based Permissions

| Role | Create | Read | Update | Delete | Assign Driver |
|------|--------|------|--------|--------|---------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Driver** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Dispatcher** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Public User** | ❌ | ❌ | ❌ | ❌ | ❌ |

## ⚠️ Business Rules

1. **License Plate Uniqueness**: Each vehicle must have a unique license plate
2. **Driver Availability**: Only available drivers can be assigned to vehicles
3. **Active Orders/Trips**: Vehicles with active orders or trips cannot be deleted
4. **Status Constraints**: Vehicles in MAINTENANCE or RETIRED status cannot be assigned to drivers
5. **Capacity Validation**: Vehicle capacity must be a positive number

## 🔗 Related Endpoints

- **Orders**: `/api/v1/orders/{order_id}/assign` - Assign vehicle to order
- **Fleet**: `/api/v1/fleet/trucks/` - Legacy truck management (specific to trucks only)
- **Services**: `/api/v1/services/` - Vehicle maintenance and service records
- **Tracking**: `/api/v1/tracking/` - Vehicle location and movement tracking

## 📊 Integration Examples

### Complete Vehicle Lifecycle

```bash
# 1. Create vehicle
curl -X POST "/api/v1/vehicles/" \
  -H "Authorization: Bearer {token}" \
  -d '{"type":"TRUCK","capacity":5000,"license_plate":"TRK-001"}'

# 2. Assign driver
curl -X PUT "/api/v1/vehicles/1/assign-driver" \
  -H "Authorization: Bearer {token}" \
  -d '3'

# 3. Update status to active
curl -X PUT "/api/v1/vehicles/1/status" \
  -H "Authorization: Bearer {token}" \
  -d '"ACTIVE"'

# 4. Assign to order  
curl -X PUT "/api/v1/orders/1/assign" \
  -H "Authorization: Bearer {token}" \
  -d '{"vehicle_id":1,"driver_id":3}'
```

## 🐛 Error Handling

Common error responses:

- `400 Bad Request` - Validation errors, duplicate license plate
- `404 Not Found` - Vehicle or driver not found
- `403 Forbidden` - Insufficient permissions
- `401 Unauthorized` - Invalid or missing authentication token

Example error response:
```json
{
  "detail": "Vehicle with license plate 'TRK-001' already exists"
}
```