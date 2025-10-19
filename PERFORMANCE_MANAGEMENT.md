# Performance Management System

This document describes the implementation of the Performance Management system for the Transportation Management application.

## Overview

The Performance Management system tracks and analyzes driver performance metrics, behavior events, vehicle diagnostics, and maintenance alerts to improve safety, efficiency, and service quality.

## Features Implemented

### 1. Driver Performance Tracking
- Safety scores
- Punctuality metrics
- Fuel efficiency tracking
- Overall performance scoring
- Detailed driving behavior statistics

### 2. Driver Scorecard
- Comprehensive performance overview
- Visual score indicators
- Driving statistics and metrics
- Behavior event tracking

### 3. Behavior Event Monitoring
- Harsh braking detection
- Speeding events
- Phone usage tracking
- Hard acceleration/turn detection
- Idling time monitoring

### 4. Vehicle Diagnostics
- Engine health monitoring with visual indicators
- Tire pressure tracking for all four tires
- Fluid level monitoring (oil, coolant, brake fluid, transmission fluid)
- Battery voltage monitoring with status indicators
- Diagnostic trouble codes display
- Color-coded status indicators for quick assessment

### 5. Maintenance Alerts
- Severity-based alert system (low, medium, high, critical)
- Recommended actions for maintenance issues
- Alert resolution tracking
- Vehicle-specific maintenance notifications

### 6. Analytics Dashboard
- Performance scorecards
- Behavior event timelines
- Driver comparison metrics
- Trend analysis
- Maintenance alert summaries

## API Endpoints

### Driver Performance
- `POST /api/v1/performance/driver-performance/` - Create driver performance record
- `GET /api/v1/performance/driver-performance/{id}` - Get driver performance by ID
- `GET /api/v1/performance/driver/{driver_id}/performances` - Get all performances for a driver

### Driver Scorecard
- `GET /api/v1/performance/driver/{driver_id}/scorecard` - Get driver scorecard

### Behavior Events
- `POST /api/v1/performance/behavior-event/` - Create behavior event
- `GET /api/v1/performance/behavior-event/{id}` - Get behavior event by ID
- `GET /api/v1/performance/driver/{driver_id}/behavior-events` - Get all behavior events for a driver
- `GET /api/v1/performance/driver/{driver_id}/unresolved-behavior-events` - Get unresolved behavior events for a driver

### Vehicle Diagnostics
- `POST /api/v1/performance/vehicle-diagnostics/` - Create vehicle diagnostics record
- `GET /api/v1/performance/vehicle/{vehicle_id}/diagnostics` - Get vehicle diagnostics by vehicle ID
- `PUT /api/v1/performance/vehicle-diagnostics/{id}` - Update vehicle diagnostics
- `DELETE /api/v1/performance/vehicle-diagnostics/{id}` - Delete vehicle diagnostics

### Maintenance Alerts
- `POST /api/v1/performance/maintenance-alert/` - Create maintenance alert
- `GET /api/v1/performance/maintenance-alert/{id}` - Get maintenance alert by ID
- `GET /api/v1/performance/vehicle/{vehicle_id}/maintenance-alerts` - Get all maintenance alerts for a vehicle
- `GET /api/v1/performance/vehicle/{vehicle_id}/unresolved-maintenance-alerts` - Get unresolved maintenance alerts for a vehicle
- `PUT /api/v1/performance/maintenance-alert/{id}` - Update maintenance alert (mark as resolved)
- `DELETE /api/v1/performance/maintenance-alert/{id}` - Delete maintenance alert

## Frontend Components

### Services
- `performanceService.ts` - API service for performance management

### Pages
- `/admin/performance` - Main performance management page
- `/admin/performance/dashboard` - Performance analytics dashboard
- `/admin/performance/scorecard` - Driver scorecard details
- `/admin/performance/events` - Behavior events and maintenance alerts management
- `/admin/performance/unresolved-events` - Unresolved behavior events monitoring
- `/admin/performance/diagnostics` - Vehicle diagnostics management
- `/admin/performance/maintenance` - Maintenance alerts management
- `/admin/performance/test` - API endpoint testing

