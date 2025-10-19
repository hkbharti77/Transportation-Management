// Performance Management API Service
// This file contains all API calls for driver performance and behavior event management

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// Driver Performance Interfaces
export interface DriverPerformance {
  id?: number;
  driver_id: number;
  trip_id: number;
  safety_score: number;
  punctuality_score: number;
  fuel_efficiency_score: number;
  overall_score: number;
  total_distance: number;
  total_time: number;
  average_speed: number;
  harsh_braking_count: number;
  speeding_count: number;
  phone_usage_count: number;
  hard_acceleration_count: number;
  hard_turn_count: number;
  idling_time: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDriverPerformanceRequest {
  driver_id: number;
  trip_id: number;
  safety_score: number;
  punctuality_score: number;
  fuel_efficiency_score: number;
  overall_score: number;
  total_distance: number;
  total_time: number;
  average_speed: number;
  harsh_braking_count: number;
  speeding_count: number;
  phone_usage_count: number;
  hard_acceleration_count: number;
  hard_turn_count: number;
  idling_time: number;
}

/**
 * This type extends Partial<CreateDriverPerformanceRequest> to allow partial updates.
 * It inherits all properties from CreateDriverPerformanceRequest but makes them optional,
 * enabling updates to specific fields only.
 */
export type UpdateDriverPerformanceRequest = Partial<CreateDriverPerformanceRequest>;

// Driver Scorecard Interface
export interface DriverScorecard {
  driver_id: number;
  safety_score: number;
  punctuality_score: number;
  fuel_efficiency_score: number;
  overall_score: number;
  total_trips: number;
  total_distance: number;
  total_time: number;
  average_speed: number;
  harsh_braking_count: number;
  speeding_count: number;
  phone_usage_count: number;
  hard_acceleration_count: number;
  hard_turn_count: number;
  idling_time: number;
  created_at?: string;
  updated_at?: string;
}

// Behavior Event Interfaces
export interface BehaviorEvent {
  id?: number;
  driver_id: number;
  trip_id: number;
  event_type: string;
  latitude: number;
  longitude: number;
  speed: number;
  additional_data?: string;
  resolved: boolean;
  timestamp?: string;
  created_at?: string;
  resolved_at?: string | null;
}

export interface CreateBehaviorEventRequest {
  driver_id: number;
  trip_id: number;
  event_type: string;
  latitude: number;
  longitude: number;
  speed: number;
  additional_data?: string;
  resolved?: boolean;
}

export interface UpdateBehaviorEventRequest {
  resolved: boolean;
}

// Vehicle Diagnostics Interfaces
export interface VehicleDiagnostics {
  id?: number;
  vehicle_id: number;
  engine_health: number;
  tire_pressure_front_left: number;
  tire_pressure_front_right: number;
  tire_pressure_rear_left: number;
  tire_pressure_rear_right: number;
  oil_level: number;
  coolant_level: number;
  brake_fluid_level: number;
  transmission_fluid_level: number;
  battery_voltage: number;
  diagnostic_trouble_codes: string;
  last_updated?: string;
  created_at?: string;
}

export interface CreateVehicleDiagnosticsRequest {
  vehicle_id: number;
  engine_health: number;
  tire_pressure_front_left: number;
  tire_pressure_front_right: number;
  tire_pressure_rear_left: number;
  tire_pressure_rear_right: number;
  oil_level: number;
  coolant_level: number;
  brake_fluid_level: number;
  transmission_fluid_level: number;
  battery_voltage: number;
  diagnostic_trouble_codes: string;
}

/**
 * This type extends Partial<CreateVehicleDiagnosticsRequest> to allow partial updates.
 * It inherits all properties from CreateVehicleDiagnosticsRequest but makes them optional,
 * enabling updates to specific fields only.
 */
export type UpdateVehicleDiagnosticsRequest = Partial<CreateVehicleDiagnosticsRequest>;

// Maintenance Alert Interfaces
export interface MaintenanceAlert {
  id?: number;
  vehicle_id: number;
  alert_title: string;
  alert_description: string;
  severity: "low" | "medium" | "high" | "critical";
  recommended_action: string;
  resolved: boolean;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
}

export interface CreateMaintenanceAlertRequest {
  vehicle_id: number;
  alert_title: string;
  alert_description: string;
  severity: "low" | "medium" | "high" | "critical";
  recommended_action: string;
  resolved?: boolean;
}

/**
 * This type defines the properties that can be updated for a maintenance alert.
 * Currently, only the resolved status can be updated.
 */
export type UpdateMaintenanceAlertRequest = {
  resolved: boolean;
};

// Response Interfaces
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

class PerformanceService {
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
        window.location.href = '/signin';
        throw new Error('Authentication failed. Please log in again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Driver Performance Methods

  // Create a new driver performance record
  async createDriverPerformance(performanceData: CreateDriverPerformanceRequest): Promise<DriverPerformance> {
    const response = await fetch(`${API_BASE_URL}/performance/driver-performance/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(performanceData),
    });

    return this.handleResponse<DriverPerformance>(response);
  }

  // Get driver performance by ID
  async getDriverPerformanceById(id: number): Promise<DriverPerformance> {
    const response = await fetch(`${API_BASE_URL}/performance/driver-performance/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<DriverPerformance>(response);
  }

  // Get all performance records for a specific driver
  async getDriverPerformances(
    driverId: number,
    skip: number = 0,
    limit: number = 100
  ): Promise<DriverPerformance[]> {
    const response = await fetch(
      `${API_BASE_URL}/performance/driver/${driverId}/performances?skip=${skip}&limit=${limit}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<DriverPerformance[]>(response);
  }

  // Get driver scorecard
  async getDriverScorecard(driverId: number): Promise<DriverScorecard> {
    const response = await fetch(`${API_BASE_URL}/performance/driver/${driverId}/scorecard`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<DriverScorecard>(response);
  }

  // Update driver performance record
  async updateDriverPerformance(
    id: number,
    performanceData: UpdateDriverPerformanceRequest
  ): Promise<DriverPerformance> {
    const response = await fetch(`${API_BASE_URL}/performance/driver-performance/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(performanceData),
    });

    return this.handleResponse<DriverPerformance>(response);
  }

  // Delete driver performance record
  async deleteDriverPerformance(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/performance/driver-performance/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ApiResponse<null>>(response);
  }

  // Behavior Event Methods

  // Create a new behavior event
  async createBehaviorEvent(eventData: CreateBehaviorEventRequest): Promise<BehaviorEvent> {
    const response = await fetch(`${API_BASE_URL}/performance/behavior-event/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(eventData),
    });

    return this.handleResponse<BehaviorEvent>(response);
  }

  // Get behavior event by ID
  async getBehaviorEventById(id: number): Promise<BehaviorEvent> {
    const response = await fetch(`${API_BASE_URL}/performance/behavior-event/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BehaviorEvent>(response);
  }

  // Get all behavior events for a specific driver
  async getDriverBehaviorEvents(
    driverId: number,
    skip: number = 0,
    limit: number = 100
  ): Promise<BehaviorEvent[]> {
    const response = await fetch(
      `${API_BASE_URL}/performance/driver/${driverId}/behavior-events?skip=${skip}&limit=${limit}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<BehaviorEvent[]>(response);
  }

  // Get unresolved behavior events for a specific driver
  async getUnresolvedDriverBehaviorEvents(driverId: number): Promise<BehaviorEvent[]> {
    const response = await fetch(
      `${API_BASE_URL}/performance/driver/${driverId}/unresolved-behavior-events`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<BehaviorEvent[]>(response);
  }

  // Update behavior event (mark as resolved)
  async updateBehaviorEvent(id: number, eventData: UpdateBehaviorEventRequest): Promise<BehaviorEvent> {
    const response = await fetch(`${API_BASE_URL}/performance/behavior-event/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(eventData),
    });

    return this.handleResponse<BehaviorEvent>(response);
  }

  // Delete behavior event
  async deleteBehaviorEvent(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/performance/behavior-event/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ApiResponse<null>>(response);
  }

  // Vehicle Diagnostics Methods

  // Create vehicle diagnostics
  async createVehicleDiagnostics(diagnosticsData: CreateVehicleDiagnosticsRequest): Promise<VehicleDiagnostics> {
    const response = await fetch(`${API_BASE_URL}/performance/vehicle-diagnostics/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(diagnosticsData),
    });

    return this.handleResponse<VehicleDiagnostics>(response);
  }

  // Get vehicle diagnostics by vehicle ID
  async getVehicleDiagnostics(vehicleId: number): Promise<VehicleDiagnostics> {
    const response = await fetch(`${API_BASE_URL}/performance/vehicle/${vehicleId}/diagnostics`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<VehicleDiagnostics>(response);
  }

  // Update vehicle diagnostics
  async updateVehicleDiagnostics(
    id: number,
    diagnosticsData: UpdateVehicleDiagnosticsRequest
  ): Promise<VehicleDiagnostics> {
    const response = await fetch(`${API_BASE_URL}/performance/vehicle-diagnostics/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(diagnosticsData),
    });

    return this.handleResponse<VehicleDiagnostics>(response);
  }

