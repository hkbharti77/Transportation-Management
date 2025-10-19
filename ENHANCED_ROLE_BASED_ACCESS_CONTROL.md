# Enhanced Role-Based Access Control System

## Overview

This document describes the enhanced Role-Based Access Control (RBAC) system implemented in the Transportation Management System. The system provides distinct views and access levels for six different user roles:

1. **Admin** - Full system access
2. **Driver** - Trip information and vehicle details
3. **Customer** - Booking and tracking services
4. **Dispatcher** - Operations coordination
5. **Public Service Manager** - Public transport management
6. **Staff** - Limited access

## Role Definitions and Access Levels

### 1. Admin (Full System Access)
Admin users have unrestricted access to all system features and can perform all administrative functions.

**Dashboard**: `/admin/overview`

**Key Features**:
- Complete system administration
- User management (create, edit, delete users)
- Full access to analytics and reporting
- Fleet management
- Order and trip management
- Payment and invoice management
- System configuration

### 2. Driver (Trip Information and Vehicle Details)
Drivers have access to functionality related specifically to their work assignments.

**Dashboard**: `/driver-home`

**Key Features**:
- View assigned trips with route details
- Access assigned vehicle details and maintenance history
- Update trip status and report issues
- Access navigation tools
- View trip history and earnings

### 3. Customer (Booking and Tracking Services)
Customers have access to passenger services for booking and tracking transportation.

**Dashboard**: `/dashboard`

**Key Features**:
- Search and book trips with seat selection
- View booking history and manage reservations
- Track vehicle locations and ETAs in real-time
- View payment history and receipts
- Manage profile and preferences

### 4. Dispatcher (Operations Coordination)
Dispatchers coordinate operations and manage resources for transportation services.

**Dashboard**: `/dispatcher-home`

**Key Features**:
- Create and manage transportation dispatches
- View fleet status and driver schedules
- Schedule trips and monitor ongoing operations
- Assign drivers to bookings
- Track service metrics and generate reports
- Manage available drivers

### 5. Public Service Manager (Public Transport Management)
Public Service Managers manage public transportation services and ticketing systems.

**Dashboard**: `/dashboard` (shared with Customer role)

**Key Features**:
- Create and manage public transportation routes
- Manage service schedules and availability
- Handle ticket booking and management
- View public service analytics and statistics
- Manage service status updates
- Handle customer tickets and inquiries

### 6. Staff (Limited Access)
Staff members have limited access to specific areas of the system for operational support.

**Dashboard**: `/staff-dashboard`

**Key Features**:
- View and manage orders
- Monitor active and completed trips
- Access limited vehicle information
- Basic reporting capabilities
- Profile management

## Implementation Details

### Authentication Flow

1. User signs in via the SignInForm component
2. After successful authentication, the system determines the user's role
3. User is redirected to their role-specific dashboard:
   - Admin → `/admin/overview`
   - Driver → `/driver-home`
   - Customer → `/dashboard`
   - Dispatcher → `/dispatcher-home`
   - Public Service Manager → `/dashboard`
   - Staff → `/staff-dashboard`

### Role-Based Routing

The system uses a centralized role-based routing configuration in `src/utils/roleBasedRouting.ts`:

- **UserRole type**: Defines all possible user roles
- **roleBasedRoutes**: Maps each role to their accessible routes
- **getRoutesForRole**: Returns accessible routes for a specific role
- **isRouteAccessible**: Checks if a route is accessible for a role
- **getDefaultDashboardRoute**: Returns the default dashboard for a role

### Access Control Enforcement

Access control is enforced at multiple levels:

1. **Layout Level**: The AdminLayout component in `src/app/(admin)/layout.tsx` protects admin routes and redirects users based on their roles.

2. **Component Level**: The RoleBasedLayout component in `src/components/layout/RoleBasedLayout.tsx` can be used to protect specific pages or components.

3. **Service Level**: API services check user roles and permissions before performing operations.

### Sidebar Navigation

Each role has a customized sidebar navigation menu:

- **Admin**: Full menu with all system options
- **Driver**: Driver-focused menu with trip and vehicle options
- **Customer**: Passenger services menu with booking and tracking options
- **Dispatcher**: Dispatch management menu with order and resource options
- **Public Service Manager**: Public transport management menu
- **Staff**: Limited menu with basic operational options

## Security Considerations

- **Authentication Required**: All access requires valid authentication
- **Role-Based UI**: Interface adapts based on user role
- **API-Level Validation**: Backend APIs validate user roles for all operations
- **Token-Based Authentication**: Uses JWT tokens stored securely
- **Proper Error Handling**: Graceful handling of authentication failures

## Testing the Implementation

### Test Scenarios

1. **Admin Access**:
   - Login as admin user
   - Verify access to all system features
   - Test user management functionality

2. **Driver Access**:
   - Login as driver user
   - Verify access to driver dashboard and trip information
   - Test vehicle information access

3. **Customer Access**:
   - Login as customer user
   - Verify access to booking and tracking services
   - Test profile management

4. **Dispatcher Access**:
   - Login as dispatcher user
   - Verify access to dispatch management features
   - Test order and trip coordination

5. **Public Service Manager Access**:
   - Login as public service manager user
   - Verify access to public service management features
   - Test ticket management

6. **Staff Access**:
   - Login as staff user
   - Verify limited access to system features
   - Test order and trip management

## Future Enhancements

1. **Dynamic Permissions**: Implement more granular permissions within roles
2. **Role Hierarchy**: Add support for role inheritance and composite roles
3. **Audit Logging**: Track role-based access and actions for security auditing
4. **Multi-Tenancy**: Support for organization-based role separation