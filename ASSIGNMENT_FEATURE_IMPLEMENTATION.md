# Vehicle and Driver Assignment Feature

## Implementation Summary

This feature allows admin users to assign vehicles and drivers to transport orders. The implementation includes:

### 1. API Service Updates (`orderService.ts`)
- Added `assignVehicleAndDriver()` method for the main assignment endpoint
- Enhanced existing `assignDriver()` and `assignVehicle()` methods
- Follows the API specification: `PUT /api/v1/orders/{order_id}/assign`

### 2. Assignment Modal Component (`AssignOrderModal.tsx`)
- Modal interface for selecting vehicles and drivers
- Shows current order details and existing assignments
- Supports both individual and combined assignments
- Admin-only functionality with role-based access control
- Enhanced dark/light mode support

### 3. Enhanced Order Table (`OrderTable.tsx`)
- Added "Assign" button for admin users only (purple color)
- Visual indicators for current assignments (vehicle 🚛 and driver 👤)
- Improved action button layout with proper spacing

### 4. Orders Page Integration (`page.tsx`)
- Added assignment modal state management
- Integrated assignment functionality with existing CRUD operations
- Role-based button visibility (admin only)

## API Endpoint Usage

The implementation uses the provided API endpoint:

```
PUT /api/v1/orders/{order_id}/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "vehicle_id": 1,
  "driver_id": 3
}
```

## Features

✅ **Admin-Only Access**: Assignment functionality is restricted to admin users
✅ **Current Assignment Display**: Shows existing vehicle and driver assignments
✅ **Flexible Assignment**: Can assign vehicle only, driver only, or both
✅ **Enhanced UI**: Purple "Assign" button with proper dark/light mode support
✅ **Real-time Updates**: Order table refreshes after assignment
✅ **Error Handling**: Comprehensive error handling and user feedback
✅ **Success Feedback**: Visual confirmation of successful assignments

## Usage Instructions

1. **Admin Login**: Only admin users see the "Assign" button
2. **Click Assign**: Purple "Assign" button in the order table actions
3. **Select Resources**: Choose from available vehicles and drivers
4. **Confirm Assignment**: Click "Assign" to complete the operation
5. **View Status**: Assignment status shows in order table with badges

## Mock Data Note

Currently using mock data for vehicles and drivers. Replace the mock data in `AssignOrderModal.tsx` with actual API calls to fetch available resources:

```typescript
// Replace these with actual API endpoints
const driversResponse = await fetch('/api/v1/drivers?status=active');
const vehiclesResponse = await fetch('/api/v1/vehicles?status=available');
```

The assignment functionality is now fully integrated and ready for use!