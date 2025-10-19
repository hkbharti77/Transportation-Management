import { NextResponse } from 'next/server';

// Define types for the dashboard data
interface LocationRecord {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  location_type: string;
  location_id: number;
  truck_id: number;
  timestamp: string;
  created_at: string;
}

interface Geofence {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  is_active: boolean;
  geofence_id: number;
  created_at: string;
  updated_at: string | null;
}

interface GeofenceAlert {
  event_type: string;
  timestamp: string;
  event_id: number;
  geofence_id: number;
  truck_id: number;
  location_id: number;
  geofence: Geofence;
  location: LocationRecord;
}

interface DashboardData {
  total_trucks: number;
  online_trucks: number;
  active_trips: number;
  total_distance_today: number;
  average_speed: number;
  recent_locations: LocationRecord[];
  geofence_alerts: GeofenceAlert[];
}

// Mock data based on the curl response
const mockDashboardData: DashboardData = {
  total_trucks: 7,
  online_trucks: 2,
  active_trips: 0,
  total_distance_today: 2300.210047974557,
  average_speed: 25.875,
  recent_locations: [
    {
      latitude: 28.6139,
      longitude: 77.209,
      altitude: 215,
      speed: 54,
      heading: 92,
      accuracy: 5,
      location_type: "gps",
      location_id: 33,
      truck_id: 7,
      timestamp: "2025-09-14T12:12:17.638000+05:30",
      created_at: "2025-09-14T08:21:30.159764+05:30"
    },
    {
      latitude: 28.6139,
      longitude: 77.209,
      altitude: 215,
      speed: 54,
      heading: 92,
      accuracy: 5,
      location_type: "gps",
      location_id: 1,
      truck_id: 1,
      timestamp: "2025-09-14T12:12:17.638000+05:30",
      created_at: "2025-09-14T06:55:28.664504+05:30"
    },
    {
      latitude: 28.6139,
      longitude: 77.209,
      altitude: 215,
      speed: 54,
      heading: 92,
      accuracy: 5,
      location_type: "gps",
      location_id: 34,
      truck_id: 1,
      timestamp: "2025-09-14T12:12:17.638000+05:30",
      created_at: "2025-09-14T08:25:24.939923+05:30"
    },
    {
      latitude: 19.076,
      longitude: 72.8777,
      altitude: 14,
      speed: 45,
      heading: 120,
      accuracy: 4,
      location_type: "gps",
      location_id: 2,
      truck_id: 1,
      timestamp: "2025-09-14T12:12:17.638000+05:30",
      created_at: "2025-09-14T06:59:40.891019+05:30"
    },
    {
      latitude: 28.59883041533226,
      longitude: 77.34879183333713,
      altitude: 0,
      speed: 0,
      heading: 0,
      accuracy: 112,
      location_type: "gps",
      location_id: 6,
      truck_id: 1,
      timestamp: "2025-09-14T07:18:38.889000+05:30",
      created_at: "2025-09-14T07:18:39.232979+05:30"
    },
    {
      latitude: 28.598874936446933,
      longitude: 77.34870964889285,
      altitude: 0,
      speed: 0,
      heading: 0,
      accuracy: 117,
      location_type: "gps",
      location_id: 5,
      truck_id: 1,
      timestamp: "2025-09-14T07:15:01.147000+05:30",
      created_at: "2025-09-14T07:15:01.157827+05:30"
    },
    {
      latitude: 28.598890051243874,
      longitude: 77.34891493097207,
      altitude: 0,
      speed: 0,
      heading: 0,
      accuracy: 112,
      location_type: "gps",
      location_id: 4,
      truck_id: 1,
      timestamp: "2025-09-14T07:11:03.607000+05:30",
      created_at: "2025-09-14T07:11:03.929107+05:30"
    },
    {
      latitude: 28.598890051243874,
      longitude: 77.34891493097207,
      altitude: 0,
      speed: 0,
      heading: 0,
      accuracy: 112,
      location_type: "gps",
      location_id: 3,
      truck_id: 1,
      timestamp: "2025-09-14T07:10:48.253000+05:30",
      created_at: "2025-09-14T07:10:48.603368+05:30"
    },
    {
      latitude: 40.695105,
      longitude: -74.007144,
      altitude: 30.29,
      speed: 37.76,
      heading: 16.52,
      accuracy: 8.44,
      location_type: "gps",
      location_id: 32,
      truck_id: 1,
      timestamp: "2025-09-14T02:48:00.671107+05:30",
      created_at: "2025-09-14T08:18:00.670204+05:30"
    },
    {
      latitude: 40.707731,
      longitude: -73.992162,
      altitude: 1.85,
      speed: 62.94,
      heading: 118.44,
      accuracy: 7.45,
      location_type: "gps",
      location_id: 31,
      truck_id: 1,
      timestamp: "2025-09-14T02:47:58.644278+05:30",
      created_at: "2025-09-14T08:17:58.643161+05:30"
    }
  ],
  geofence_alerts: []
};

export async function GET() {
  try {
    // In a real implementation, you would fetch this data from your database
    // For now, we're returning mock data that matches the curl response
    
    // Add a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(mockDashboardData);
  } catch (error) {
    console.error('Error fetching tracking dashboard data:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}