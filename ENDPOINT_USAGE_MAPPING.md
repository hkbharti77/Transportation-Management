# API Endpoint Usage Mapping

This document shows which API endpoints are used in which pages/components of the Transportation Management system.

## Auth Endpoints

### GET /api/v1/auth/me
- **Used in**: [AuthContext.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/context/AuthContext.tsx)
- **Purpose**: Fetch current user profile on app initialization and token validation

### POST /api/v1/auth/login
- **Used in**: [SignInForm.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/components/auth/SignInForm.tsx)
- **Purpose**: User authentication

### POST /api/v1/auth/register
- **Used in**: [userService.registerDriver()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**: 
  - [CreatePublicManagerPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/public-managers/create/page.tsx)
  - [AddDriverModal.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/components/drivers/AddDriverModal.tsx)
- **Purpose**: Register new drivers and public managers

## User Management Endpoints

### GET /api/v1/users/me
- **Used in**: [userService.getCurrentUser()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [SignInForm.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/components/auth/SignInForm.tsx) (after login)
  - [UserProfile.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(customer)/user-profile/page.tsx)
- **Purpose**: Get current user profile information

### PUT /api/v1/users/me (NEW)
- **Used in**: [userService.updateCurrentUser()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Examples**:
  - [ProfileUpdateForm.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/NEW_ENDPOINTS_USAGE.md) (example in documentation)
- **Purpose**: Update current user profile information

### PUT /api/v1/users/me/password
- **Used in**: [userService.changePassword()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [ChangePasswordModal.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/components/user-profile/ChangePasswordModal.tsx)
- **Purpose**: Change current user password

### GET /api/v1/users/
- **Used in**: [userService.getUsers()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [UsersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/users/page.tsx)
- **Purpose**: Get all users with filtering and pagination

### POST /api/v1/users/
- **Used in**: [userService.createUser()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [CreateUserPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/users/create/page.tsx)
- **Purpose**: Create new users

### GET /api/v1/users/{user_id}
- **Used in**: [userService.getUserById()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [UserDetailsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/users/[id]/page.tsx)
  - [CustomerDetailsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/customers/[id]/page.tsx)
  - [TransporterDetailsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/transporters/[id]/page.tsx)
  - [DriverDetailsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/drivers/[id]/page.tsx)
- **Purpose**: Get specific user details

### PUT /api/v1/users/{user_id}
- **Used in**: [userService.updateUser()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [EditUserPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/users/[id]/edit/page.tsx)
  - [EditCustomerPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/customers/[id]/edit/page.tsx)
  - [EditTransporterPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/transporters/[id]/edit/page.tsx)
  - [EditDriverPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/drivers/[id]/edit/page.tsx)
- **Purpose**: Update specific user information

### DELETE /api/v1/users/{user_id}
- **Used in**: [userService.deleteUser()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) and [userService.deleteUserById()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) methods
- **Used in Pages**:
  - [UsersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/users/page.tsx)
  - [CustomersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/customers/page.tsx)
  - [TransportersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/transporters/page.tsx)
  - [DriversPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/drivers/page.tsx)
- **Purpose**: Delete users

### PUT /api/v1/users/{user_id}/role
- **Used in**: [userService.changeUserRole()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [UsersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/users/page.tsx)
  - [CustomersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/customers/page.tsx)
  - [TransportersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/transporters/page.tsx)
- **Purpose**: Change user roles

### PUT /api/v1/users/{user_id}/activate
- **Used in**: [userService.toggleUserStatus()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [UsersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/users/page.tsx)
  - [CustomersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/customers/page.tsx)
  - [TransportersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/transporters/page.tsx)
  - [DriversPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/drivers/page.tsx)
- **Purpose**: Activate/deactivate users

### POST /api/v1/users/{user_id}/reset-password
- **Used in**: [userService.resetUserPassword()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [UsersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/users/page.tsx)
  - [CustomersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/customers/page.tsx)
  - [TransportersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/transporters/page.tsx)
  - [DriversPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/drivers/page.tsx)
- **Purpose**: Reset user passwords

### GET /api/v1/users/drivers
- **Used in**: [userService.getDrivers()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [DriversPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/drivers/page.tsx)
- **Purpose**: Get all drivers

### GET /api/v1/users/customers
- **Used in**: [userService.getCustomers()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [CustomersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/customers/page.tsx)
- **Purpose**: Get all customers

### GET /api/v1/users/transporters
- **Used in**: [userService.getTransporters()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/userService.ts) method
- **Used in Pages**:
  - [TransportersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/transporters/page.tsx)
- **Purpose**: Get all transporters

## Route Management Endpoints

### GET /api/v1/routes/
- **Used in**: [routeService.getRoutes()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/routeService.ts) method
- **Used in Pages**:
  - [RoutesPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/routes/page.tsx)
  - [RouteAnalyticsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/routes/analytics/page.tsx)
- **Purpose**: Get all routes with filtering

### POST /api/v1/routes/
- **Used in**: [routeService.createRoute()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/routeService.ts) method
- **Used in Pages**:
  - [CreateRoutePage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/routes/create/page.tsx)
- **Purpose**: Create new routes

### GET /api/v1/routes/{route_id}
- **Used in**: [routeService.getRouteById()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/routeService.ts) method
- **Used in Pages**:
  - [RouteDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/routes/[id]/page.tsx)
- **Purpose**: Get specific route details

### PUT /api/v1/routes/{route_id}
- **Used in**: [routeService.updateRoute()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/routeService.ts) method
- **Used in Pages**:
  - [EditRoutePage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/routes/[id]/edit/page.tsx)
- **Purpose**: Update route information

### DELETE /api/v1/routes/{route_id}
- **Used in**: [routeService.deleteRoute()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/routeService.ts) method
- **Used in Pages**:
  - [RoutesPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/routes/page.tsx)
- **Purpose**: Delete routes

### GET /api/v1/routes/stats
- **Used in**: [routeService.getRouteStats()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/routeService.ts) method
- **Used in Pages**:
  - [RouteAnalyticsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/routes/analytics/page.tsx)
- **Purpose**: Get overall route statistics

### GET /api/v1/routes/{route_id}/stats
- **Used in**: [routeService.getRouteDetailStats()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/routeService.ts) method
- **Used in Pages**:
  - [RouteDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/routes/[id]/page.tsx) (Stats tab)
- **Purpose**: Get statistics for a specific route

### GET /api/v1/routes/{route_id}/trips
- **Used in**: [routeService.getRouteTrips()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/routeService.ts) method
- **Used in Pages**:
  - [RouteDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/routes/[id]/page.tsx) (Trips tab)
- **Purpose**: Get trips for a specific route

## Trip Management Endpoints

### GET /api/v1/trips/
- **Used in**: [tripService.getTrips()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Pages**:
  - [TripsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/trips/page.tsx)
  - [TripDashboardPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/trips/dashboard/page.tsx)
  - [TripAnalyticsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/trips/analytics/page.tsx)
  - [CompletedTripsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/trips/completed/page.tsx)
- **Purpose**: Get all trips with filtering

### POST /api/v1/trips/
- **Used in**: [tripService.createTrip()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Pages**:
  - [CreateTripModal.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/components/ui-elements/trip-management/CreateTripModal.tsx)
- **Purpose**: Create new trips

### GET /api/v1/trips/{trip_id}
- **Used in**: [tripService.getTripById()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Pages**:
  - [TripDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/trips/[id]/page.tsx)
- **Purpose**: Get specific trip details

### PUT /api/v1/trips/{trip_id}
- **Used in**: [tripService.updateTrip()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Pages**:
  - [EditTripModal.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/components/ui-elements/trip-management/EditTripModal.tsx)
- **Purpose**: Update trip information

### DELETE /api/v1/trips/{trip_id}
- **Used in**: [tripService.deleteTrip()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Pages**:
  - [TripsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/trips/page.tsx)
- **Purpose**: Delete trips

### PUT /api/v1/trips/{trip_id}/status
- **Used in**: [tripService.updateTripStatus()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Pages**:
  - [TripTable.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/components/ui-elements/trip-management/TripTable.tsx)
  - [TripDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/trips/[id]/page.tsx)
- **Purpose**: Update trip status

### POST /api/v1/trips/{trip_id}/book
- **Used in**: [tripService.bookTrip()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Pages**:
  - [TripTable.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/components/ui-elements/trip-management/TripTable.tsx)
- **Purpose**: Book a seat on a trip

### GET /api/v1/trips/{trip_id}/bookings
- **Used in**: [tripService.getTripBookings()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Pages**:
  - [TripTable.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/components/ui-elements/trip-management/TripTable.tsx) (View Bookings button)
- **Purpose**: Get all bookings for a specific trip

### GET /api/v1/trips/resources (NEW)
- **Used in**: [tripService.getTripResources()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Examples**:
  - [TripCreationForm.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/NEW_ENDPOINTS_USAGE.md) (example in documentation)
- **Purpose**: Get resources (vehicles, drivers, routes) needed for trip creation

## Booking Management Endpoints

### GET /api/v1/bookings/me
- **Used in**: [tripService.getUserBookings()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Pages**:
  - [UserBookingsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(customer)/bookings/page.tsx)
- **Purpose**: Get current user's bookings

### GET /api/v1/bookings/user/{user_id}
- **Used in**: [tripService.getUserBookings()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Pages**:
  - [CustomerBookingsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/customers/[id]/bookings/page.tsx)
- **Purpose**: Get specific user's bookings

### PUT /api/v1/bookings/{booking_id}/cancel
- **Used in**: [tripService.cancelBooking()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/tripService.ts) method
- **Used in Pages**:
  - [UserBookingsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(customer)/bookings/page.tsx)
- **Purpose**: Cancel a booking

## Order Management Endpoints

### GET /api/v1/orders/
- **Used in**: [orderService.getOrders()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrdersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/page.tsx)
  - [ActiveOrdersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/active/page.tsx)
- **Purpose**: Get all orders with filtering

### POST /api/v1/orders/
- **Used in**: [orderService.createOrder()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [CreateOrderPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(customer)/create-order/page.tsx)
- **Purpose**: Create new orders

### GET /api/v1/orders/{order_id}
- **Used in**: [orderService.getOrderById()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/[id]/page.tsx)
- **Purpose**: Get specific order details

### PUT /api/v1/orders/{order_id}
- **Used in**: [orderService.updateOrder()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [EditOrderPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/[id]/edit/page.tsx)
- **Purpose**: Update order information

### DELETE /api/v1/orders/{order_id}
- **Used in**: [orderService.deleteOrder()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrdersPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/page.tsx)
- **Purpose**: Delete orders

### PUT /api/v1/orders/{order_id}/status
- **Used in**: [orderService.updateOrderStatus()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [StatusUpdateModal.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/components/ui-elements/order-management/StatusUpdateModal.tsx)
  - [OrderDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/[id]/page.tsx)
- **Purpose**: Update order status

### POST /api/v1/orders/{order_id}/assign-driver
- **Used in**: [orderService.assignDriver()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/[id]/page.tsx)
- **Purpose**: Assign driver to order

### POST /api/v1/orders/{order_id}/assign-vehicle
- **Used in**: [orderService.assignVehicle()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/[id]/page.tsx)
- **Purpose**: Assign vehicle to order

### PUT /api/v1/orders/{order_id}/assign
- **Used in**: [orderService.assignVehicleAndDriver()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/[id]/page.tsx)
- **Purpose**: Assign both vehicle and driver to order

### PUT /api/v1/orders/{order_id}/approve
- **Used in**: [orderService.approveOrder()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/[id]/page.tsx)
- **Purpose**: Approve pending orders

### PUT /api/v1/orders/{order_id}/reject
- **Used in**: [orderService.rejectOrder()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/[id]/page.tsx)
- **Purpose**: Reject pending orders

### PUT /api/v1/orders/{order_id}/cancel
- **Used in**: [orderService.cancelOrder()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/[id]/page.tsx)
  - [CustomerOrderDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(customer)/orders/[id]/page.tsx)
- **Purpose**: Cancel orders

### PUT /api/v1/orders/{order_id}/complete
- **Used in**: [orderService.completeOrder()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderDetailPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/[id]/page.tsx)
- **Purpose**: Mark orders as completed

### GET /api/v1/orders/analytics
- **Used in**: [orderService.getOrderAnalytics()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderAnalyticsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/analytics/page.tsx)
- **Purpose**: Get order analytics data

### GET /api/v1/orders/stats
- **Used in**: [orderService.getOrderStats()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderDashboardPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/dashboard/page.tsx)
- **Purpose**: Get order statistics

### GET /api/v1/orders/revenue
- **Used in**: [orderService.getOrderRevenue()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderAnalyticsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/analytics/page.tsx)
- **Purpose**: Get order revenue analytics

### GET /api/v1/orders/routes/popular
- **Used in**: [orderService.getPopularRoutes()](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/services/orderService.ts) method
- **Used in Pages**:
  - [OrderAnalyticsPage.tsx](file:///C:/Users/LENOVO/Downloads/TailAdmin-nextjs-admin-dashboard-main/Transportation-Management/src/app/(admin)/(ui-elements)/orders/analytics/page.tsx)
- **Purpose**: Get popular routes based on order frequency