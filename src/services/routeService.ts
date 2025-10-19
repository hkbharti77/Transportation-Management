// Route Management API Service
// This file contains all API calls for route management functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface Route {
  id?: number;
  route_number: string;
  start_point: string;
  end_point: string;
  stops: string[];
  estimated_time: number; // in minutes
  distance: number; // in kilometers
  base_fare: number;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string | null;
}

export interface CreateRouteRequest {
  route_number: string;
  start_point: string;
  end_point: string;
  stops: string[];
  estimated_time: number;
  distance: number;
  base_fare: number;
  description: string;
  is_active: boolean;
}

export interface UpdateRouteRequest extends Partial<CreateRouteRequest> {
  is_active?: boolean;
}

export interface RouteFilterOptions {
  route_number?: string;
  start_point?: string;
  end_point?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Removed unused ApiResponse interface

export interface DeleteRouteResponse {
  message: string;
}

export interface RouteStatsResponse {
  total_routes: number;
  status_breakdown: {
    active: number;
    inactive: number;
  };
  avg_distance: number;
  avg_estimated_time: number;
  avg_base_fare: number;
}

export interface RouteDetailStats {
  route_id: number;
  route_number: string;
  total_trips: number;
  active_trips: number;
  completed_trips: number;
  completion_rate: number;
  base_fare: number;
  estimated_time: number;
  distance: number;
}

export interface Trip {
  id: number;
  departure_time: string;
  arrival_time: string;
  status: string;
  fare: number;
  available_seats: number;
  total_seats: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

class RouteService {
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
      
      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch {
        // If we can't parse JSON, try to get text
        try {
          const errorText = await response.text();
          errorDetails = errorText || `HTTP error! status: ${response.status}`;
        } catch {
          errorDetails = `HTTP error! status: ${response.status}`;
        }
      }
      
      throw new Error(errorDetails || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Check if user is authenticated
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  // Check if current user is admin
  private isCurrentUserAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('current_user') || '{}');
    return user.role === 'admin';
  }

  // Get all routes with pagination and filters (Authenticated users)
  async getRoutes(filters: RouteFilterOptions = {}): Promise<Route[]> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.route_number) params.append('route_number', filters.route_number);
    if (filters.start_point) params.append('start_point', filters.start_point);
    if (filters.end_point) params.append('end_point', filters.end_point);
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

    const response = await fetch(`${API_BASE_URL}/routes/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<Route[]>(response);
  }

  // Get routes with advanced pagination and filtering
  async getRoutesWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: Omit<RouteFilterOptions, 'page' | 'limit'> = {}
  ): Promise<PaginatedResponse<Route>> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(limit, 1), 100);
    
    const filterOptions: RouteFilterOptions = {
      ...filters,
      page: validPage,
      limit: validLimit
    };
    
    const routes = await this.getRoutes(filterOptions);
    return { 
      data: routes, 
      page: validPage, 
      limit: validLimit 
    };
  }

  // Get single route by ID (Authenticated users)
  async getRouteById(routeId: number): Promise<Route> {
    const response = await fetch(`${API_BASE_URL}/routes/${routeId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Route>(response);
  }

  // Create new route (Admin only)
  async createRoute(routeData: CreateRouteRequest): Promise<Route> {
    if (!this.isCurrentUserAdmin()) {
      throw new Error('Only administrators can create routes');
    }

    const response = await fetch(`${API_BASE_URL}/routes/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(routeData),
    });

    return this.handleResponse<Route>(response);
  }

  // Update route (Admin only)
  async updateRoute(routeId: number, routeData: UpdateRouteRequest): Promise<Route> {
    if (!this.isCurrentUserAdmin()) {
      throw new Error('Only administrators can update routes');
    }

    const response = await fetch(`${API_BASE_URL}/routes/${routeId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(routeData),
    });

    return this.handleResponse<Route>(response);
  }

  // Delete route (Admin only)
  async deleteRoute(routeId: number): Promise<null> {
    if (!this.isCurrentUserAdmin()) {
      throw new Error('Only administrators can delete routes');
    }

    const response = await fetch(`${API_BASE_URL}/routes/${routeId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<null>(response);
  }

  // Toggle route active status (Admin only)
  async toggleRouteStatus(routeId: number, isActive: boolean): Promise<Route> {
    if (!this.isCurrentUserAdmin()) {
      throw new Error('Only administrators can modify route status');
    }

    return this.updateRoute(routeId, { is_active: isActive });
  }

  // Get active routes only (Public)
  async getActiveRoutes(): Promise<Route[]> {
    return this.getRoutes({ is_active: true });
  }

  // Get route statistics (Admin only) - with fallback
  async getRouteStats(): Promise<RouteStatsResponse> {
    if (!this.isCurrentUserAdmin()) {
      throw new Error('Only administrators can view route statistics');
    }

    try {
      // First try the direct stats endpoint
      const response = await fetch(`${API_BASE_URL}/routes/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return this.handleResponse<RouteStatsResponse>(response);
      }
      
      // If the direct endpoint fails, fall back to calculating stats from routes data
      console.warn('Direct stats endpoint failed, falling back to calculating stats from routes data');
      return await this.calculateRouteStatsFallback();
    } catch (error) {
      // If the direct endpoint fails, fall back to calculating stats from routes data
      console.warn('Direct stats endpoint failed, falling back to calculating stats from routes data', error);
      return await this.calculateRouteStatsFallback();
    }
  }

