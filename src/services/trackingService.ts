// Location Tracking API Service
// This file contains all API calls for location tracking functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  location_type?: 'gps' | 'network' | 'passive';
  truck_id: number;
  timestamp?: string;
}

export interface LocationRecord {
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

export interface LocationHistoryResponse {
  data: LocationRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface TrackingStats {
  total_locations: number;
  active_trucks: number;
  last_update: string;
  average_speed: number;
}

export interface ETARequest {
  source_lat: number;
  source_lng: number;
  dest_lat: number;
  dest_lng: number;
  transport_mode: 'driving' | 'walking' | 'cycling' | 'transit';
}

export interface RouteSummary {
  distance_km: number;
  duration_minutes: number;
  transport_mode: string;
  avg_speed_kmh: number;
}

export interface ETAResponse {
  distance_km: number;
  duration_minutes: number;
  eta: string;
  route_summary: RouteSummary;
}

// Geofence interfaces
export interface Geofence {
  geofence_id?: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
  is_active: boolean;
  created_at?: string;
  updated_at?: string | null;
}

export interface CreateGeofenceRequest {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  is_active: boolean;
}

export interface UpdateGeofenceRequest extends Partial<CreateGeofenceRequest> {
  is_active?: boolean;
}

class TrackingService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Submit location data
  async submitLocation(locationData: LocationData): Promise<LocationRecord> {
    const response = await fetch(`${API_BASE_URL}/tracking/location`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(locationData),
    });

    return this.handleResponse<LocationRecord>(response);
  }

