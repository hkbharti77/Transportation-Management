// Fleet Management API Service
// This file contains all API calls for fleet management functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Truck {
  id?: number;
  fleet_id: number;
  truck_number: string;
  number_plate: string;
  truck_type: "small_truck" | "medium_truck" | "large_truck" | "container_truck";
  capacity_kg: number;
  length_m: number;
  width_m: number;
  height_m: number;
  fuel_type: "Diesel" | "Petrol" | "Electric" | "Hybrid";
  fuel_capacity_l: number;
  year_of_manufacture: number;
  manufacturer: string;
  model: string;
  assigned_driver_id?: number | null;
  status?: "available" | "in_use" | "maintenance" | "out_of_service";
  mileage_km?: number;
  current_location_lat?: number | null;
  current_location_lng?: number | null;
  last_location_update?: string | null;
  insurance_expiry?: string | null;
  permit_expiry?: string | null;
  fitness_expiry?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string | null;
}

export interface CreateTruckRequest {
  fleet_id: number;
  truck_number: string;
  number_plate: string;
  truck_type: "small_truck" | "medium_truck" | "large_truck" | "container_truck";
  capacity_kg: number;
  length_m: number;
  width_m: number;
  height_m: number;
  fuel_type: "Diesel" | "Petrol" | "Electric" | "Hybrid";
  fuel_capacity_l: number;
  year_of_manufacture: number;
  manufacturer: string;
  model: string;
}

export interface UpdateTruckRequest extends Partial<CreateTruckRequest> {
  assigned_driver_id?: number | null;
  status?: "available" | "in_use" | "maintenance" | "out_of_service";
  mileage_km?: number;
  current_location_lat?: number | null;
  current_location_lng?: number | null;
  insurance_expiry?: string | null;
  permit_expiry?: string | null;
  fitness_expiry?: string | null;
  is_active?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

export interface TruckFilterOptions {
  fleet_id?: number;
  truck_type?: string;
  status?: string;
  fuel_type?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Fleet {
  id?: number;
  name: string;
  description: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string | null;
  trucks?: Truck[];
}

export interface CreateFleetRequest {
  name: string;
  description: string;
}

export interface UpdateFleetRequest extends Partial<CreateFleetRequest> {
  is_active?: boolean;
}

export interface FleetFilterOptions {
  skip?: number;
  limit?: number;
  is_active?: boolean;
}

// Fleet summary interface
export interface FleetSummary {
  total_trucks: number;
  available_trucks: number;
  busy_trucks: number;
  maintenance_trucks: number;
  total_drivers: number;
  available_drivers: number;
  on_trip_drivers: number;
}

// Truck location record returned by the API
export interface TruckLocationRecord {
  truck_id: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed_kmh?: number;
  heading_degrees?: number;
  accuracy_meters?: number;
  source?: string;
  id: number;
  timestamp: string;
}

class FleetService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in again.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Clear invalid token and redirect to login
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

  // Get all trucks with pagination and filters (Admin only)
  async getTrucks(filters: TruckFilterOptions = {}): Promise<Truck[]> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.fleet_id) params.append('fleet_id', filters.fleet_id.toString());
    if (filters.truck_type) params.append('truck_type', filters.truck_type);
    if (filters.status) params.append('status', filters.status);
    if (filters.fuel_type) params.append('fuel_type', filters.fuel_type);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
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

    const response = await fetch(`${API_BASE_URL}/fleet/trucks?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<Truck[]>(response);
  }

  // Get trucks with advanced pagination and filtering
  async getTrucksWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: Omit<TruckFilterOptions, 'page' | 'limit'> = {}
  ): Promise<PaginatedResponse<Truck>> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(limit, 1), 100);
    
    const filterOptions: TruckFilterOptions = {
      ...filters,
      page: validPage,
      limit: validLimit
    };
    
    const trucks = await this.getTrucks(filterOptions);
    return { 
      data: trucks, 
      page: validPage, 
      limit: validLimit 
    };
  }

  // Get single truck by ID
  async getTruckById(truckId: number): Promise<Truck> {
    const response = await fetch(`${API_BASE_URL}/fleet/trucks/${truckId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Truck>(response);
  }

  // Create new truck (Admin only)
  async createTruck(truckData: CreateTruckRequest): Promise<Truck> {
    const response = await fetch(`${API_BASE_URL}/fleet/trucks`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(truckData),
    });

    return this.handleResponse<Truck>(response);
  }

  // Update truck
  async updateTruck(truckId: number, truckData: UpdateTruckRequest): Promise<Truck> {
    const response = await fetch(`${API_BASE_URL}/fleet/trucks/${truckId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(truckData),
    });

    return this.handleResponse<Truck>(response);
  }

  // Delete truck
  async deleteTruck(truckId: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/fleet/trucks/${truckId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ApiResponse<null>>(response);
  }

  // Assign driver to truck (Admin only) - using fleet/assign endpoint
  async assignDriverToTruck(driverId: number, truckId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/fleet/assign`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        driver_id: driverId,
        truck_id: truckId
      }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Unassign driver from truck
  async unassignDriverFromTruck(truckId: number): Promise<Truck> {
    const response = await fetch(`${API_BASE_URL}/fleet/trucks/${truckId}/unassign-driver`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Truck>(response);
  }

  // Update truck status
  async updateTruckStatus(truckId: number, status: Truck['status']): Promise<Truck> {
    const response = await fetch(`${API_BASE_URL}/fleet/trucks/${truckId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    return this.handleResponse<Truck>(response);
  }

  // Update truck location with comprehensive GPS data
  async updateTruckLocation(
    truckId: number, 
    locationData: {
      latitude: number;
      longitude: number;
      altitude?: number;
      speed_kmh?: number;
      heading_degrees?: number;
      accuracy_meters?: number;
      source?: string;
    }
  ): Promise<{
    truck_id: number;
    latitude: number;
    longitude: number;
    altitude: number;
    speed_kmh: number;
    heading_degrees: number;
    accuracy_meters: number;
    source: string;
    id: number;
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/fleet/trucks/${truckId}/location`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        truck_id: truckId,
        ...locationData
      }),
    });