### Components
- `DriverPerformanceForm` - Form for adding performance records
- `BehaviorEventForm` - Form for adding behavior events
- `VehicleDiagnosticsForm` - Form for adding vehicle diagnostics
- `MaintenanceAlertForm` - Form for adding maintenance alerts
- `DriverScorecardComponent` - Component for displaying driver scorecard
- `VehicleDiagnosticsCard` - Component for displaying vehicle diagnostics

## Data Models

### Driver Performance
```typescript
interface DriverPerformance {
  id?: number;
  driver_id: number;
  trip_id: number;
  safety_score: number;
  punctuality_score: number;
  fuel_efficiency_score: number;
  overall_score: number;
  total_distance: number;
  total_time: number;
  average_speed: number;
  harsh_braking_count: number;
  speeding_count: number;
  phone_usage_count: number;
  hard_acceleration_count: number;
  hard_turn_count: number;
  idling_time: number;
  created_at?: string;
  updated_at?: string;
}
```

### Driver Scorecard
```typescript
interface DriverScorecard {
  driver_id: number;
  safety_score: number;
  punctuality_score: number;
  fuel_efficiency_score: number;
  overall_score: number;
  total_trips: number;
  total_distance: number;
  total_time: number;
  average_speed: number;
  harsh_braking_count: number;
  speeding_count: number;
  phone_usage_count: number;
  hard_acceleration_count: number;
  hard_turn_count: number;
  idling_time: number;
  created_at?: string;
  updated_at?: string;
}
```

### Behavior Event
```typescript
interface BehaviorEvent {
  id?: number;
  driver_id: number;
  trip_id: number;
  event_type: string;
  latitude: number;
  longitude: number;
  speed: number;
  additional_data?: string;
  resolved: boolean;
  timestamp?: string;
  created_at?: string;
  resolved_at?: string | null;
}
```

### Vehicle Diagnostics
```typescript
interface VehicleDiagnostics {
  id?: number;
  vehicle_id: number;
  engine_health: number;
  tire_pressure_front_left: number;
  tire_pressure_front_right: number;
  tire_pressure_rear_left: number;
  tire_pressure_rear_right: number;
  oil_level: number;
  coolant_level: number;
  brake_fluid_level: number;
  transmission_fluid_level: number;
  battery_voltage: number;
  diagnostic_trouble_codes: string;
  last_updated?: string;
  created_at?: string;
}
```

### Maintenance Alert
```typescript
interface MaintenanceAlert {
  id?: number;
  vehicle_id: number;
  alert_title: string;
  alert_description: string;
  severity: "low" | "medium" | "high" | "critical";
  recommended_action: string;
  resolved: boolean;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
}
```

## Implementation Details

### Performance Service
Located at `src/services/performanceService.ts`, this service handles all API communications for performance management.

### UI Components
- Dashboard with performance metrics visualization
- Behavior events and maintenance alerts management table
- Vehicle diagnostics monitoring with visual indicators
- Maintenance alert tracking
- Driver scorecard display
- Forms for data entry
- Responsive design for all device sizes

### Security
- All API calls use Bearer token authentication
- Proper error handling and user feedback
- Role-based access control (admin only)

## Usage

1. Navigate to Performance Management in the admin sidebar
2. View dashboard for overall performance metrics
3. Check driver scorecard for detailed performance overview
4. Manage behavior events and maintenance alerts in the events section
5. Monitor unresolved behavior events in the unresolved events section
6. Monitor vehicle diagnostics in the diagnostics section
7. Manage maintenance alerts in the maintenance section
8. Use the API test page to verify endpoint functionality

## Future Enhancements
- Integration with real-time tracking data
- Automated performance alerts
- Driver ranking systems
- Performance improvement recommendations
- Export functionality for reports
- Predictive maintenance based on diagnostics data
- Integration with fleet management systems