# Order Status Update Feature

## Implementation Summary

This feature allows both drivers and admins to update order statuses with role-based permissions. The implementation follows the API specification: `PUT /api/v1/orders/{order_id}/status?status_update={status}`.

### 1. API Service Updates (`orderService.ts`)
- Updated `updateOrderStatus()` method to use query parameter format
- Changed from PATCH with body to PUT with query parameter
- Follows the API specification: `PUT /api/v1/orders/1/status?status_update=pending`

### 2. Status Update Modal Component (`StatusUpdateModal.tsx`)
- Role-based status update interface
- Different available statuses for admins vs drivers
- Visual status workflow guidance
- Enhanced dark/light mode support

### 3. Enhanced Order Table (`OrderTable.tsx`)
- Added orange "Status" button for drivers and admins
- Button visibility based on user role (admin OR driver)
- Improved action button layout

### 4. Orders Page Integration (`page.tsx`)
- Added status update modal state management
- Integrated with existing CRUD operations
- Role-based functionality

## Role-Based Status Permissions

### **Admin Users (Full Control)**
Can change order status to any of the following:
- `pending` - Order is waiting for processing
- `confirmed` - Order has been confirmed
- `assigned` - Vehicle and driver assigned
- `in_progress` - Order is being executed
- `completed` - Order has been completed
- `cancelled` - Order has been cancelled

### **Driver Users (Workflow-Based)**
Can only update statuses based on current order state:

**From `assigned` status:**
- → `in_progress` (Start Trip) - Begin the delivery journey

**From `in_progress` status:**
- → `completed` (Complete Delivery) - Mark order as completed

**All other statuses:**
- No changes allowed - Driver cannot modify

## API Endpoint Usage

The implementation uses the provided API endpoint:

```bash
curl -X 'PUT' \
  'http://localhost:8000/api/v1/orders/1/status?status_update=pending' \
  -H 'Authorization: Bearer {token}' \
  -H 'accept: application/json'
```

## Features

✅ **Role-Based Access**: Different permissions for admins and drivers
✅ **Workflow Control**: Drivers can only advance through logical status progression
✅ **Visual Guidance**: Status descriptions and workflow explanations
✅ **Current Status Display**: Shows current order status with colored badges
✅ **Enhanced UI**: Orange "Status" button with proper dark/light mode support
✅ **Real-time Updates**: Order table refreshes after status change
✅ **Error Handling**: Comprehensive validation and user feedback
✅ **Success Feedback**: Visual confirmation of successful updates

## Status Workflow for Drivers

```
assigned → [Driver clicks "Start Trip"] → in_progress → [Driver clicks "Complete Delivery"] → completed
```

## Usage Instructions

### **For Drivers:**
1. **Find Assigned Order**: Look for orders with "assigned" status
2. **Click Orange "Status" Button**: Available in order table actions
3. **Start Trip**: Select "Start Trip" to begin delivery
4. **Complete Delivery**: When finished, select "Complete Delivery"

### **For Admins:**
1. **Click Orange "Status" Button**: Available for all orders
2. **Select Any Status**: Choose from all available status options
3. **Confirm Change**: Click "Update Status" to apply

## Status Badge Colors

- **Pending**: Warning (Yellow)
- **Confirmed**: Info (Blue)
- **Assigned**: Primary (Blue)
- **In Progress**: Info (Blue)
- **Completed**: Success (Green)
- **Cancelled**: Error (Red)

The status update functionality is now fully integrated and provides a complete workflow management system for both drivers and administrators!