    return this.handleResponse<{
      truck_id: number;
      latitude: number;
      longitude: number;
      altitude: number;
      speed_kmh: number;
      heading_degrees: number;
      accuracy_meters: number;
      source: string;
      id: number;
      timestamp: string;
    }>(response);
  }

  // Simple location update (backward compatibility)
  async updateTruckLocationSimple(truckId: number, lat: number, lng: number): Promise<Truck> {
    await this.updateTruckLocation(truckId, {
      latitude: lat,
      longitude: lng,
      source: 'MANUAL'
    });
    
    // Return updated truck data
    return this.getTruckById(truckId);
  }

  // Get truck location history with pagination
  async getTruckLocationHistory(truckId: number, skip: number = 0, limit: number = 100): Promise<TruckLocationRecord[]> {
    const params = new URLSearchParams();
    params.append('skip', Math.max(0, skip).toString());
    params.append('limit', Math.min(Math.max(limit, 1), 100).toString());

    const response = await fetch(`${API_BASE_URL}/fleet/trucks/${truckId}/location?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<TruckLocationRecord[]>(response);
  }

  // Get total count of trucks for pagination
  async getTrucksCount(filters: Omit<TruckFilterOptions, 'page' | 'limit'> = {}): Promise<number> {
    try {
      const trucks = await this.getTrucks({ ...filters, limit: 100 });
      return trucks.length;
    } catch (error) {
      console.error('Error getting trucks count:', error);
      return 0;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Debug method to check authentication status
  debugAuthStatus(): void {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('current_user');
    
    console.log('=== Authentication Debug ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    console.log('User exists:', !!user);
    console.log('User data:', user ? JSON.parse(user) : null);
    console.log('============================');
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

  // Fleet Management Methods
  
  // Get all fleets with pagination and filters
  async getFleets(filters: FleetFilterOptions = {}): Promise<Fleet[]> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    const response = await fetch(`${API_BASE_URL}/fleet/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Fleet[]>(response);
  }

  // Get single fleet by ID
  async getFleetById(fleetId: number): Promise<Fleet> {
    const response = await fetch(`${API_BASE_URL}/fleet/${fleetId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Fleet>(response);
  }

  // Create new fleet
  async createFleet(fleetData: CreateFleetRequest): Promise<Fleet> {
    const response = await fetch(`${API_BASE_URL}/fleet/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(fleetData),
    });

    return this.handleResponse<Fleet>(response);
  }

  // Update fleet
  async updateFleet(fleetId: number, fleetData: UpdateFleetRequest): Promise<Fleet> {
    const response = await fetch(`${API_BASE_URL}/fleet/${fleetId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(fleetData),
    });

    return this.handleResponse<Fleet>(response);
  }

  // Delete fleet
  async deleteFleet(fleetId: number): Promise<Fleet> {
    const response = await fetch(`${API_BASE_URL}/fleet/${fleetId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Fleet>(response);
  }

  // Get active fleets only
  async getActiveFleets(): Promise<Fleet[]> {
    const response = await fetch(`${API_BASE_URL}/fleet/?is_active=true`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Fleet[]>(response);
  }

  // Get fleets with pagination and filtering
  async getFleetsWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: Omit<FleetFilterOptions, 'skip' | 'limit'> = {}
  ): Promise<PaginatedResponse<Fleet>> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (validPage - 1) * validLimit;
    
    const filterOptions: FleetFilterOptions = {
      ...filters,
      skip,
      limit: validLimit
    };
    
    const fleets = await this.getFleets(filterOptions);
    return { 
      data: fleets, 
      page: validPage, 
      limit: validLimit 
    };
  }

  // Get total count of fleets for pagination
  async getFleetsCount(filters: Omit<FleetFilterOptions, 'skip' | 'limit'> = {}): Promise<number> {
    try {
      const fleets = await this.getFleets({ ...filters, limit: 100 });
      return fleets.length;
    } catch (error) {
      console.error('Error getting fleets count:', error);
      return 0;
    }
  }

  // Create default fleet (Admin only)
  async createDefaultFleet(): Promise<Fleet> {
    const response = await fetch(`${API_BASE_URL}/fleet/default`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Fleet>(response);
  }

  // Get fleet by ID with trucks
  async getFleetWithTrucks(fleetId: number): Promise<Fleet> {
    const response = await fetch(`${API_BASE_URL}/fleet/${fleetId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Fleet>(response);
  }

  // Unassign driver by driver ID (Admin only)
  async unassignDriver(driverId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/fleet/assign/${driverId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Get fleet summary (Admin only)
  async getFleetSummary(): Promise<FleetSummary> {
    const response = await fetch(`${API_BASE_URL}/fleet/summary`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<FleetSummary>(response);
  }
}

// Export singleton instance
export const fleetService = new FleetService();
