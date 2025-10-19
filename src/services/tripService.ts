// Trip Management API Service
// This file contains all API calls for trip management functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface Trip {
  id?: number;
  route_id: number;
  vehicle_id: number;
  driver_id: number;
  departure_time: string; // ISO datetime string
  arrival_time: string; // ISO datetime string
  fare: number;
  available_seats: number;
  total_seats: number;
  actual_departure_time?: string | null;
  actual_arrival_time?: string | null;
  status?: "scheduled" | "in_progress" | "completed" | "cancelled";
  created_at?: string;
  updated_at?: string | null;
}

export interface Booking {
  id?: number;
  trip_id: number;
  user_id: number;
  seat_number: string;
  status: "confirmed" | "cancelled" | "pending";
  booking_time: string;
}

export interface CreateBookingRequest {
  trip_id: number;
  seat_number: string;
}

export interface CreateTripRequest {
  route_id: number;
  vehicle_id: number;
  driver_id: number;
  departure_time: string;
  arrival_time: string;
  fare: number;
  available_seats: number;
  total_seats: number;
}

export interface UpdateTripRequest extends Partial<CreateTripRequest> {
  actual_departure_time?: string | null;
  actual_arrival_time?: string | null;
  status?: "scheduled" | "in_progress" | "completed" | "cancelled";
}

export interface TripFilterOptions {
  status?: string;
  vehicle_id?: number;
  driver_id?: number;
  route_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

// Removed unused ApiResponse interface

// Add the new interface for trip resources
interface TripResources {
  vehicles: {
    id: number;
    truck_number: string;
    capacity: number;
    status: string;
  }[];
  drivers: {
    id: number;
    name: string;
    license_number: string;
    status: string;
  }[];
  routes: {
    id: number;
    route_number: string;
    start_point: string;
    end_point: string;
  }[];
}

class TripService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
        window.location.href = '/signin';
        throw new Error('Authentication failed. Please log in again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Get trip resources (vehicles, drivers, routes) for trip creation
  async getTripResources(): Promise<TripResources> {
    const response = await fetch(`${API_BASE_URL}/trips/resources`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<TripResources>(response);
  }

  // Create a new trip
  async createTrip(tripData: CreateTripRequest): Promise<Trip> {
    const response = await fetch(`${API_BASE_URL}/trips/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tripData),
    });

    return this.handleResponse<Trip>(response);
  }

  // Get all trips with pagination and filters
  async getTrips(filters: TripFilterOptions = {}): Promise<Trip[]> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.vehicle_id) params.append('vehicle_id', filters.vehicle_id.toString());
    if (filters.driver_id) params.append('driver_id', filters.driver_id.toString());
    if (filters.route_id) params.append('route_id', filters.route_id.toString());
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.search) params.append('search', filters.search);
    
    // Add pagination parameters
    if (filters.page && filters.page > 0) {
      const skip = (filters.page - 1) * (filters.limit || 10);
      params.append('skip', skip.toString());
    }
    
    // Add limit with validation (max 100 as per API)
    if (filters.limit) {
      const limit = Math.min(Math.max(filters.limit, 1), 100);
      params.append('limit', limit.toString());
    } else {
      params.append('limit', '10');
    }

    const response = await fetch(`${API_BASE_URL}/trips/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Trip[]>(response);
  }

  // Get all trips with pagination info - returns PaginatedResponse
  async getAllTrips(filters: TripFilterOptions = {}): Promise<PaginatedResponse<Trip>> {
    const trips = await this.getTrips(filters);
    
    // Return in PaginatedResponse format
    return {
      data: trips,
      total: trips.length,
      page: filters.page || 1,
      limit: filters.limit || 10,
      total_pages: Math.ceil(trips.length / (filters.limit || 10))
    };
  }

  // Get single trip by ID
  async getTripById(tripId: number): Promise<Trip> {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Trip>(response);
  }

  // Update trip
  async updateTrip(tripId: number, tripData: UpdateTripRequest): Promise<Trip> {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tripData),
    });

    return this.handleResponse<Trip>(response);
  }

  // Delete trip
  async deleteTrip(tripId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  }

  // Update trip status
  async updateTripStatus(tripId: number, status: string): Promise<Trip> {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/status?status_update=${status}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Trip>(response);
  }

  // Get trips count for pagination
  async getTripsCount(filters: Omit<TripFilterOptions, 'page' | 'limit'> = {}): Promise<number> {
    try {
      const trips = await this.getTrips({ ...filters, limit: 100 });
      return trips.length;
    } catch (error) {
      console.error('Error getting trips count:', error);
      return 0;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Check if current user is admin
  isCurrentUserAdmin(): boolean {
    const currentUserStr = localStorage.getItem('current_user');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        return currentUser.role === 'admin';
      } catch (error) {
        console.error('Error parsing current user:', error);
        return false;
      }
    }
    return false;
  }

  // Book a seat on a trip
  async bookTrip(tripId: number, seatNumber: string): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/book`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        trip_id: tripId,
        seat_number: seatNumber
      }),
    });

    return this.handleResponse<Booking>(response);
  }

  // Get user's bookings (if API supports it)
  async getUserBookings(userId?: number): Promise<Booking[]> {
    const endpoint = userId ? `/bookings/user/${userId}` : '/bookings/me';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Booking[]>(response);
  }

  // Cancel a booking (if API supports it)
  async cancelBooking(bookingId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Get all bookings for a specific trip (Admin only)
  async getTripBookings(tripId: number): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/bookings`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Booking[]>(response);
  }
}

// Export singleton instance
export const tripService = new TripService();