// Dispatch Management API Service
// This file contains all API calls for dispatch functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Dispatch interfaces based on the API specification
export interface Dispatch {
  dispatch_id: number;
  booking_id: number;
  assigned_driver: number | null;
  dispatch_time: string | null;
  arrival_time: string | null;
  status: "pending" | "dispatched" | "in_transit" | "arrived" | "completed" | "cancelled";
  created_at: string;
  updated_at: string | null;
}

export interface CreateDispatchRequest {
  booking_id: number;
}

export interface UpdateDispatchRequest {
  assigned_driver?: number | null;
  dispatch_time?: string | null;
  arrival_time?: string | null;
  status?: "pending" | "dispatched" | "in_transit" | "arrived" | "completed" | "cancelled";
}

export interface DispatchFilterOptions {
  status?: string;
  booking_id?: number;
  assigned_driver?: number;
  skip?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

// Update dispatch status with additional fields
export interface UpdateDispatchStatusRequest {
  status: "pending" | "dispatched" | "in_transit" | "arrived" | "completed" | "cancelled";
  dispatch_time?: string;
  arrival_time?: string;
}

// Dispatch with full details (includes booking and driver info)
export interface DispatchWithDetails {
  dispatch: Dispatch;
  booking: {
    booking_id: number;
    user_id: number;
    source: string;
    destination: string;
    service_type: string;
    price: number;
    truck_id: number;
    booking_status: string;
    created_at: string;
    updated_at: string | null;
  };
  driver: {
    id: number;
    user_id: number;
    employee_id: string;
    license_number: string;
    license_type: string;
    license_expiry: string;
    experience_years: number;
    rating: number;
    total_trips: number;
    total_distance_km: number;
    blood_group: string;
    address: string;
    phone_emergency: string;
    shift_start: string;
    shift_end: string;
    is_available: boolean;
    status: string;
    assigned_truck_id: number | null;
    created_at: string;
    updated_at: string | null;
  };
}

// Available driver interface
export interface AvailableDriver {
  id: number;
  user_id: number;
  employee_id: string;
  license_number: string;
  license_type: string;
  license_expiry: string;
  experience_years: number;
  rating: number;
  total_trips: number;
  total_distance_km: number;
  blood_group: string;
  address: string;
  phone_emergency: string;
  shift_start: string;
  shift_end: string;
  is_available: boolean;
  status: string;
  assigned_truck_id: number | null;
  created_at: string;
  updated_at: string | null;
}

class DispatchService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in again.');
    }
    console.log('Dispatch API - Auth token present:', !!token);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    console.log('Dispatch API - Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorData: unknown;
      
      // Try to parse the error response
      try {
        errorData = await response.json();
        console.error('Dispatch API Error Response:', errorData);
      } catch (parseError) {
        // If JSON parsing fails, use status-based error
        console.error('Failed to parse dispatch error response:', parseError);
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      // Handle FastAPI validation errors (422)
      if (response.status === 422 && errorData && typeof errorData === 'object' && 'detail' in errorData && Array.isArray((errorData as { detail: unknown }).detail)) {
        const validationErrors = (errorData as { detail: Array<{ loc?: string[]; msg: string }> }).detail.map((error) => {
          const field = error.loc ? error.loc.join('.') : 'unknown';
          return `${field}: ${error.msg}`;
        }).join(', ');
        throw new Error(`Validation error: ${validationErrors}`);
      }
      
      // Handle authentication errors
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Handle authorization errors
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to perform this action.');
      }
      
      // Handle other error formats
      if (errorData && typeof errorData === 'object' && 'detail' in errorData) {
        const errorDetail = (errorData as { detail: unknown }).detail;
        if (typeof errorDetail === 'string') {
          throw new Error(errorDetail);
        } else if (typeof errorDetail === 'object') {
          throw new Error(`API Error: ${JSON.stringify(errorDetail)}`);
        }
      }
      
      // Handle specific business logic errors
      if (response.status === 400 && errorData && typeof errorData === 'object' && 'detail' in errorData) {
        const errorDetail = (errorData as { detail: unknown }).detail;
        if (errorDetail === "Dispatch already exists for this booking") {
          throw new Error("A dispatch already exists for this booking. Please use the existing dispatch or cancel it first.");
        }
      }
      
      // Fallback to generic message with status
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Dispatch API - Response data sample:', Array.isArray(data) ? `Array with ${data.length} items` : typeof data);
    return data;
  }

  // Create a new dispatch for a booking
  async createDispatch(dispatchData: CreateDispatchRequest): Promise<Dispatch> {
    console.log('Creating dispatch with data:', dispatchData);
    
    const response = await fetch(`${API_BASE_URL}/dispatches/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dispatchData),
    });

    console.log('Create dispatch response status:', response.status);
    return this.handleResponse<Dispatch>(response);
  }

  // Get all dispatches with pagination and filters
  async getDispatches(filters: DispatchFilterOptions = {}): Promise<Dispatch[]> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.booking_id) params.append('booking_id', filters.booking_id.toString());
    if (filters.assigned_driver) params.append('assigned_driver', filters.assigned_driver.toString());
    
    // Add pagination parameters
    if (filters.skip !== undefined) {
      params.append('skip', Math.max(filters.skip, 0).toString());
    } else {
      params.append('skip', '0');
    }
    
    if (filters.limit !== undefined) {
      const limit = Math.min(Math.max(filters.limit, 1), 100);
      params.append('limit', limit.toString());
    } else {
      params.append('limit', '100');
    }

    const url = `${API_BASE_URL}/dispatches/?${params.toString()}`;
    console.log('Dispatch API - Fetching from:', url);
    console.log('Dispatch API - Filters:', filters);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    console.log('Dispatch API - Response status:', response.status);
    return this.handleResponse<Dispatch[]>(response);
  }

  // Get a specific dispatch by ID
  async getDispatchById(dispatchId: number): Promise<Dispatch> {
    const response = await fetch(`${API_BASE_URL}/dispatches/${dispatchId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Dispatch>(response);
  }

  // Update an existing dispatch
  async updateDispatch(dispatchId: number, dispatchData: UpdateDispatchRequest): Promise<Dispatch> {
    const response = await fetch(`${API_BASE_URL}/dispatches/${dispatchId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dispatchData),
    });

    return this.handleResponse<Dispatch>(response);
  }

  // Delete a dispatch
  async deleteDispatch(dispatchId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/dispatches/${dispatchId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // API may return empty response on successful deletion
    const result = await response.text();
    return result ? JSON.parse(result) : { message: 'Dispatch deleted successfully' };
  }

  // Get dispatches by status
  async getDispatchesByStatus(status: Dispatch['status'], skip: number = 0, limit: number = 100): Promise<Dispatch[]> {
    return this.getDispatches({ status, skip, limit });
  }

  // Get dispatch for a specific booking (single dispatch per booking)
  async getDispatchByBookingId(bookingId: number): Promise<Dispatch> {
    const response = await fetch(`${API_BASE_URL}/dispatches/booking/${bookingId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Dispatch>(response);
  }

  // Get dispatches for a specific booking (legacy method for compatibility)
  async getDispatchesByBookingId(bookingId: number): Promise<Dispatch[]> {
    try {
      const dispatch = await this.getDispatchByBookingId(bookingId);
      return [dispatch];
    } catch {
      // If no dispatch found, return empty array
      return [];
    }
  }

  // Get dispatches assigned to a specific driver using dedicated endpoint
  async getDispatchesByDriver(driverId: number, skip: number = 0, limit: number = 100): Promise<Dispatch[]> {
    const params = new URLSearchParams();
    params.append('skip', Math.max(skip, 0).toString());
    params.append('limit', Math.min(Math.max(limit, 1), 100).toString());

    const response = await fetch(`${API_BASE_URL}/dispatches/driver/${driverId}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Dispatch[]>(response);
  }

  // Update dispatch status
  async updateDispatchStatus(dispatchId: number, status: Dispatch['status']): Promise<Dispatch> {
    return this.updateDispatch(dispatchId, { status });
  }

  // Assign driver to dispatch using dedicated endpoint
  async assignDriver(dispatchId: number, driverId: number): Promise<Dispatch> {
    const response = await fetch(`${API_BASE_URL}/dispatches/${dispatchId}/assign-driver?driver_id=${driverId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Dispatch>(response);
  }

  // Legacy method for assigning driver via general update
  async assignDriverLegacy(dispatchId: number, driverId: number): Promise<Dispatch> {
    return this.updateDispatch(dispatchId, { assigned_driver: driverId });
  }

  // Set dispatch time
  async setDispatchTime(dispatchId: number, dispatchTime: string): Promise<Dispatch> {
    return this.updateDispatch(dispatchId, { dispatch_time: dispatchTime });
  }

  // Set arrival time
  async setArrivalTime(dispatchId: number, arrivalTime: string): Promise<Dispatch> {
    return this.updateDispatch(dispatchId, { arrival_time: arrivalTime });
  }

  // Get pending dispatches (convenience method)
  async getPendingDispatches(skip: number = 0, limit: number = 100): Promise<Dispatch[]> {
    return this.getDispatchesByStatus('pending', skip, limit);
  }

  // Get active dispatches (in_transit)
  async getActiveDispatches(skip: number = 0, limit: number = 100): Promise<Dispatch[]> {
    return this.getDispatchesByStatus('in_transit', skip, limit);
  }

  // Get completed dispatches
  async getCompletedDispatches(skip: number = 0, limit: number = 100): Promise<Dispatch[]> {
    return this.getDispatchesByStatus('completed', skip, limit);
  }

  // Update dispatch status using dedicated endpoint with additional fields
  async updateDispatchStatusAdvanced(dispatchId: number, statusData: UpdateDispatchStatusRequest): Promise<Dispatch> {
    const response = await fetch(`${API_BASE_URL}/dispatches/${dispatchId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(statusData),
    });

    return this.handleResponse<Dispatch>(response);
  }

  // Cancel a dispatch using dedicated endpoint
  async cancelDispatch(dispatchId: number): Promise<Dispatch> {
    const response = await fetch(`${API_BASE_URL}/dispatches/${dispatchId}/cancel`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Dispatch>(response);
  }

  // Get dispatch with full details (booking and driver info)
  async getDispatchWithDetails(dispatchId: number): Promise<DispatchWithDetails> {
    const response = await fetch(`${API_BASE_URL}/dispatches/${dispatchId}/with-details`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<DispatchWithDetails>(response);
  }

  // Get dispatches by status using dedicated endpoint
  async getDispatchesByStatusDedicated(status: Dispatch['status'], skip: number = 0, limit: number = 100): Promise<Dispatch[]> {
    const params = new URLSearchParams();
    params.append('skip', Math.max(skip, 0).toString());
    params.append('limit', Math.min(Math.max(limit, 1), 100).toString());

    const response = await fetch(`${API_BASE_URL}/dispatches/status/${status}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Dispatch[]>(response);
  }

  // Get available drivers for dispatch assignment
  async getAvailableDrivers(): Promise<AvailableDriver[]> {
    const response = await fetch(`${API_BASE_URL}/dispatches/available-drivers`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    console.log('Dispatch API - Available drivers response status:', response.status);
    return this.handleResponse<AvailableDriver[]>(response);
  }
}

// Export singleton instance
export const dispatchService = new DispatchService();
export default dispatchService;