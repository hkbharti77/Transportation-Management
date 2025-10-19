# Unresolved Behavior Events

This module displays all unresolved behavior events for drivers. These are events that have been detected but not yet addressed or resolved by administrators.

## Features

- View all unresolved behavior events
- See detailed information about each event
- Mark events as resolved directly from the interface
- Filter and sort events by various criteria

## API Endpoints Used

- `GET /api/v1/performance/driver/{driver_id}/unresolved-behavior-events` - Fetch all unresolved behavior events for a specific driver

## How to Use

1. Navigate to Performance Management > Unresolved Events in the sidebar
2. View the list of unresolved behavior events
3. Click on any event to see detailed information
4. Use the "Mark as Resolved" button to resolve an event

## Event Details

Each behavior event includes:
- Driver information
- Event type (e.g., harsh braking, speeding)
- Location coordinates
- Vehicle speed at time of event
- Timestamp
- Additional data about the event