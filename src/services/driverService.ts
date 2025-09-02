// Driver Management API Service
// This file contains all API calls for driver management functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Driver {
  id?: number;
  user_id: number;
  employee_id: string;
  license_number: string;
  license_type: string;
  license_expiry: string;
  experience_years: number;
  phone_emergency: string;
  address: string;
  blood_group: string;
  assigned_truck_id?: number | null;
  shift_start: string;
  shift_end: string;
  status?: "active" | "inactive" | "suspended";
  is_available?: boolean;
  rating?: number;
  total_trips?: number;
  total_distance_km?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDriverRequest {
  user_id: number;
  employee_id: string;
  license_number: string;
  license_type: string;
  license_expiry: string;
  experience_years: number;
  phone_emergency: string;
  address: string;
  blood_group: string;
  assigned_truck_id?: number | null;
  shift_start: string;
  shift_end: string;
}

export interface UpdateDriverRequest extends Partial<CreateDriverRequest> {
  status?: "active" | "inactive" | "suspended";
  is_available?: boolean;
  rating?: number;
}

export interface DriverFilterOptions {
  status?: string;
  is_available?: boolean;
  assigned_truck_id?: number;
  license_type?: string;
  search?: string;
  page?: number;
  limit?: number;
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

class DriverService {
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
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
        window.location.href = '/auth/signin';
        throw new Error('Authentication failed. Please log in again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Get all drivers with pagination and filters
  async getDrivers(filters: DriverFilterOptions = {}): Promise<Driver[]> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.is_available !== undefined) params.append('is_available', filters.is_available.toString());
    if (filters.assigned_truck_id) params.append('assigned_truck_id', filters.assigned_truck_id.toString());
    if (filters.license_type) params.append('license_type', filters.license_type);
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

    const response = await fetch(`${API_BASE_URL}/fleet/drivers?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<Driver[]>(response);
  }

  // Get drivers with advanced pagination and filtering
  async getDriversWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: Omit<DriverFilterOptions, 'page' | 'limit'> = {}
  ): Promise<PaginatedResponse<Driver>> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(limit, 1), 100);
    
    const filterOptions: DriverFilterOptions = {
      ...filters,
      page: validPage,
      limit: validLimit
    };
    
    const drivers = await this.getDrivers(filterOptions);
    return { 
      data: drivers, 
      page: validPage, 
      limit: validLimit 
    };
  }

  // Get single driver by ID
  async getDriverById(driverId: number): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/fleet/drivers/${driverId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Driver>(response);
  }

  // Create new driver (Admin only)
  async createDriver(driverData: CreateDriverRequest): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/fleet/drivers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(driverData),
    });

    return this.handleResponse<Driver>(response);
  }

  // Update driver
  async updateDriver(driverId: number, driverData: UpdateDriverRequest): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/fleet/drivers/${driverId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(driverData),
    });

    return this.handleResponse<Driver>(response);
  }

  // Delete driver
  async deleteDriver(driverId: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/fleet/drivers/${driverId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ApiResponse<null>>(response);
  }

  // Assign driver to truck
  async assignDriverToTruck(driverId: number, truckId: number): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/fleet/drivers/${driverId}/assign-truck`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ assigned_truck_id: truckId }),
    });

    return this.handleResponse<Driver>(response);
  }

  // Unassign driver from truck
  async unassignDriverFromTruck(driverId: number): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/fleet/drivers/${driverId}/unassign-truck`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Driver>(response);
  }

  // Update driver status
  async updateDriverStatus(driverId: number, status: Driver['status']): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/fleet/drivers/${driverId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    return this.handleResponse<Driver>(response);
  }

  // Update driver availability
  async updateDriverAvailability(driverId: number, isAvailable: boolean): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/fleet/drivers/${driverId}/availability`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_available: isAvailable }),
    });

    return this.handleResponse<Driver>(response);
  }

  // Get available drivers (not assigned to any truck)
  async getAvailableDrivers(): Promise<Driver[]> {
    const response = await fetch(`${API_BASE_URL}/fleet/drivers?is_available=true&assigned_truck_id=null`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Driver[]>(response);
  }

  // Get total count of drivers for pagination
  async getDriversCount(filters: Omit<DriverFilterOptions, 'page' | 'limit'> = {}): Promise<number> {
    try {
      const drivers = await this.getDrivers({ ...filters, limit: 100 });
      return drivers.length;
    } catch (error) {
      console.error('Error getting drivers count:', error);
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
}

// Export singleton instance
export const driverService = new DriverService();
