# Service Management Implementation

This document describes the implementation of the service management functionality for the fleet management system.

## Overview

The service management system allows administrators to:
1. Create and manage vehicle service records
2. Track service status and progress
3. Manage parts inventory
4. Update part stock levels
5. Associate parts with services

## Components Created

### 1. Service API Service (`src/services/serviceService.ts`)

This service provides all the API calls needed to interact with the backend service endpoints:

- `createService`: Create a new service record
- `getServices`: Retrieve services with filtering and pagination
- `getServiceById`: Get a specific service by ID
- `updateServiceStatus`: Update the status of a service
- `createPart`: Create a new part in inventory
- `getParts`: Retrieve parts inventory with filtering
- `updatePartStock`: Update part stock levels
- `addPartsToService`: Associate parts with a service

### 2. Service Management Components

#### ServiceForm (`src/components/ui-elements/fleet-management/ServiceForm.tsx`)

A form component for creating and editing service records with the following fields:
- Vehicle selection
- Service type (maintenance, repair, inspection, etc.)
- Priority level
- Assigned mechanic
- Scheduled date and time
- Estimated duration
- Cost
- Description
- Notes

#### ServiceTable (`src/components/ui-elements/fleet-management/ServiceTable.tsx`)

A table component for displaying services with:
- Vehicle information
- Service type badges
- Status indicators
- Scheduled date and cost
- Action buttons (view, edit, delete)
- Expandable rows with detailed information and status update actions

#### ServiceManagement (`src/components/ui-elements/fleet-management/ServiceManagement.tsx`)

The main service management component that integrates the form and table components, providing:
- Service listing with filtering
- Create/edit modal dialogs
- Status update functionality
- Loading states and error handling

#### PartsInventoryManagement (`src/components/ui-elements/fleet-management/PartsInventoryManagement.tsx`)

A component for managing parts inventory with:
- Parts listing with stock levels and status
- Add new part functionality
- Update stock levels
- Status badges (available, low stock, out of stock)

### 3. Pages

#### Fleet Service Management Page (`src/app/(admin)/(ui-elements)/fleet-management/services/page.tsx`)

The main page that displays both service management and parts inventory components.

#### Fleet Management Overview Page (`src/app/(admin)/(ui-elements)/fleet-management/page.tsx`)

An overview page that links to all fleet management subpages including the new service management page.

### 4. Navigation

#### Sidebar Navigation (`src/layout/AppSidebar.tsx`)

Added a "Service Management" link to the Fleet Management submenu that navigates to `/fleet-management/services`.

## Implementation Details

### Enums

The implementation uses TypeScript enums for:
- `ServiceType`: maintenance, repair, inspection, cleaning, fuel_refill, tire_change, oil_change
- `ServiceStatus`: scheduled, in_progress, completed, cancelled, overdue
- `ServicePriority`: low, medium, high, critical

### Data Models

The implementation includes interfaces for:
- `Service`: Represents a service record
- `ServiceCreate`: Data for creating a new service
- `ServiceUpdate`: Data for updating a service
- `ServiceStatusUpdate`: Data for updating service status
- `PartsInventory`: Represents a part in inventory
- `PartsInventoryCreate`: Data for creating a new part
- `PartsInventoryUpdate`: Data for updating a part
- `StockUpdate`: Data for updating part stock levels
- `PartsUsage`: Represents parts used in a service
- `PartsUsageCreate`: Data for associating parts with a service

### Features

1. **Service Creation**: Admins can create new service records by selecting a vehicle, service type, priority, and providing scheduling information.

2. **Service Status Management**: Services can be updated through different statuses (scheduled, in progress, completed, cancelled, overdue).

3. **Parts Inventory Management**: Admins can manage parts inventory, including creating new parts and updating stock levels.

4. **Responsive Design**: All components are designed to work on different screen sizes.

5. **Error Handling**: Proper error handling with user feedback through toast notifications.

6. **Loading States**: Loading indicators for async operations.

## Usage

To access the service management system:

1. Navigate to Fleet Management > Service Management in the sidebar
2. Use the "Create Service" button to add new services
3. View service details by clicking the view icon in the table
4. Update service status using the action buttons in the expanded service details
5. Manage parts inventory through the Parts Inventory section

## Future Improvements

1. Add filtering and search capabilities to the service table
2. Implement pagination for services and parts lists
3. Add validation to form inputs
4. Implement delete functionality for services and parts
5. Add more detailed reporting and analytics
6. Implement service history tracking