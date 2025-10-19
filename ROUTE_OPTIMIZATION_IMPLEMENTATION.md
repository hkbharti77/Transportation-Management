# Route Optimization Implementation

This document describes the implementation of route optimization features in the Transportation Management System.

## Overview

The route optimization system provides functionality to:
- Optimize routes based on traffic, weather, and fuel prices
- Track traffic conditions for specific routes
- Monitor weather conditions affecting routes (including wind speed)
- Track fuel prices along routes
- Maintain optimization history

## API Endpoints

### Route Optimization Service

All endpoints are prefixed with `/api/v1/route-optimization`

#### Route Optimization
- `POST /optimize` - Optimize a route based on specified factors (fully automatic)

#### Traffic Data
- `GET /routes/{route_id}/traffic` - Get traffic data for a route
- `POST /routes/{route_id}/traffic` - Add traffic data for a route (admin only)

#### Weather Data
- `GET /routes/{route_id}/weather` - Get weather data for a route
- `POST /routes/{route_id}/weather` - Add weather data for a route (admin only - automatic collection during optimization)

#### Fuel Prices
- `GET /routes/{route_id}/fuel-prices` - Get fuel prices for a route
- `POST /routes/{route_id}/fuel-prices` - Add fuel price for a route

#### Optimization History
- `GET /routes/{route_id}/optimizations` - Get optimization history for a route
- `POST /routes/{route_id}/optimizations` - Add optimization record for a route

## Implementation Details

### Services

The implementation includes a new service file:
- `src/services/routeOptimizationService.ts` - Handles all API communication for route optimization features

### Components

Several new UI components were created:
- `RouteOptimizationCard.tsx` - Displays route optimization results
- `FuelPriceCard.tsx` - Displays fuel price information
- `OptimizationHistoryCard.tsx` - Shows optimization history
- `TrafficDataForm.tsx` - Form for adding traffic data
- `WeatherDataForm.tsx` - Form for adding weather data (enhanced with wind speed and other fields)
- `FuelPriceForm.tsx` - Form for adding fuel price data

### Pages

New pages were added:
- `src/app/admin/performance/diagnostics/page.tsx` - Updated to include route optimization features
- `src/app/admin/performance/test-optimization/page.tsx` - Test page for all optimization endpoints

## Key Features

### Automatic Weather Detection
Weather data including wind speed is automatically detected and collected during route optimization without manual input:
- Temperature
- Feels like temperature
- Pressure
- Humidity
- Precipitation
- Wind speed
- Wind direction
- Wind gust
- Visibility
- Weather condition
- Weather description
- Cloud coverage

### Fully Automatic Optimization
The route optimization process requires no manual input from the frontend:
- Traffic data is automatically fetched
- Weather data including wind speed is automatically fetched
- Fuel price data is automatically fetched
- Optimization happens seamlessly in the background

## Usage

### Route Optimization Process

1. Select a route from the available routes
2. Click "Optimize" to run the fully automatic optimization algorithm
3. View results including time, distance, and cost savings
4. Check current traffic and enhanced weather conditions (including wind data)
5. Review fuel prices along the route
6. Access optimization history for trend analysis

### Adding Data (Admin Only)

Administrators can manually add data for testing purposes:
- Traffic data using the "Add Traffic Data" form
- Weather data using the "Add Weather Data" form (includes all weather fields)
- Fuel prices using the "Add Fuel Price" form

## Data Models

### Route Optimization Response
```json
{
  "route_id": 1,
  "original_time": 45,
  "optimized_time": 45,
  "time_saved": 0,
  "original_distance": 25.5,
  "optimized_distance": 25.5,
  "distance_saved": 0,
  "original_cost": 15,
  "optimized_cost": 15,
  "cost_saved": 0,
  "alternative_routes": [],
  "factors_used": ["traffic", "weather", "fuel"],
  "confidence_score": 0.85,
  "recommendations": []
}
```

### Enhanced Weather Data
```json
{
  "route_id": 1,
  "temperature": 28.5,
  "feels_like": 32.1,
  "pressure": 1013.25,
  "humidity": 65,
  "precipitation": 2.3,
  "wind_speed": 3.5,
  "wind_deg": 180,
  "wind_gust": 5.2,
  "visibility": 10000,
  "weather_condition": "Light rain",
  "weather_description": "Light rain with scattered clouds",
  "clouds": 40,
  "raw_data": {
    "source": "OpenWeatherMap API",
    "timestamp": "2025-10-12T09:50:00Z"
  },
  "id": 3,
  "timestamp": "2025-10-12T16:01:08.794429+05:30"
}
```

### Traffic Data
```json
{
  "route_id": 1,
  "congestion_level": 3,
  "average_speed": 42,
  "travel_time": 35,
  "road_conditions": "Moderate traffic, occasional slowdowns",
  "raw_data": {
    "source": "Google Maps API",
    "timestamp": "2025-10-12T09:45:00Z"
  },
  "id": 5,
  "timestamp": "2025-10-12T16:00:06.574243+05:30"
}
```

### Fuel Price
```json
{
  "route_id": 1,
  "fuel_type": "Diesel",
  "price_per_liter": 92.4,
  "location": "Patna, Bihar",
  "raw_data": {
    "source": "FuelAPI.in",
    "timestamp": "2025-10-12T09:55:00Z"
  },
  "id": 3,
  "timestamp": "2025-10-12T16:02:00.870429+05:30"
}
```

## Testing

The implementation includes a comprehensive test page at `/admin/performance/test-optimization` that allows users to:
- Test all route optimization endpoints
- View detailed results of API calls
- Verify data integrity
- Debug integration issues

## Future Enhancements

Potential future enhancements include:
- Real-time traffic data integration
- Predictive weather modeling
- Dynamic fuel price tracking
- Advanced route recommendation algorithms
- Integration with mapping services for visualization