  // Update existing location data
  async updateLocation(
    locationId: number, 
    locationData: Omit<LocationData, 'truck_id' | 'timestamp'>
  ): Promise<LocationRecord> {
    const response = await fetch(`${API_BASE_URL}/tracking/location/${locationId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(locationData),
    });

    return this.handleResponse<LocationRecord>(response);
  }

  // Get location history for a specific truck
  async getLocationHistory(
    truckId: number
  ): Promise<LocationHistoryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/truck/${truckId}/history`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 404 || response.status === 405) {
        // Return empty history if endpoint doesn't exist
        return {
          data: [],
          total: 0,
          page: 1,
          limit: 100
        };
      }

      const truckHistory = await this.handleResponse<{
        truck_id: number;
        truck_name: string;
        locations: LocationRecord[];
        total_locations: number;
        tracking_period: {
          start: string;
          end: string;
        };
      }>(response);

      // Transform the response to match our expected format
      return {
        data: truckHistory.locations,
        total: truckHistory.total_locations,
        page: 1,
        limit: truckHistory.locations.length
      };
    } catch (error) {
      console.warn('Location history endpoint not available, returning empty data', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 100
      };
    }
  }

  // Get current location of a truck
  async getCurrentLocation(truckId: number): Promise<LocationRecord | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/truck/${truckId}/current`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 404) {
        return null; // No location data found
      }

      return this.handleResponse<LocationRecord>(response);
    } catch (error) {
      console.error('Error fetching current location:', error);
      return null;
    }
  }

  // Get specific location record by ID
  async getLocationById(locationId: number): Promise<LocationRecord | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/location/${locationId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 404) {
        return null; // Location not found
      }

      return this.handleResponse<LocationRecord>(response);
    } catch (error) {
      console.error('Error fetching location by ID:', error);
      return null;
    }
  }

  // Get booking position
  async getBookingPosition(bookingId: number): Promise<LocationRecord | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/booking/${bookingId}/position`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 404) {
        return null; // No position data found for this booking
      }

      return this.handleResponse<LocationRecord>(response);
    } catch (error) {
      console.error('Error fetching booking position:', error);
      return null;
    }
  }

  // Get tracking statistics
  async getTrackingStats(): Promise<TrackingStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 404) {
        // Return mock stats if endpoint doesn't exist
        return {
          total_locations: 0,
          active_trucks: 0,
          last_update: new Date().toISOString(),
          average_speed: 0
        };
      }

      return this.handleResponse<TrackingStats>(response);
    } catch (error) {
      console.warn('Tracking stats endpoint not available, returning mock data', error);
      return {
        total_locations: 0,
        active_trucks: 0,
        last_update: new Date().toISOString(),
        average_speed: 0
      };
    }
  }

  // Get real-time location updates (WebSocket connection)
  connectToLocationUpdates(
    truckId: number, 
    onLocationUpdate: (location: LocationRecord) => void,
    onError?: (error: Error) => void
  ): WebSocket | null {
    try {
      const token = localStorage.getItem('access_token');
      const wsUrl = `ws://localhost:8000/ws/tracking/${truckId}?token=${token}`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        try {
          const locationData = JSON.parse(event.data);
          onLocationUpdate(locationData);
        } catch (error) {
          console.error('Error parsing location update:', error);
          onError?.(error as Error);
        }
      };
      
      ws.onerror = (error) => {
        console.warn('WebSocket connection failed, real-time updates not available', error);
        onError?.(new Error('WebSocket connection failed. Real-time updates not available.'));
      };
      
      ws.onclose = (event) => {
        if (event.code !== 1000) {
          console.warn('WebSocket connection closed unexpectedly');
        } else {
          console.log('WebSocket connection closed');
        }
      };
      
      return ws;
    } catch (error) {
      console.warn('WebSocket not available, real-time updates disabled', error);
      onError?.(new Error('WebSocket not available. Real-time updates disabled.'));
      return null;
    }
  }

  // Format location data for display
  formatLocationData(location: LocationRecord): {
    coordinates: string;
    speed: string;
    heading: string;
    accuracy: string;
    timestamp: string;
  } {
    return {
      coordinates: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      speed: `${location.speed} km/h`,
      heading: `${location.heading}°`,
      accuracy: `±${location.accuracy}m`,
      timestamp: new Date(location.timestamp).toLocaleString()
    };
  }

  // Calculate ETA based on source and destination coordinates
  async calculateETA(request: ETARequest): Promise<ETAResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/eta`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return this.handleResponse<ETAResponse>(response);
    } catch (error) {
      console.error('Error calculating ETA:', error);
      throw error;
    }
  }

  // Geofence methods
  // Get all geofences
  async getGeofences(): Promise<Geofence[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/geofences`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'accept': 'application/json',
        },
      });

      return this.handleResponse<Geofence[]>(response);
    } catch (error) {
      console.error('Error fetching geofences:', error);
      throw error;
    }
  }

  // Create a new geofence
  async createGeofence(geofenceData: CreateGeofenceRequest): Promise<Geofence> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/geofences`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geofenceData),
      });

      return this.handleResponse<Geofence>(response);
    } catch (error) {
      console.error('Error creating geofence:', error);
      throw error;
    }
  }

  // Update an existing geofence
  async updateGeofence(geofenceId: number, geofenceData: UpdateGeofenceRequest): Promise<Geofence> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/geofences/${geofenceId}`, {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geofenceData),
      });

      return this.handleResponse<Geofence>(response);
    } catch (error) {
      console.error(`Error updating geofence ${geofenceId}:`, error);
      throw error;
    }
  }

  // Delete a geofence
  async deleteGeofence(geofenceId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/geofences/${geofenceId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // For 204 No Content response, we don't need to parse JSON
      if (response.status !== 204) {
        await response.json();
      }
    } catch (error) {
      console.error(`Error deleting geofence ${geofenceId}:`, error);
      throw error;
    }
  }

  // Get a specific geofence by ID
  async getGeofenceById(geofenceId: number): Promise<Geofence | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/geofences/${geofenceId}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'accept': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      return this.handleResponse<Geofence>(response);
    } catch (error) {
      console.error(`Error fetching geofence ${geofenceId}:`, error);
      throw error;
    }
  }

  // Get current browser location
  getCurrentBrowserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  // Calculate distance between two coordinates (in kilometers)
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

}

export const trackingService = new TrackingService();