  // Fallback method to calculate route stats from routes data
  private async calculateRouteStatsFallback(): Promise<RouteStatsResponse> {
    const routes = await this.getRoutes();
    
    const total_routes = routes.length;
    const active_routes = routes.filter(route => route.is_active).length;
    const inactive_routes = total_routes - active_routes;
    
    // Calculate averages
    const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0);
    const avg_distance = total_routes > 0 ? totalDistance / total_routes : 0;
    
    const totalEstimatedTime = routes.reduce((sum, route) => sum + route.estimated_time, 0);
    const avg_estimated_time = total_routes > 0 ? totalEstimatedTime / total_routes : 0;
    
    const totalBaseFare = routes.reduce((sum, route) => sum + route.base_fare, 0);
    const avg_base_fare = total_routes > 0 ? totalBaseFare / total_routes : 0;
    
    return {
      total_routes,
      status_breakdown: {
        active: active_routes,
        inactive: inactive_routes
      },
      avg_distance,
      avg_estimated_time,
      avg_base_fare
    };
  }

  // Get statistics for a specific route
  async getRouteDetailStats(routeId: number): Promise<RouteDetailStats> {
    const response = await fetch(`${API_BASE_URL}/routes/${routeId}/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<RouteDetailStats>(response);
  }

  // Get trips for a specific route
  async getRouteTrips(routeId: number, skip: number = 0, limit: number = 100): Promise<Trip[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: Math.min(Math.max(limit, 1), 100).toString()
    });

    const response = await fetch(`${API_BASE_URL}/routes/${routeId}/trips?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Trip[]>(response);
  }

  // Search routes by criteria
  async searchRoutes(searchTerm: string): Promise<Route[]> {
    return this.getRoutes({ search: searchTerm });
  }

  // Get routes count with filters
  async getRoutesCount(filters: Omit<RouteFilterOptions, 'page' | 'limit'> = {}): Promise<number> {
    const routes = await this.getRoutes(filters);
    return routes.length;
  }

  // Validate route data before sending to API
  validateRouteData(routeData: CreateRouteRequest | UpdateRouteRequest): string[] {
    const errors: string[] = [];

    if ('route_number' in routeData && (!routeData.route_number || routeData.route_number.trim() === '')) {
      errors.push('Route number is required');
    }

    if ('start_point' in routeData && (!routeData.start_point || routeData.start_point.trim() === '')) {
      errors.push('Start point is required');
    }

    if ('end_point' in routeData && (!routeData.end_point || routeData.end_point.trim() === '')) {
      errors.push('End point is required');
    }

    if ('stops' in routeData && (!routeData.stops || routeData.stops.length === 0)) {
      errors.push('At least one stop is required');
    }

    if ('estimated_time' in routeData && (!routeData.estimated_time || routeData.estimated_time <= 0)) {
      errors.push('Estimated time must be greater than 0');
    }

    if ('distance' in routeData && (!routeData.distance || routeData.distance <= 0)) {
      errors.push('Distance must be greater than 0');
    }

    if ('base_fare' in routeData && (!routeData.base_fare || routeData.base_fare <= 0)) {
      errors.push('Base fare must be greater than 0');
    }

    if ('description' in routeData && (!routeData.description || routeData.description.trim() === '')) {
      errors.push('Description is required');
    }

    return errors;
  }
}

// Export singleton instance
export const routeService = new RouteService();
export default routeService;