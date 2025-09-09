# Transportation Management System - API Endpoints

This document provides a comprehensive list of all API endpoints available in the Transportation Management System, organized by functional categories. These endpoints can be used in frontend applications to interact with the backend services.

## Authentication Endpoints

### POST /api/v1/auth/login
- **Description**: User login
- **Authentication**: None
- **Request Body**: Form data with username (email) and password
- **Response**: JWT access token

### POST /api/v1/auth/register
- **Description**: Register new driver/customer
- **Authentication**: None
- **Request Body**: User registration details (name, email, phone, password, role)
- **Response**: Created user object

## User Management Endpoints

### GET /api/v1/users/
- **Description**: Get all users with pagination and filters
- **Authentication**: JWT Bearer Token
- **Query Parameters**: skip, limit, role, is_active
- **Response**: List of users

### GET /api/v1/users/me
- **Description**: Get current user profile
- **Authentication**: JWT Bearer Token
- **Response**: Current user object

### GET /api/v1/users/{user_id}
- **Description**: Get single user by ID
- **Authentication**: JWT Bearer Token
- **Response**: User object

### POST /api/v1/users/
- **Description**: Create new user
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: User creation details
- **Response**: Created user object

### PUT /api/v1/users/{user_id}
- **Description**: Update user
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: User update details
- **Response**: Updated user object

### PUT /api/v1/users/{user_id}/role
- **Description**: Change user role
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: New role
- **Response**: Success message

### PUT /api/v1/users/{user_id}/activate
- **Description**: Activate/Deactivate user
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### DELETE /api/v1/users/{user_id}
- **Description**: Delete user (soft delete)
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### POST /api/v1/users/{user_id}/reset-password
- **Description**: Reset user password
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: New password
- **Response**: Success message

### PUT /api/v1/users/me/password
- **Description**: Change current user password
- **Authentication**: JWT Bearer Token
- **Request Body**: Current and new password
- **Response**: Success message

### GET /api/v1/users/customers
- **Description**: Get all customers
- **Authentication**: JWT Bearer Token
- **Response**: List of customers

### GET /api/v1/users/transporters
- **Description**: Get all transporters
- **Authentication**: JWT Bearer Token
- **Response**: List of transporters

### GET /api/v1/users/drivers
- **Description**: Get all drivers
- **Authentication**: JWT Bearer Token
- **Response**: List of drivers

## Route Management Endpoints

### GET /api/v1/routes/
- **Description**: Get all routes with pagination and filters
- **Authentication**: JWT Bearer Token
- **Query Parameters**: skip, limit, is_active, search
- **Response**: List of routes

### GET /api/v1/routes/{route_id}
- **Description**: Get single route by ID
- **Authentication**: JWT Bearer Token
- **Response**: Route object

### POST /api/v1/routes/
- **Description**: Create new route
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Route creation details
- **Response**: Created route object

### PUT /api/v1/routes/{route_id}
- **Description**: Update route
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Route update details
- **Response**: Updated route object

### DELETE /api/v1/routes/{route_id}
- **Description**: Delete route (soft delete)
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### GET /api/v1/routes/stats
- **Description**: Get route statistics
- **Authentication**: JWT Bearer Token
- **Response**: Route statistics

### GET /api/v1/routes/{route_id}/stats
- **Description**: Get statistics for a specific route
- **Authentication**: JWT Bearer Token
- **Response**: Route statistics

### GET /api/v1/routes/{route_id}/trips
- **Description**: Get trips for a specific route
- **Authentication**: JWT Bearer Token
- **Response**: List of trips

## Vehicle Management Endpoints

### GET /api/v1/vehicles/
- **Description**: Get all vehicles with pagination and filters
- **Authentication**: JWT Bearer Token
- **Query Parameters**: skip, limit, vehicle_type, status, assigned_driver_id
- **Response**: List of vehicles

### GET /api/v1/vehicles/{vehicle_id}
- **Description**: Get single vehicle by ID
- **Authentication**: JWT Bearer Token
- **Response**: Vehicle object

### POST /api/v1/vehicles/
- **Description**: Create new vehicle
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Vehicle creation details
- **Response**: Created vehicle object

### PUT /api/v1/vehicles/{vehicle_id}
- **Description**: Update vehicle
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Vehicle update details
- **Response**: Updated vehicle object

### DELETE /api/v1/vehicles/{vehicle_id}
- **Description**: Delete vehicle (soft delete)
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### PUT /api/v1/vehicles/{vehicle_id}/assign-driver
- **Description**: Assign driver to vehicle
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Driver ID
- **Response**: Success message

