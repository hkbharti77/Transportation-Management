# Endpoint Usage Summary

This document provides a simplified overview of how API endpoints are used in the Transportation Management system.

## Key Endpoints and Their Usage

### 1. User Management
```
GET /api/v1/users/me → UserProfile, SignInForm
PUT /api/v1/users/me → ProfileUpdateForm (NEW)
GET /api/v1/users/drivers → DriversPage
GET /api/v1/users/customers → CustomersPage
GET /api/v1/users/transporters → TransportersPage
PUT /api/v1/users/{id}/role → User management pages
POST /api/v1/users/{id}/reset-password → User management pages
```

### 2. Route Management
```
GET /api/v1/routes/{id}/trips → RouteDetailPage (Trips tab)
GET /api/v1/routes/{id}/stats → RouteDetailPage (Stats tab)
GET /api/v1/routes/stats → RouteAnalyticsPage
```

### 3. Trip Management
```
POST /api/v1/trips/{id}/book → TripTable (Book button)
GET /api/v1/trips/{id}/bookings → TripTable (View Bookings)
GET /api/v1/trips/resources → TripCreationForm (NEW)
```

### 4. Order Management
```
GET /api/v1/orders/analytics → OrderAnalyticsPage
```

## Page-Specific Endpoint Usage

### RouteDetailPage.tsx
- `GET /api/v1/routes/{id}` - Get route details
- `GET /api/v1/routes/{id}/trips` - Get trips for this route
- `GET /api/v1/routes/{id}/stats` - Get statistics for this route

### TripTable.tsx
- `POST /api/v1/trips/{id}/book` - Book a seat on a trip
- `GET /api/v1/trips/{id}/bookings` - View bookings for a trip

### OrderAnalyticsPage.tsx
- `GET /api/v1/orders/analytics` - Get order analytics data

### DriversPage.tsx
- `GET /api/v1/users/drivers` - Get all drivers

### CustomersPage.tsx
- `GET /api/v1/users/customers` - Get all customers

### TransportersPage.tsx
- `GET /api/v1/users/transporters` - Get all transporters

## New Endpoints (Recently Added)

### PUT /api/v1/users/me
- **Service Method**: `userService.updateCurrentUser()`
- **Usage Example**: Updating user profile information
- **Components**: ProfileUpdateForm (example)

### GET /api/v1/trips/resources
- **Service Method**: `tripService.getTripResources()`
- **Usage Example**: Getting vehicles, drivers, and routes for trip creation
- **Components**: TripCreationForm (example)

## Authentication Flow
1. `POST /api/v1/auth/login` - User login
2. `GET /api/v1/auth/me` - Validate token and get user info
3. `GET /api/v1/users/me` - Get detailed user profile

## User Management Flow
1. `GET /api/v1/users/` - List all users
2. `POST /api/v1/users/` - Create new user
3. `GET /api/v1/users/{id}` - View user details
4. `PUT /api/v1/users/{id}` - Edit user
5. `DELETE /api/v1/users/{id}` - Delete user
6. `PUT /api/v1/users/{id}/role` - Change user role
7. `PUT /api/v1/users/{id}/activate` - Activate/deactivate user
8. `POST /api/v1/users/{id}/reset-password` - Reset user password

This summary shows how the API endpoints connect the frontend pages with the backend services, providing a complete overview of the data flow in the application.