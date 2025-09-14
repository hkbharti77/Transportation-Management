# Role-Based Routing Implementation

This document describes the role-based routing implementation in the Transportation Management System.

## Overview

The system implements role-based access control with four main roles:
1. **Admin** - Full system access
2. **Driver** - Access to driver-specific functionality
3. **Customer/Public User** - Access to passenger services
4. **Dispatcher** - Access to dispatch operations

## Implementation Details

### 1. Authentication Flow

The authentication flow has been enhanced to redirect users to their appropriate dashboards based on their roles:

1. User signs in via the [SignInForm](src/components/auth/SignInForm.tsx)
2. After successful authentication, the system determines the user's role
3. User is redirected to their role-specific dashboard:
   - Admin → `/admin/overview`
   - Driver → `/driver-home`
   - Customer/Public Service Manager → `/dashboard`
   - Dispatcher → `/dispatches/all`

### 2. Role-Based Utilities

The [roleBasedRouting.ts](src/utils/roleBasedRouting.ts) file contains:

- **UserRole type**: Defines all possible user roles
- **roleBasedRoutes**: Maps each role to their accessible routes
- **getRoutesForRole**: Returns accessible routes for a specific role
- **isRouteAccessible**: Checks if a route is accessible for a role
- **getDefaultDashboardRoute**: Returns the default dashboard for a role

### 3. Dashboard Pages

Each role has a dedicated dashboard page:

- **Admin**: [AdminOverviewPage](src/app/admin/overview/page.tsx)
- **Driver**: [DriverHomePage](src/app/driver-home/page.tsx)
- **Customer**: [CustomerDashboardPage](src/app/dashboard/page.tsx)
- **Dispatcher**: [DispatcherDashboardPage](src/app/dispatches/all/page.tsx)

### 4. Layout Protection

The [AdminLayout](src/app/admin/layout.tsx) component protects admin routes and redirects non-admin users to their appropriate dashboards.

## Role-Specific Views

### 1. Admin View (Full System Access)

Administrators have comprehensive access to all system components:

- **Dashboard Overview**: System metrics and analytics
- **Analytics and Reporting**: Booking, truck, driver, and revenue analytics
- **User Management**: View and manage all users, drivers, customers, and transporters
- **Fleet Management**: Complete vehicle inventory and maintenance tracking
- **System Monitoring**: Health checks and audit logs

### 2. Driver View

Drivers have access to functionality related specifically to their work assignments:

- **Trip Information**: View assigned trips with route details
- **Vehicle Information**: Access assigned vehicle details and maintenance history
- **Trip Management**: Update trip status and report issues
- **Navigation**: Access route maps and real-time tracking

### 3. Public User/Customer View

Public users have access to passenger services:

- **Trip Booking**: Search and book trips with seat selection
- **Booking Management**: View booking history and manage reservations
- **Real-time Tracking**: Track vehicle locations and ETAs
- **Payment Management**: View payment history and receipts

### 4. Dispatcher View

Dispatchers coordinate operations and manage resources:

- **Order Management**: Create and manage transportation orders
- **Resource Management**: View fleet status and driver schedules
- **Trip Coordination**: Schedule trips and monitor ongoing operations
- **Performance Monitoring**: Track service metrics and generate reports

## Security Implementation

The system implements robust security measures:

- **JWT-based authentication** for all users
- **Role-based access control** preventing unauthorized access
- **403 responses** for attempts to access restricted functionality
- **Encrypted password storage**
- **Audit logging** of all user actions

## Future Enhancements

Planned improvements to the role-based routing system:

1. **Dynamic Sidebar Generation**: Generate sidebar menus dynamically based on role permissions
2. **Fine-grained Permissions**: Implement more granular permissions within roles
3. **Role Hierarchy**: Define role hierarchies for inherited permissions
4. **Permission-based UI**: Show/hide UI elements based on specific permissions rather than just roles