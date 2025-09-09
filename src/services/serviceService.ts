// Vehicle Service Records API Service
// Provides methods to create and manage vehicle service/maintenance records

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ServiceRecord {
  id?: number;
  vehicle_id: number;
  service_type: string; // e.g., maintenance, repair, inspection
  description?: string;
  scheduled_date: string; // ISO datetime string
  estimated_duration?: number; // in minutes
  cost?: number;
  priority?: 'low' | 'medium' | 'high' | string;
  notes?: string;
  assigned_mechanic_id?: number | null;
  // Read-only fields from server
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | string;
  actual_duration?: number | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface CreateServiceRecordRequest {
  vehicle_id: number;
  service_type: string;
  description?: string;
  scheduled_date: string;
  estimated_duration?: number;
  cost?: number;
  priority?: 'low' | 'medium' | 'high' | string;
  notes?: string;
}

// Response type for createService
export interface CreateServiceResponse {
  id: number;
  status: string;
  actual_duration: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
}

// Update Service Status (Driver or Admin)
export interface UpdateServiceStatusRequest {
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | string;
  actual_duration?: number | null;
  notes?: string;
}

export interface UpdateServiceStatusResponse {
  id: number;
  status: string;
  actual_duration: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Parts Inventory
export type PartCategory =
  | 'engine'
  | 'transmission'
  | 'brakes'
  | 'tires'
  | 'electrical'
  | 'body'
  | 'interior'
  | 'fluids'
  | 'filters'
  | 'other';

export interface PartRecord {
  part_number: string;
  name: string;
  category: PartCategory | string;
  description?: string;
  manufacturer?: string;
  supplier?: string;
  unit_cost: number;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  location?: string;
  id?: number;
  status?: 'available' | 'unavailable' | string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string | null;
}

export type CreatePartRequest = Omit<PartRecord, 'id' | 'status' | 'is_active' | 'created_at' | 'updated_at'>;
export type CreatePartResponse = Required<PartRecord>;

export interface UpdatePartStockRequest {
  quantity_change: number;
  reason: string;
  notes?: string;
}

export interface AddPartToServiceItem {
  service_id: number;
  part_id: number;
  quantity_used: number;
  unit_cost_at_time: number;
  notes?: string;
}

export interface AddPartsToServiceResponse {
  message: string;
  total_cost: number;
  used_parts: Array<{ part_name: string; quantity: number; cost: number }>;
}

class ServiceService {
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

  // Get service summary analytics (Admin only)
  async getServiceSummary(startDate?: string, endDate?: string): Promise<{
    period: { start_date: string; end_date: string };
    summary: { total_services: number; total_cost: number; average_duration_minutes: number };
    by_status: Array<{ status: string; count: number }>;
    by_type: Array<{ type: string; count: number }>;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/service-summary?${params.toString()}`,{
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
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

  // Create a new service record (Admin only)
  async createService(serviceData: CreateServiceRecordRequest): Promise<CreateServiceResponse> {
    const response = await fetch(`${API_BASE_URL}/services/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });
    return this.handleResponse(response);
  }

  // Get all services with pagination
  async getServices(skip: number = 0, limit: number = 100): Promise<ServiceRecord[]> {
    const response = await fetch(`${API_BASE_URL}/services/?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Get a specific service by ID
  async getServiceById(id: number): Promise<ServiceRecord> {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Update service status (Driver or Admin only)
  async updateServiceStatus(id: number, payload: UpdateServiceStatusRequest): Promise<UpdateServiceStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/services/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  // Create a new part in inventory (Admin only)
  async createPart(partData: CreatePartRequest): Promise<CreatePartResponse> {
    const response = await fetch(`${API_BASE_URL}/services/parts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(partData),
    });
    return this.handleResponse(response);
  }

  // Get parts inventory with pagination
  async getParts(skip: number = 0, limit: number = 100): Promise<PartRecord[]> {
    const response = await fetch(`${API_BASE_URL}/services/parts?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Get a single part by ID
  async getPartById(id: number): Promise<PartRecord> {
    const response = await fetch(`${API_BASE_URL}/services/parts/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Update part stock (Admin only)
  async updatePartStock(partId: number, payload: UpdatePartStockRequest): Promise<PartRecord> {
    const response = await fetch(`${API_BASE_URL}/services/parts/${partId}/stock`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  // Add parts usage to a service (Admin only)
  async addPartsToService(serviceId: number, items: AddPartToServiceItem[]): Promise<AddPartsToServiceResponse> {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/parts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(items),
    });
    return this.handleResponse(response);
  }

  // Vehicle maintenance status overview (Admin only)
  async getVehicleMaintenanceOverview(): Promise<{
    total_vehicles: number;
    vehicles_requiring_maintenance: number;
    vehicles_overdue: number;
    vehicle_details: Array<{
      vehicle_id: number;
      license_plate: string;
      type: string;
      status: string;
      pending_services: number;
      overdue_services: number;
      last_service_date: string | null;
      assigned_driver: string | null;
    }>;
  }> {
    const response = await fetch(`${API_BASE_URL}/analytics/vehicle-maintenance`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Parts inventory status analytics (Admin only)
  async getPartsInventoryStatus(): Promise<{
    summary: { total_parts: number; total_inventory_value: number };
    by_status: Array<{ status: string; count: number; value: number }>;
    by_category: Array<{ category: string; count: number; total_stock: number }>;
    low_stock_alerts: Array<{
      part_id?: number;
      part_number?: string;
      name?: string;
      current_stock?: number;
      min_stock_level?: number;
      category?: string;
    }>;
  }> {
    const response = await fetch(`${API_BASE_URL}/analytics/parts-inventory-status`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Upcoming maintenance schedule (Admin only)
  async getMaintenanceSchedule(daysAhead: number = 30): Promise<{
    period_days: number;
    total_upcoming_services: number;
    services_by_date: Record<string, Array<{
      service_id: number;
      vehicle_id: number;
      service_type: string;
      description?: string;
      priority?: string;
      estimated_duration?: number;
      cost?: number;
    }>>;
    maintenance_schedules: any[];
  }> {
    const validated = Math.min(Math.max(daysAhead, 1), 365);
    const params = new URLSearchParams();
    params.append('days_ahead', String(validated));

    const response = await fetch(`${API_BASE_URL}/analytics/maintenance-schedule?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Service cost analysis (Admin only)
  async getServiceCostAnalysis(options?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'month' | 'week' | 'day' | 'vehicle' | 'service_type';
  }): Promise<{
    period: { start_date: string; end_date: string };
    group_by: string;
    total_cost: number;
    total_services: number;
    cost_breakdown: Array<{
      period?: string;
      vehicle_id?: number;
      service_type?: string;
      total_cost: number;
      service_count: number;
      average_cost: number;
    }>;
  }> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('start_date', options.startDate);
    if (options?.endDate) params.append('end_date', options.endDate);
    if (options?.groupBy) params.append('group_by', options.groupBy);

    const response = await fetch(`${API_BASE_URL}/analytics/cost-analysis?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const serviceService = new ServiceService();