### DELETE /api/v1/vehicles/{vehicle_id}/unassign-driver
- **Description**: Unassign driver from vehicle
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### PUT /api/v1/vehicles/{vehicle_id}/status
- **Description**: Update vehicle status
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: New status
- **Response**: Success message

### GET /api/v1/vehicles/stats/summary
- **Description**: Get vehicle statistics summary
- **Authentication**: JWT Bearer Token
- **Response**: Vehicle statistics

## Driver Management Endpoints

### GET /api/v1/fleet/drivers
- **Description**: Get all drivers with pagination and filters
- **Authentication**: JWT Bearer Token
- **Query Parameters**: skip, limit, status, availability
- **Response**: List of drivers

### GET /api/v1/fleet/drivers/{driver_id}
- **Description**: Get single driver by ID
- **Authentication**: JWT Bearer Token
- **Response**: Driver object

### POST /api/v1/fleet/drivers
- **Description**: Create new driver
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Driver creation details
- **Response**: Created driver object

### PUT /api/v1/fleet/drivers/{driver_id}
- **Description**: Update driver
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Driver update details
- **Response**: Updated driver object

### DELETE /api/v1/fleet/drivers/{driver_id}
- **Description**: Delete driver
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### PUT /api/v1/fleet/drivers/{driver_id}/assign-truck
- **Description**: Assign driver to truck
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Truck ID
- **Response**: Success message

### PUT /api/v1/fleet/drivers/{driver_id}/unassign-truck
- **Description**: Unassign driver from truck
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### PUT /api/v1/fleet/drivers/{driver_id}/status
- **Description**: Update driver status
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: New status
- **Response**: Success message

### PUT /api/v1/fleet/drivers/{driver_id}/availability
- **Description**: Update driver availability
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Availability status
- **Response**: Success message

## Fleet Management Endpoints

### GET /api/v1/fleet/trucks
- **Description**: Get all trucks with pagination and filters
- **Authentication**: JWT Bearer Token
- **Query Parameters**: skip, limit, status, assigned_driver_id
- **Response**: List of trucks

### GET /api/v1/fleet/trucks/{truck_id}
- **Description**: Get single truck by ID
- **Authentication**: JWT Bearer Token
- **Response**: Truck object

### POST /api/v1/fleet/trucks
- **Description**: Create new truck
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Truck creation details
- **Response**: Created truck object

### PUT /api/v1/fleet/trucks/{truck_id}
- **Description**: Update truck
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Truck update details
- **Response**: Updated truck object

### DELETE /api/v1/fleet/trucks/{truck_id}
- **Description**: Delete truck
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### PUT /api/v1/fleet/trucks/{truck_id}/unassign-driver
- **Description**: Unassign driver from truck
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### PUT /api/v1/fleet/trucks/{truck_id}/status
- **Description**: Update truck status
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: New status
- **Response**: Success message

### POST /api/v1/fleet/trucks/{truck_id}/location
- **Description**: Update truck location
- **Authentication**: JWT Bearer Token
- **Request Body**: Location details (latitude, longitude)
- **Response**: Success message

### GET /api/v1/fleet/trucks/{truck_id}/location
- **Description**: Get truck location history
- **Authentication**: JWT Bearer Token
- **Response**: Location history

### GET /api/v1/fleet/
- **Description**: Get all fleets with pagination and filters
- **Authentication**: JWT Bearer Token
- **Query Parameters**: skip, limit, is_active
- **Response**: List of fleets

### GET /api/v1/fleet/{fleet_id}
- **Description**: Get single fleet by ID
- **Authentication**: JWT Bearer Token
- **Response**: Fleet object

### POST /api/v1/fleet/
- **Description**: Create new fleet
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Fleet creation details
- **Response**: Created fleet object

### PUT /api/v1/fleet/{fleet_id}
- **Description**: Update fleet
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Fleet update details
- **Response**: Updated fleet object

### DELETE /api/v1/fleet/{fleet_id}
- **Description**: Delete fleet
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### POST /api/v1/fleet/assign
- **Description**: Assign driver to truck
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Driver ID and Truck ID
- **Response**: Success message

### DELETE /api/v1/fleet/assign/{driver_id}
- **Description**: Unassign driver by driver ID
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### GET /api/v1/fleet/summary
- **Description**: Get fleet summary
- **Authentication**: JWT Bearer Token
- **Response**: Fleet summary statistics

### POST /api/v1/fleet/default
- **Description**: Create default fleet
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

## Trip Management Endpoints

### GET /api/v1/trips/
- **Description**: Get all trips with pagination and filters
- **Authentication**: JWT Bearer Token
- **Query Parameters**: skip, limit, status, route_id
- **Response**: List of trips

