import { NextResponse } from 'next/server';

// Define types
interface ETARequest {
  source_lat: number;
  source_lng: number;
  dest_lat: number;
  dest_lng: number;
  transport_mode: 'driving' | 'walking' | 'cycling' | 'transit';
}

interface RouteSummary {
  distance_km: number;
  duration_minutes: number;
  transport_mode: string;
  avg_speed_kmh: number;
}

interface ETAResponse {
  distance_km: number;
  duration_minutes: number;
  eta: string;
  route_summary: RouteSummary;
}

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to calculate duration based on transport mode
function calculateDuration(distance: number, mode: string): number {
  // Average speeds in km/h
  const speeds: Record<string, number> = {
    'driving': 60,
    'walking': 5,
    'cycling': 15,
    'transit': 30
  };
  
  const speed = speeds[mode] || speeds['driving'];
  return (distance / speed) * 60; // Convert to minutes
}

// Helper function to calculate ETA
function calculateETA(durationMinutes: number): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + durationMinutes);
  return now.toISOString();
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: ETARequest = await request.json();
    
    // Validate coordinates
    if (body.source_lat < -90 || body.source_lat > 90) {
      return NextResponse.json(
        { detail: 'Source latitude must be between -90 and 90' },
        { status: 422 }
      );
    }
    
    if (body.source_lng < -180 || body.source_lng > 180) {
      return NextResponse.json(
        { detail: 'Source longitude must be between -180 and 180' },
        { status: 422 }
      );
    }
    
    if (body.dest_lat < -90 || body.dest_lat > 90) {
      return NextResponse.json(
        { detail: 'Destination latitude must be between -90 and 90' },
        { status: 422 }
      );
    }
    
    if (body.dest_lng < -180 || body.dest_lng > 180) {
      return NextResponse.json(
        { detail: 'Destination longitude must be between -180 and 180' },
        { status: 422 }
      );
    }
    
    // Calculate distance
    const distance = calculateDistance(
      body.source_lat,
      body.source_lng,
      body.dest_lat,
      body.dest_lng
    );
    
    // Calculate duration based on transport mode
    const duration = calculateDuration(distance, body.transport_mode);
    
    // Calculate ETA
    const eta = calculateETA(duration);
    
    // Calculate average speed
    const avgSpeed = distance / (duration / 60); // Convert minutes to hours
    
    // Prepare response
    const response: ETAResponse = {
      distance_km: parseFloat(distance.toFixed(2)),
      duration_minutes: Math.round(duration),
      eta: eta,
      route_summary: {
        distance_km: parseFloat(distance.toFixed(2)),
        duration_minutes: Math.round(duration),
        transport_mode: body.transport_mode,
        avg_speed_kmh: parseFloat(avgSpeed.toFixed(1))
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating ETA:', error);
    
    // Handle validation errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { detail: 'Invalid JSON format in request body' },
        { status: 422 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}