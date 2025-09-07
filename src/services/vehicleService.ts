// Vehicle Management API Service
// This file contains all API calls for vehicle management functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Add cache for vehicle stats
let vehicleStatsCache: VehicleStatsResponse | null = null;
let vehicleStatsCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export interface Vehicle {
  id?: number;
  type: "truck" | "bus" | "van" | "pickup" | "motorcycle";
  capacity: number;
  license_plate: string;
  model: string;
  year: number;
  status: "active" | "inactive" | "maintenance" | "out_of_service";
  assigned_driver_id?: number | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface CreateVehicleRequest {
  type: "truck" | "bus" | "van" | "pickup" | "motorcycle";
  capacity: number;
  license_plate: string;
  model: string;
  year: number;
  status: "active" | "inactive" | "maintenance" | "out_of_service";
  assigned_driver_id?: number | null;
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {
  status?: "active" | "inactive" | "maintenance" | "out_of_service";
  assigned_driver_id?: number | null;
}

export interface VehicleFilterOptions {
  type?: string;
  status?: string;
  assigned_driver_id?: number;
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface DeleteVehicleResponse {
  message: string;
}

export interface UpdateVehicleStatusResponse {
  message: string;
  vehicle_id: number;
  license_plate: string;
  old_status: string;
  new_status: string;
}

export interface VehicleStatsResponse {
  total_vehicles: number;
  status_breakdown: {
    active: number;
    inactive: number;
    maintenance: number;
    retired: number;
  };
  assignment_breakdown: {
    assigned: number;
    unassigned: number;
  };
  type_breakdown: {
    truck: number;
    bus: number;
    van: number;
    car: number;
    motorcycle: number;
  };
}

export interface UnassignDriverResponse {
  message: string;
  vehicle_id: number;
  license_plate: string;
}

export interface AssignDriverResponse {
  message: string;
  vehicle_id: number;
  driver_id: number;
  license_plate: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

class VehicleService {
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

  // Get all vehicles with pagination and filters (Authenticated users)
  async getVehicles(filters: VehicleFilterOptions = {}): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.assigned_driver_id) params.append('assigned_driver_id', filters.assigned_driver_id.toString());
    if (filters.year) params.append('year', filters.year.toString());
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

    const response = await fetch(`${API_BASE_URL}/vehicles/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<Vehicle[]>(response);
  }

  // Get vehicles with advanced pagination and filtering
  async getVehiclesWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: Omit<VehicleFilterOptions, 'page' | 'limit'> = {}
  ): Promise<PaginatedResponse<Vehicle>> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(limit, 1), 100);
    
    const filterOptions: VehicleFilterOptions = {
      ...filters,
      page: validPage,
      limit: validLimit
    };
    
    const vehicles = await this.getVehicles(filterOptions);
    return { 
      data: vehicles, 
      page: validPage, 
      limit: validLimit 
    };
  }

  // Get single vehicle by ID (Authenticated users)
  async getVehicleById(vehicleId: number): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Vehicle>(response);
  }

  // Create new vehicle (Admin only)
  async createVehicle(vehicleData: CreateVehicleRequest): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/vehicles/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(vehicleData),
    });

    return this.handleResponse<Vehicle>(response);
  }

  // Update vehicle
  async updateVehicle(vehicleId: number, vehicleData: UpdateVehicleRequest): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(vehicleData),
    });

    return this.handleResponse<Vehicle>(response);
  }

  // Delete vehicle (Soft delete - retires the vehicle)
  async deleteVehicle(vehicleId: number): Promise<DeleteVehicleResponse> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<DeleteVehicleResponse>(response);
  }

  // Assign driver to vehicle (Admin only)
  async assignDriverToVehicle(vehicleId: number, driverId: number): Promise<AssignDriverResponse> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/assign-driver?driver_id=${driverId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<AssignDriverResponse>(response);
  }

  // Unassign driver from vehicle (Admin only)
  async unassignDriverFromVehicle(vehicleId: number): Promise<UnassignDriverResponse> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/unassign-driver`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<UnassignDriverResponse>(response);
  }

  // Update vehicle status (Admin only)
  async updateVehicleStatus(vehicleId: number, status: Vehicle['status']): Promise<UpdateVehicleStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<UpdateVehicleStatusResponse>(response);
  }

  // Get available vehicles (active status)
  async getAvailableVehicles(): Promise<Vehicle[]> {
    const response = await fetch(`${API_BASE_URL}/vehicles/?status=active`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Vehicle[]>(response);
  }

  // Get vehicle statistics summary (Authenticated users) with caching
  async getVehicleStats(): Promise<VehicleStatsResponse> {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (vehicleStatsCache && (now - vehicleStatsCacheTime) < CACHE_DURATION) {
      return vehicleStatsCache;
    }
    
    const response = await fetch(`${API_BASE_URL}/vehicles/stats/summary`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      // Add cache control headers
      cache: 'no-cache',
    });

    const data = await this.handleResponse<VehicleStatsResponse>(response);
    
    // Update cache
    vehicleStatsCache = data;
    vehicleStatsCacheTime = now;
    
    return data;
  }

  // Get total count of vehicles for pagination
  async getVehiclesCount(filters: Omit<VehicleFilterOptions, 'page' | 'limit'> = {}): Promise<number> {
    try {
      const vehicles = await this.getVehicles({ ...filters, limit: 100 });
      return vehicles.length;
    } catch (error) {
      console.error('Error getting vehicles count:', error);
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

  // Debug method to check authentication status
  debugAuthStatus(): void {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('current_user');
    
    console.log('=== Vehicle Service Authentication Debug ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    console.log('User exists:', !!user);
    console.log('User data:', user ? JSON.parse(user) : null);
    console.log('============================================');
  }
}

// Export singleton instance
export const vehicleService = new VehicleService();