### GET /api/v1/trips/{trip_id}
- **Description**: Get single trip by ID
- **Authentication**: JWT Bearer Token
- **Response**: Trip object

### POST /api/v1/trips/
- **Description**: Create new trip
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Trip creation details
- **Response**: Created trip object

### PUT /api/v1/trips/{trip_id}
- **Description**: Update trip
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Trip update details
- **Response**: Updated trip object

### DELETE /api/v1/trips/{trip_id}
- **Description**: Delete trip
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Success message

### PUT /api/v1/trips/{trip_id}/status
- **Description**: Update trip status
- **Authentication**: JWT Bearer Token (Driver or Admin role required)
- **Request Body**: New status
- **Response**: Updated trip object

### POST /api/v1/trips/{trip_id}/book
- **Description**: Book a seat on a trip
- **Authentication**: JWT Bearer Token
- **Request Body**: Seat number
- **Response**: Booking confirmation

### GET /api/v1/trips/{trip_id}/bookings
- **Description**: Get all bookings for a specific trip
- **Authentication**: JWT Bearer Token
- **Response**: List of bookings

## Booking Management Endpoints

### GET /api/v1/bookings/me
- **Description**: Get current user's bookings
- **Authentication**: JWT Bearer Token
- **Response**: List of user's bookings

### GET /api/v1/bookings/user/{user_id}
- **Description**: Get user's bookings
- **Authentication**: JWT Bearer Token
- **Response**: List of user's bookings

### PUT /api/v1/bookings/{booking_id}/cancel
- **Description**: Cancel a booking
- **Authentication**: JWT Bearer Token
- **Response**: Success message

## Order Management Endpoints

### GET /api/v1/orders/
- **Description**: Get all orders with pagination and filters
- **Authentication**: JWT Bearer Token
- **Query Parameters**: skip, limit, status
- **Response**: List of orders

### GET /api/v1/orders/{order_id}
- **Description**: Get a specific order by ID
- **Authentication**: JWT Bearer Token
- **Response**: Order object

### POST /api/v1/orders/
- **Description**: Create a new transport order
- **Authentication**: JWT Bearer Token
- **Request Body**: Order creation details
- **Response**: Created order object

### PUT /api/v1/orders/{order_id}
- **Description**: Update an existing order
- **Authentication**: JWT Bearer Token
- **Request Body**: Order update details
- **Response**: Updated order object

### DELETE /api/v1/orders/{order_id}
- **Description**: Delete an order
- **Authentication**: JWT Bearer Token
- **Response**: Success message

### POST /api/v1/orders/{order_id}/assign-driver
- **Description**: Assign a driver to an order
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Driver ID
- **Response**: Updated order object

### POST /api/v1/orders/{order_id}/assign-vehicle
- **Description**: Assign a vehicle to an order
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Vehicle ID
- **Response**: Updated order object

### PUT /api/v1/orders/{order_id}/assign
- **Description**: Assign both vehicle and driver to an order
- **Authentication**: JWT Bearer Token (Admin role required)
- **Request Body**: Vehicle ID and Driver ID
- **Response**: Updated order object

### PUT /api/v1/orders/{order_id}/status
- **Description**: Update order status
- **Authentication**: JWT Bearer Token (Driver or Admin role required)
- **Request Body**: New status
- **Response**: Updated order object

### PUT /api/v1/orders/{order_id}/approve
- **Description**: Approve a pending order
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Updated order object

### PUT /api/v1/orders/{order_id}/reject
- **Description**: Reject a pending order
- **Authentication**: JWT Bearer Token (Admin role required)
- **Response**: Updated order object

### PUT /api/v1/orders/{order_id}/cancel
- **Description**: Cancel an order
- **Authentication**: JWT Bearer Token
- **Response**: Updated order object

### PUT /api/v1/orders/{order_id}/complete
- **Description**: Complete an order
- **Authentication**: JWT Bearer Token (Driver or Admin role required)
- **Response**: Updated order object

### GET /api/v1/orders/analytics
- **Description**: Get order analytics data
- **Authentication**: JWT Bearer Token
- **Response**: Analytics data

### GET /api/v1/orders/stats
- **Description**: Get order statistics
- **Authentication**: JWT Bearer Token
- **Response**: Order statistics

### GET /api/v1/orders/revenue
- **Description**: Get revenue analytics
- **Authentication**: JWT Bearer Token
- **Response**: Revenue data

### GET /api/v1/orders/routes/popular
- **Description**: Get popular routes based on order frequency
- **Authentication**: JWT Bearer Token
- **Response**: Popular routes data