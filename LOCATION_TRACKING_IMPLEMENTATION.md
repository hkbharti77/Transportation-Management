# Location Tracking Implementation

## Overview
This implementation provides a comprehensive location tracking system for the transportation management application. It includes real-time location updates, historical tracking, and map visualization.

## Features Implemented

### 1. Tracking Service (`src/services/trackingService.ts`)
- **Location Data Submission**: Submit GPS coordinates and related data
- **Location Data Updates**: Update existing location records using PUT endpoint
- **Location History**: Retrieve historical location data for trucks
- **Current Location**: Get the most recent location for a specific truck
- **Booking Position**: Get location data for specific booking
- **Location by ID**: Get specific location record by location ID
- **Tracking Statistics**: View overall tracking metrics
- **Real-time Updates**: WebSocket connection for live location updates
- **Browser Geolocation**: Get current location from user's device
- **Distance Calculation**: Calculate distances between coordinates
- **Data Formatting**: Format location data for display

### 2. Location Tracking Page (`src/app/(admin)/(ui-elements)/tracking/location/page.tsx`)
- **Location Submission Form**: Manual location data entry
- **Location Editing**: Edit existing location records with PUT endpoint
- **Booking Position Tracking**: Track location by booking ID
- **Real-time Tracking**: Start/stop real-time location tracking
- **Current Location Display**: Show current truck location with details
- **Location History Table**: Display historical location data with edit actions
- **Truck Selection**: Choose which truck to track
- **GPS Integration**: Get current location from browser GPS
- **Status Indicators**: Connection status and tracking state
- **Error Handling**: Comprehensive error handling and user feedback

### 3. Map Visualization (`src/components/ui-elements/maps/LocationMap.tsx`)
- **Location Plotting**: Visual representation of locations on a map
- **Current vs Historical**: Different markers for current and historical locations
- **Booking Position**: Purple markers for booking-specific locations
- **Interactive Legend**: Color-coded legend for different location types
- **Location Details**: Overlay showing coordinate details
- **Responsive Design**: Adapts to different screen sizes

### 4. Navigation Integration
- Added "Tracking & Location" section to admin sidebar
- Easy access to location tracking features
- Organized navigation structure

## API Endpoint Integration

The implementation integrates with the following API endpoints:

### Create Location
```
POST /api/v1/tracking/location
```

**Request Body:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "altitude": 215,
  "speed": 54,
  "heading": 92,
  "accuracy": 5,
  "location_type": "gps",
  "truck_id": 1,
  "timestamp": "2025-09-14T06:42:17.638Z"
}
```

### Update Location
```
PUT /api/v1/tracking/location/{location_id}
```

**Request Body:**
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "altitude": 14,
  "speed": 45,
  "heading": 120,
  "accuracy": 4,
  "location_type": "gps"
}
```

### Get Current Truck Location
```
GET /api/v1/tracking/truck/{truck_id}/current
```

### Get Truck Location History
```
GET /api/v1/tracking/truck/{truck_id}/history
```

### Get Booking Position
```
GET /api/v1/tracking/booking/{booking_id}/position
```

**Response (for both endpoints):**
```json
{
  "latitude": 19.076,
  "longitude": 72.8777,
  "altitude": 14,
  "speed": 45,
  "heading": 120,
  "accuracy": 4,
  "location_type": "gps",
  "location_id": 2,
  "truck_id": 1,
  "timestamp": "2025-09-14T12:12:17.638000+05:30",
  "created_at": "2025-09-14T06:59:40.891019+05:30"
}
```

## Usage Instructions

### For Administrators

1. **Access Location Tracking**:
   - Navigate to "Tracking & Location" → "Location Tracking" in the sidebar
   - Or go directly to `/tracking/location`

2. **Submit Location Data**:
   - Select a truck from the dropdown
   - Enter coordinates manually or use "Get Current Location" button
   - Fill in additional details (speed, heading, accuracy)
   - Click "Submit Location"

3. **Track Booking Position**:
   - Enter a booking ID in the "Booking Position Tracking" section
   - Click "Track Booking" to get the current position
   - View booking location details and coordinates
   - Booking position appears on the map with purple marker

4. **Edit Location Data**:
   - Click the edit button (pencil icon) next to any location in the history table
   - Modify the coordinates and other details
   - Click "Update Location" to save changes
   - Click "Cancel Edit" to discard changes

5. **Real-time Tracking**:
   - Select a truck
   - Click "Start Tracking" to begin real-time updates
   - Click "Stop Tracking" to end real-time updates
   - View live location updates on the map

6. **View Location History**:
   - Select a truck to view its location history
   - Historical data appears in the table below
   - Map shows all historical locations with different markers
   - Edit any location record by clicking the edit button

### For Developers

#### Using the Tracking Service

```typescript
import { trackingService } from '@/services/trackingService';

// Submit location data
const locationData = {
  latitude: 28.6139,
  longitude: 77.2090,
  altitude: 215,
  speed: 54,
  heading: 92,
  accuracy: 5,
  location_type: 'gps' as const,
  truck_id: 1,
  timestamp: new Date().toISOString()
};

const result = await trackingService.submitLocation(locationData);

// Update existing location
const updateData = {
  latitude: 19.0760,
  longitude: 72.8777,
  altitude: 14,
  speed: 45,
  heading: 120,
  accuracy: 4,
  location_type: 'gps' as const
};

const updatedResult = await trackingService.updateLocation(2, updateData);

// Get location history
const history = await trackingService.getLocationHistory(1, '2025-01-01', '2025-12-31');

// Get current location
const current = await trackingService.getCurrentLocation(1);

// Get specific location by ID
const specificLocation = await trackingService.getLocationById(2);

// Get booking position
const bookingPosition = await trackingService.getBookingPosition(16);

// Start real-time tracking
const ws = trackingService.connectToLocationUpdates(
  1,
  (location) => console.log('New location:', location),
  (error) => console.error('Tracking error:', error)
);
```