  // Delete vehicle diagnostics
  async deleteVehicleDiagnostics(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/performance/vehicle-diagnostics/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ApiResponse<null>>(response);
  }

  // Maintenance Alert Methods

  // Create maintenance alert
  async createMaintenanceAlert(alertData: CreateMaintenanceAlertRequest): Promise<MaintenanceAlert> {
    const response = await fetch(`${API_BASE_URL}/performance/maintenance-alert/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(alertData),
    });

    return this.handleResponse<MaintenanceAlert>(response);
  }

  // Get maintenance alert by ID
  async getMaintenanceAlertById(id: number): Promise<MaintenanceAlert> {
    const response = await fetch(`${API_BASE_URL}/performance/maintenance-alert/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<MaintenanceAlert>(response);
  }

  // Get all maintenance alerts for a specific vehicle
  async getVehicleMaintenanceAlerts(
    vehicleId: number,
    skip: number = 0,
    limit: number = 100
  ): Promise<MaintenanceAlert[]> {
    const response = await fetch(
      `${API_BASE_URL}/performance/vehicle/${vehicleId}/maintenance-alerts?skip=${skip}&limit=${limit}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<MaintenanceAlert[]>(response);
  }

  // Get unresolved maintenance alerts for a specific vehicle
  async getUnresolvedVehicleMaintenanceAlerts(vehicleId: number): Promise<MaintenanceAlert[]> {
    const response = await fetch(
      `${API_BASE_URL}/performance/vehicle/${vehicleId}/unresolved-maintenance-alerts`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<MaintenanceAlert[]>(response);
  }

  // Update maintenance alert (mark as resolved)
  async updateMaintenanceAlert(id: number, alertData: UpdateMaintenanceAlertRequest): Promise<MaintenanceAlert> {
    const response = await fetch(`${API_BASE_URL}/performance/maintenance-alert/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(alertData),
    });

    return this.handleResponse<MaintenanceAlert>(response);
  }

  // Delete maintenance alert
  async deleteMaintenanceAlert(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/performance/maintenance-alert/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ApiResponse<null>>(response);
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();