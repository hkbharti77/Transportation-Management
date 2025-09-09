# Routes Management API Documentation

## Overview
The Routes Management API provides comprehensive CRUD operations for managing transportation routes. This API is essential for the Transportation Management System as it allows administrators to create, read, update, and delete routes that are used by the trips system.

## Base URL
```
/api/v1/routes
```

## Authentication
- **Admin Role Required**: POST, PUT, DELETE operations
- **No Authentication**: GET operations (public access)

## Endpoints

### 1. Create Route
**POST** `/api/v1/routes/`

Creates a new route in the system.

**Authentication**: Admin only  
**Request Body**:
```json
{
  "route_number": "R006",
  "start_point": "Central Station",
  "end_point": "Beach Resort",
  "stops": ["Central Station", "City Mall", "Park Avenue", "Beach Resort"],
  "estimated_time": 60,
  "distance": 35.5,
  "base_fare": 18.0,
  "description": "Scenic route to beach resort",
  "is_active": true
}
```

**Response** (201 Created):
```json
{
  "id": 6,
  "route_number": "R006",
  "start_point": "Central Station",
  "end_point": "Beach Resort",
  "stops": ["Central Station", "City Mall", "Park Avenue", "Beach Resort"],
  "estimated_time": 60,
  "distance": 35.5,
  "base_fare": 18.0,
  "description": "Scenic route to beach resort",
  "is_active": true,
  "created_at": "2025-09-05T16:30:00Z",
  "updated_at": null
}
```

### 2. List Routes
**GET** `/api/v1/routes/`

Retrieve routes with pagination and filtering.

**Query Parameters**:
- `skip` (int, default: 0): Number of records to skip
- `limit` (int, default: 100): Maximum records to return
- `is_active` (bool, optional): Filter by active status
- `search` (string, optional): Search in route number, start point, or end point

**Examples**:
```
GET /api/v1/routes/
GET /api/v1/routes/?skip=0&limit=10
GET /api/v1/routes/?is_active=true
GET /api/v1/routes/?search=Downtown
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "route_number": "R001",
    "start_point": "Downtown Station",
    "end_point": "Airport Terminal",
    "stops": ["Downtown Station", "Central Mall", "University", "Airport Terminal"],
    "estimated_time": 45,
    "distance": 25.5,
    "base_fare": 15.0,
    "description": "Route from Downtown Station to Airport Terminal",
    "is_active": true,
    "created_at": "2025-09-05T12:00:00Z",
    "updated_at": null
  }
]
```

### 3. Get Route by ID
**GET** `/api/v1/routes/{route_id}`

Retrieve a specific route by its ID.

**Response** (200 OK):
```json
{
  "id": 1,
  "route_number": "R001",
  "start_point": "Downtown Station",
  "end_point": "Airport Terminal",
  "stops": ["Downtown Station", "Central Mall", "University", "Airport Terminal"],
  "estimated_time": 45,
  "distance": 25.5,
  "base_fare": 15.0,
  "description": "Route from Downtown Station to Airport Terminal",
  "is_active": true,
  "created_at": "2025-09-05T12:00:00Z",
  "updated_at": null
}
```

### 4. Update Route
**PUT** `/api/v1/routes/{route_id}`

Update an existing route.

**Authentication**: Admin only  
**Request Body** (all fields optional):
```json
{
  "route_number": "R001-UPDATED",
  "start_point": "New Downtown Station",
  "base_fare": 16.0,
  "description": "Updated route description"
}
```

**Response** (200 OK): Updated route object

### 5. Delete Route (Soft Delete)
**DELETE** `/api/v1/routes/{route_id}`

Deactivate a route (soft delete). Routes with active trips cannot be deleted.

**Authentication**: Admin only

**Response** (200 OK):
```json
{
  "message": "Route R001 has been deactivated"
}
```

### 6. Get Route Trips
**GET** `/api/v1/routes/{route_id}/trips`

Get all trips for a specific route.

**Query Parameters**:
- `skip` (int, default: 0): Pagination offset
- `limit` (int, default: 100): Maximum records

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "departure_time": "2025-09-06T08:00:00Z",
    "arrival_time": "2025-09-06T08:45:00Z",
    "status": "SCHEDULED",
    "fare": 15.0,
    "available_seats": 45,
    "total_seats": 50
  }
]
```

### 7. Get Route Statistics
**GET** `/api/v1/routes/{route_id}/stats`

Get statistics and analytics for a specific route.

**Response** (200 OK):
```json
{
  "route_id": 1,
  "route_number": "R001",
  "total_trips": 10,
  "active_trips": 3,
  "completed_trips": 7,
  "completion_rate": 70.0,
  "base_fare": 15.0,
  "estimated_time": 45,
  "distance": 25.5
}
```

## Validation Rules

### Route Number
- Required, unique across all routes
- Maximum 20 characters
- Automatically converted to uppercase
- Cannot be empty

### Start/End Points
- Required, cannot be empty
- Maximum 255 characters each
- Whitespace trimmed

### Stops
- Must have at least 2 stops
- Maximum 20 stops per route
- Duplicates and empty stops removed automatically
- Each stop trimmed of whitespace

### Time & Distance
- `estimated_time`: 1-1440 minutes (1 minute to 24 hours)
- `distance`: Must be positive, maximum 10,000 km

### Fare
- Must be non-negative
- Maximum $10,000
- Automatically rounded to 2 decimal places

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Route number R001 already exists"
}
```

### 404 Not Found
```json
{
  "detail": "Route not found"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "estimated_time"],
      "msg": "Estimated time must be positive",
      "type": "value_error"
    }
  ]
}
```

## Business Logic

### Route Creation
- Route numbers must be unique
- Validation ensures data integrity
- Audit logging for all create operations

### Route Updates
- Partial updates supported (PATCH-like behavior)
- Route number uniqueness validated on updates
- Cannot update if it would violate constraints

### Route Deletion
- Soft delete only (marks `is_active = false`)
- Cannot delete routes with active trips
- Must cancel or complete all trips first
- Hard delete not supported for data integrity

### Integration with Trips
- Routes are referenced by trips via `route_id`
- Route validation in trip creation prevents orphaned trips
- Route statistics calculated from associated trips

## Usage Examples

### Create a New Route
```bash
curl -X POST "http://localhost:8000/api/v1/routes/" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "route_number": "R007",
    "start_point": "Airport",
    "end_point": "Hotel District",
    "stops": ["Airport", "Business Center", "Hotel District"],
    "estimated_time": 30,
    "distance": 15.0,
    "base_fare": 12.0,
    "description": "Airport shuttle service"
  }'
```

### Search Routes
```bash
curl "http://localhost:8000/api/v1/routes/?search=Airport&is_active=true"
```

### Get Route Statistics
```bash
curl "http://localhost:8000/api/v1/routes/1/stats"
```

This Routes Management API provides complete control over route data, ensuring data integrity and supporting the entire trip management workflow.