#### Using the Map Component

```typescript
import { GoogleMap } from '@/components/ui-elements/maps';

<GoogleMap 
  locations={locationHistory}
  currentLocation={currentLocation}
  bookingPosition={bookingPosition}
  height="500px"
  className="custom-map-class"
/>
```

## Technical Details

### Data Flow
1. User selects truck and enters location data
2. Data is validated and sent to API
3. API stores location record and returns confirmation
4. UI updates with new location data
5. Map component re-renders with new markers
6. Location history is refreshed

### Real-time Updates
- WebSocket connection established when tracking starts
- Server pushes location updates to client
- Client updates UI and map in real-time
- Connection automatically handles errors and reconnection

### Error Handling
- Network errors are caught and displayed to user
- GPS permission errors are handled gracefully
- WebSocket connection errors trigger reconnection attempts
- Form validation prevents invalid data submission

### Performance Considerations
- Location history is limited to 50 most recent records
- Map markers are optimized for performance
- WebSocket connection is cleaned up on component unmount
- Debounced updates prevent excessive API calls

## Future Enhancements

1. **Advanced Map Features**:
   - Route visualization
   - Geofencing alerts
   - Heat maps

2. **Analytics**:
   - Speed analysis
   - Route optimization
   - Fuel consumption tracking
   - Driver behavior analysis

3. **Notifications**:
   - Real-time alerts
   - Geofence violations
   - Speed limit warnings
   - Maintenance reminders

4. **Mobile App Integration**:
   - Background location tracking
   - Push notifications
   - Offline capability
   - GPS accuracy optimization

## Dependencies

- React 18+
- Next.js 14+
- TypeScript
- Google Maps JavaScript API
- WebSocket API
- Geolocation API
- Custom UI components

## Security Considerations

- All API calls require authentication
- Location data is encrypted in transit
- User permissions are validated
- Sensitive data is not logged
- WebSocket connections are authenticated

## Testing

The implementation includes comprehensive error handling and can be tested with:

1. **Manual Testing**:
   - Submit various location data formats
   - Test GPS permission scenarios
   - Verify real-time updates
   - Check error handling

2. **API Testing**:
   - Use the provided curl commands
   - Test with different truck IDs
   - Verify response formats
   - Check error responses

3. **Integration Testing**:
   - Test with actual truck data
   - Verify map rendering
   - Check WebSocket connections
   - Test user permissions

4. **Automated Testing**:
   - Use the included `LocationTrackingTester` utility
   - Run tests in browser console: `LocationTrackingTester.runAllTests()`
   - Test individual components: `LocationTrackingTester.testLocationSubmission()`

## Troubleshooting

### Common Issues and Solutions

#### 1. API Endpoint Errors (404/405)
**Problem**: Server returns 404 or 405 errors for some endpoints
**Solution**: The application gracefully handles missing endpoints:
- Stats endpoint: Returns mock data with "N/A" values
- History endpoint: Shows empty state with helpful message
- WebSocket: Disables real-time tracking with user notification

#### 2. WebSocket Connection Failed (403)
**Problem**: WebSocket connection fails with 403 error
**Solution**: 
- Real-time tracking is disabled automatically
- Manual location submission still works
- User is notified about limited functionality

#### 3. Location History Not Loading
**Problem**: Location history table shows "No Location History"
**Solution**:
- Check if history endpoint is implemented on server
- Use manual location submission as workaround
- History will populate once server endpoint is available

#### 4. GPS Permission Denied
**Problem**: "Get Current Location" button fails
**Solution**:
- Check browser location permissions
- Use manual coordinate entry instead
- Ensure HTTPS for production (required for GPS)

### Server Requirements

For full functionality, the server should implement:

1. **Required Endpoints** (Working):
   - `POST /api/v1/tracking/location` - Create location
   - `PUT /api/v1/tracking/location/{id}` - Update location

2. **Available Endpoints** (Working):
   - `GET /api/v1/tracking/truck/{truck_id}/current` - Current truck location
   - `GET /api/v1/tracking/truck/{truck_id}/history` - Truck location history
   - `GET /api/v1/tracking/booking/{booking_id}/position` - Booking position

3. **Optional Endpoints** (Graceful fallback):
   - `GET /api/v1/tracking/stats` - Tracking statistics
   - `WS /ws/tracking/{truck_id}` - Real-time updates

### Current Status

✅ **Fully Working**:
- Location submission (POST)
- Location updates (PUT)
- Current truck location (GET)
- Truck location history (GET)
- Booking position tracking (GET)
- GPS integration
- Google Maps visualization
- Form validation
- Error handling

⚠️ **Limited Functionality**:
- Real-time tracking (WebSocket not available)
- Tracking statistics (endpoint not implemented)

### Development Notes

The application is designed to work with partial API implementation:
- Core location submission works with existing endpoints
- Missing endpoints are handled gracefully
- User is informed about feature availability
- No crashes or errors when endpoints are missing
