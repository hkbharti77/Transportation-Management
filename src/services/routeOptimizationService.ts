// Route Optimization API Service
// This file contains all API calls for route optimization, traffic, and weather functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// Route Optimization Interfaces
export interface RouteOptimizationRequest {
  route_id: number;
  optimization_factors?: string[];
  consider_alternatives?: boolean;
  max_alternatives?: number;
}

export interface AlternativeRoute {
  route_id: number;
  time: number;
  distance: number;
  cost: number;
}

export interface RouteOptimizationResponse {
  route_id: number;
  original_time: number;
  optimized_time: number;
  time_saved: number;
  original_distance: number;
  optimized_distance: number;
  distance_saved: number;
  original_cost: number;
  optimized_cost: number;
  cost_saved: number;
  alternative_routes: AlternativeRoute[];
  factors_used: string[];
  confidence_score: number;
  recommendations: string[];
}

// Route Optimization History Interfaces
export interface RouteOptimizationHistory {
  id: number;
  route_id: number;
  optimization_type: string;
  original_time: number;
  optimized_time: number;
  original_distance: number;
  optimized_distance: number;
  original_cost: number;
  optimized_cost: number;
  alternative_routes: AlternativeRoute[];
  factors_considered: Record<string, unknown>;
  confidence_score: number;
  timestamp: string;
}

export interface CreateRouteOptimizationHistoryRequest {
  route_id: number;
  optimization_type: string;
  original_time: number;
  optimized_time: number;
  original_distance: number;
  optimized_distance: number;
  original_cost: number;
  optimized_cost: number;
  alternative_routes: AlternativeRoute[];
  factors_considered: Record<string, unknown>;
  confidence_score: number;
}

// Traffic Data Interfaces
export interface TrafficData {
  id: number;
  route_id: number;
  congestion_level: number;
  average_speed: number;
  travel_time: number;
  road_conditions: string;
  raw_data: Record<string, unknown>;
  timestamp: string;
}

export interface CreateTrafficDataRequest {
  route_id: number;
  congestion_level: number;
  average_speed: number;
  travel_time: number;
  road_conditions: string;
  raw_data: Record<string, unknown>;
}

// Weather Data Interfaces (Enhanced with new fields)
export interface WeatherData {
  id: number;
  route_id: number;
  temperature: number | null;
  feels_like: number | null;
  pressure: number | null;
  humidity: number | null;
  precipitation: number | null;
  wind_speed: number | null;
  wind_deg: number | null;
  wind_gust: number | null;
  visibility: number | null;
  weather_condition: string | null;
  weather_description: string | null;
  clouds: number | null;
  raw_data: Record<string, unknown>;
  timestamp: string;
}

export interface CreateWeatherDataRequest {
  route_id: number;
  temperature?: number | null;
  feels_like?: number | null;
  pressure?: number | null;
  humidity?: number | null;
  precipitation?: number | null;
  wind_speed?: number | null;
  wind_deg?: number | null;
  wind_gust?: number | null;
  visibility?: number | null;
  weather_condition?: string | null;
  weather_description?: string | null;
  clouds?: number | null;
  raw_data?: Record<string, unknown>;
}

// Fuel Price Interfaces
export interface FuelPrice {
  id: number;
  route_id: number;
  fuel_type: string;
  price_per_liter: number;
  location: string;
  raw_data: Record<string, unknown>;
  timestamp: string;
}

export interface CreateFuelPriceRequest {
  route_id: number;
  fuel_type: string;
  price_per_liter: number;
  location: string;
  raw_data: Record<string, unknown>;
}

class RouteOptimizationService {
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

  // Route Optimization Methods

  // Optimize a route (fully automatic - no manual input required)
  async optimizeRoute(optimizationData: RouteOptimizationRequest): Promise<RouteOptimizationResponse> {
    const response = await fetch(`${API_BASE_URL}/route-optimization/optimize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(optimizationData),
    });

    return this.handleResponse<RouteOptimizationResponse>(response);
  }

  // Route Optimization History Methods

  // Get optimization history for a route
  async getRouteOptimizations(routeId: number, skip: number = 0, limit: number = 100): Promise<RouteOptimizationHistory[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: Math.min(Math.max(limit, 1), 100).toString()
    });

    const response = await fetch(`${API_BASE_URL}/route-optimization/routes/${routeId}/optimizations?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<RouteOptimizationHistory[]>(response);
  }

  // Add optimization history for a route
  async addRouteOptimization(routeId: number, optimizationData: CreateRouteOptimizationHistoryRequest): Promise<RouteOptimizationHistory> {
    const response = await fetch(`${API_BASE_URL}/route-optimization/routes/${routeId}/optimizations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(optimizationData),
    });

    return this.handleResponse<RouteOptimizationHistory>(response);
  }

  // Traffic Data Methods

  // Get traffic data for a route
  async getRouteTraffic(routeId: number, skip: number = 0, limit: number = 100): Promise<TrafficData[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: Math.min(Math.max(limit, 1), 100).toString()
    });

    const response = await fetch(`${API_BASE_URL}/route-optimization/routes/${routeId}/traffic?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<TrafficData[]>(response);
  }

  // Add traffic data for a route (admin only)
  async addRouteTraffic(routeId: number, trafficData: CreateTrafficDataRequest): Promise<TrafficData> {
    const response = await fetch(`${API_BASE_URL}/route-optimization/routes/${routeId}/traffic`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(trafficData),
    });

    return this.handleResponse<TrafficData>(response);
  }

  // Weather Data Methods

  // Get weather data for a route
  async getRouteWeather(routeId: number, skip: number = 0, limit: number = 100): Promise<WeatherData[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: Math.min(Math.max(limit, 1), 100).toString()
    });

    const response = await fetch(`${API_BASE_URL}/route-optimization/routes/${routeId}/weather?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<WeatherData[]>(response);
  }

  // Add weather data for a route (admin only - automatic collection happens during optimization)
  async addRouteWeather(routeId: number, weatherData: CreateWeatherDataRequest): Promise<WeatherData> {
    const response = await fetch(`${API_BASE_URL}/route-optimization/routes/${routeId}/weather`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(weatherData),
    });

    return this.handleResponse<WeatherData>(response);
  }

  // Fuel Price Methods

  // Get fuel prices for a route
  async getRouteFuelPrices(routeId: number, skip: number = 0, limit: number = 100): Promise<FuelPrice[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: Math.min(Math.max(limit, 1), 100).toString()
    });

    const response = await fetch(`${API_BASE_URL}/route-optimization/routes/${routeId}/fuel-prices?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<FuelPrice[]>(response);
  }

  // Add fuel price for a route
  async addRouteFuelPrice(routeId: number, fuelPriceData: CreateFuelPriceRequest): Promise<FuelPrice> {
    const response = await fetch(`${API_BASE_URL}/route-optimization/routes/${routeId}/fuel-prices`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(fuelPriceData),
    });

    return this.handleResponse<FuelPrice>(response);
  }
}

// Export singleton instance
export const routeOptimizationService = new RouteOptimizationService();
export default routeOptimizationService;