// Public Service Management API Service
// This file contains all API calls for public service management functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Stop {
  name: string;
  location: string;
  sequence: number;
  estimated_time: string;
}

export interface Schedule {
  day: string;
  departure_time: string;
  arrival_time: string;
}

export interface PublicService {
  service_id?: number;
  route_name: string;
  stops: Stop[];
  schedule: Schedule[];
  capacity: number;
  fare: number;
  vehicle_id?: number;
  status?: 'active' | 'inactive' | 'maintenance' | 'cancelled';
  created_at?: string;
  updated_at?: string | null;
  created_by?: number;
  updated_by?: number;
}

export interface CreatePublicServiceRequest {
  route_name: string;
  stops: Stop[];
  schedule: Schedule[];
  capacity: number;
  fare: number;
  vehicle_id?: number;
}

export interface UpdatePublicServiceRequest extends Partial<CreatePublicServiceRequest> {
  status?: 'active' | 'inactive' | 'maintenance' | 'cancelled';
}

export interface PublicServiceFilterOptions {
  route_name?: string;
  status?: 'active' | 'inactive' | 'maintenance' | 'cancelled';
  search?: string;
  page?: number;
  limit?: number;
}

export interface Ticket {
  ticket_id?: number;
  service_id: number;
  passenger_name: string;
  seat_number?: string;
  travel_date: string;
  fare_paid: number;
  user_id: number;
  booking_status?: 'booked' | 'cancelled' | 'completed';
  booking_time?: string;
  created_at?: string;
  updated_at?: string | null;
}

export interface CreateTicketRequest {
  service_id: number;
  passenger_name: string;
  seat_number?: string;
  travel_date: string;
  fare_paid: number;
  user_id: number;
}

export interface BookTicketRequest {
  service_id: number;
  passenger_name: string;
  travel_date: string;
  preferred_seat?: string;
  user_id: number;
}

export interface BookTicketResponse {
  ticket: Ticket;
  seat_assigned: string;
  booking_confirmation: string;
}

// Removed unused ApiResponse interface

export interface DeletePublicServiceResponse {
  message: string;
}

export interface PublicServiceStatsResponse {
  total_services: number;
  status_breakdown: {
    active: number;
    inactive: number;
    maintenance: number;
    cancelled: number;
  };
  avg_capacity: number;
  avg_fare: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

export interface TicketFilterOptions {
  skip?: number;
  limit?: number;
  service_id?: number;
  booking_status?: 'booked' | 'cancelled' | 'completed';
  user_id?: number;
  travel_date?: string;
}

export interface SeatDetail {
  seat_number: string;
  status: 'available' | 'booked';
  passenger_name: string | null;
  ticket_id: number | null;
}

export interface SeatAvailability {
  service_id: number;
  route_name: string;
  travel_date: string;
  total_seats: number;
  available_seats: number;
  booked_seats: number;
  seat_details: SeatDetail[];
}

export interface TimetableEntry {
  service_id: number;
  route_name: string;
  day_of_week: string;
  departure_time: string;
  arrival_time: string;
  is_active: boolean;
}

export interface PublicServiceStatistics {
  service_id: number;
  route_name: string;
  total_tickets_sold: number;
  total_revenue: number;
  average_occupancy: number;
  most_popular_times: string[];
}

class PublicServiceService {
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

  // Get all public services with pagination and filters (Authenticated users)
  async getPublicServices(filters: PublicServiceFilterOptions = {}): Promise<PublicService[]> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.route_name) params.append('route_name', filters.route_name);
    if (filters.status) params.append('status', filters.status);
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

    const response = await fetch(`${API_BASE_URL}/public-services/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<PublicService[]>(response);
  }

  // Get public services with advanced pagination and filtering
  async getPublicServicesWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: Omit<PublicServiceFilterOptions, 'page' | 'limit'> = {}
  ): Promise<PaginatedResponse<PublicService>> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(limit, 1), 100);
    
    const filterOptions: PublicServiceFilterOptions = {
      ...filters,
      page: validPage,
      limit: validLimit
    };
    
    const services = await this.getPublicServices(filterOptions);
    return { 
      data: services, 
      page: validPage, 
      limit: validLimit 
    };
  }

  // Get single public service by ID (Authenticated users)
  async getPublicServiceById(serviceId: number): Promise<PublicService> {
    const response = await fetch(`${API_BASE_URL}/public-services/${serviceId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PublicService>(response);
  }

  // Create new public service (Admin only)
  async createPublicService(serviceData: CreatePublicServiceRequest): Promise<PublicService> {
    if (!this.isCurrentUserAdmin()) {
      throw new Error('Only administrators can create public services');
    }

    const response = await fetch(`${API_BASE_URL}/public-services/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });

    return this.handleResponse<PublicService>(response);
  }

  // Update public service (Admin only)
  async updatePublicService(serviceId: number, serviceData: UpdatePublicServiceRequest): Promise<PublicService> {
    if (!this.isCurrentUserAdmin()) {
      throw new Error('Only administrators can update public services');
    }

    const response = await fetch(`${API_BASE_URL}/public-services/${serviceId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });

    return this.handleResponse<PublicService>(response);
  }

  // Delete public service (Admin only)
  async deletePublicService(serviceId: number): Promise<null> {
    if (!this.isCurrentUserAdmin()) {
      throw new Error('Only administrators can delete public services');
    }

    const response = await fetch(`${API_BASE_URL}/public-services/${serviceId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<null>(response);
  }

  // Update public service status
  async updatePublicServiceStatus(serviceId: number, newStatus: string): Promise<PublicService> {
    try {
      const response = await fetch(`${API_BASE_URL}/public-services/${serviceId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ new_status: newStatus }),
      });

      return this.handleResponse<PublicService>(response);
    } catch (error) {
      console.error(`Error updating status for service ${serviceId}:`, error);
      throw error;
    }
  }

  // Get active public services only (Public)
  async getActivePublicServices(): Promise<PublicService[]> {
    return this.getPublicServices({ status: 'active' });
  }

  // Search public services by criteria
  async searchPublicServices(searchTerm: string): Promise<PublicService[]> {
    return this.getPublicServices({ search: searchTerm });
  }

  // Get public services count with filters
  async getPublicServicesCount(filters: Omit<PublicServiceFilterOptions, 'page' | 'limit'> = {}): Promise<number> {
    const services = await this.getPublicServices(filters);
    return services.length;
  }

  // Create a new ticket for a public service
  async createTicket(ticketData: CreateTicketRequest): Promise<Ticket> {
    const response = await fetch(`${API_BASE_URL}/public-services/tickets/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(ticketData),
    });

    return this.handleResponse<Ticket>(response);
  }

  // Book a ticket with automatic seat assignment
  async bookTicketWithAutomaticSeatAssignment(bookTicketData: BookTicketRequest): Promise<BookTicketResponse> {
    const response = await fetch(`${API_BASE_URL}/public-services/book-ticket`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bookTicketData),
    });

    return this.handleResponse<BookTicketResponse>(response);
  }

  // Get all tickets for a specific service
  async getServiceTickets(serviceId: number): Promise<Ticket[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/public-services/${serviceId}/tickets`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<Ticket[]>(response);
    } catch (error) {
      console.error(`Error fetching tickets for service ${serviceId}:`, error);
      throw error;
    }
  }

  // Get a specific ticket by ID
  async getTicketById(ticketId: number): Promise<Ticket> {
    const response = await fetch(`${API_BASE_URL}/public-services/tickets/${ticketId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Ticket>(response);
  }

  // Get all tickets with optional filters
  async getTickets(filters: TicketFilterOptions = {}): Promise<Ticket[]> {
    const params = new URLSearchParams();
    
    // Add pagination parameters
    if (filters.skip !== undefined && filters.skip >= 0) {
      params.append('skip', filters.skip.toString());
    }
    
    if (filters.limit !== undefined) {
      const limit = Math.min(Math.max(filters.limit, 1), 100);
      params.append('limit', limit.toString());
    } else {
      params.append('limit', '100');
    }
    
    // Add filters
    if (filters.service_id !== undefined) {
      params.append('service_id', filters.service_id.toString());
    }
    
    if (filters.booking_status) {
      params.append('booking_status', filters.booking_status);
    }
    
    if (filters.user_id !== undefined) {
      params.append('user_id', filters.user_id.toString());
    }
    
    if (filters.travel_date) {
      params.append('travel_date', filters.travel_date);
    }

    const response = await fetch(`${API_BASE_URL}/public-services/tickets/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Ticket[]>(response);
  }

  // Update a ticket
  async updateTicket(ticketId: number, ticketData: Partial<Ticket>): Promise<Ticket> {
    const response = await fetch(`${API_BASE_URL}/public-services/tickets/${ticketId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(ticketData),
    });

    return this.handleResponse<Ticket>(response);
  }

  // Delete/cancel a ticket
  async deleteTicket(ticketId: number): Promise<Ticket> {
    const response = await fetch(`${API_BASE_URL}/public-services/tickets/${ticketId}/cancel`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Ticket>(response);
  }

  // Cancel a ticket
  async cancelTicket(ticketId: number): Promise<Ticket> {
    const response = await fetch(`${API_BASE_URL}/public-services/tickets/${ticketId}/cancel`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Ticket>(response);
  }

  // Get all tickets for the current user
  async getUserTickets(): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE_URL}/public-services/tickets/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Ticket[]>(response);
  }

  // Get tickets for a specific user by user ID
  async getTicketsByUserId(userId: number, filters: TicketFilterOptions = {}): Promise<Ticket[]> {
    const params = new URLSearchParams();
    
    // Add pagination parameters
    if (filters.skip !== undefined && filters.skip >= 0) {
      params.append('skip', filters.skip.toString());
    } else {
      params.append('skip', '0');
    }
    
    if (filters.limit !== undefined) {
      const limit = Math.min(Math.max(filters.limit, 1), 100);
      params.append('limit', limit.toString());
    } else {
      params.append('limit', '100');
    }
    
    // Add other filters if provided
    if (filters.service_id !== undefined) {
      params.append('service_id', filters.service_id.toString());
    }
    
    if (filters.booking_status) {
      params.append('booking_status', filters.booking_status);
    }
    
    if (filters.travel_date) {
      params.append('travel_date', filters.travel_date);
    }

    const response = await fetch(`${API_BASE_URL}/public-services/user/${userId}/tickets?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Ticket[]>(response);
  }

  // Search tickets by passenger name
  async searchTickets(searchTerm: string): Promise<Ticket[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/public-services/tickets/search?search=${searchTerm}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<Ticket[]>(response);
    } catch (error) {
      console.error(`Error searching tickets:`, error);
      throw error;
    }
  }

  // Get seat availability for a service on a specific date
  async getSeatAvailability(serviceId: number, travelDate: string): Promise<SeatAvailability> {
    const params = new URLSearchParams();
    params.append('travel_date', travelDate);
    
    const response = await fetch(`${API_BASE_URL}/public-services/${serviceId}/availability?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<SeatAvailability>(response);
  }

  // Search routes by route name
  async searchRoutesByRouteName(routeName: string): Promise<PublicService[]> {
    const params = new URLSearchParams();
    params.append('route_name', routeName);
    
    const response = await fetch(`${API_BASE_URL}/public-services/search/routes?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PublicService[]>(response);
  }

  // Get timetable for a service
  async getTimetable(serviceId: number): Promise<TimetableEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/public-services/${serviceId}/timetable`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      // Handle different response scenarios
      if (!response.ok) {
        if (response.status === 404) {
          // If timetable not found, return empty array instead of throwing error
          console.warn(`Timetable not found for service ${serviceId}`);
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Handle both direct array responses and wrapped responses
      return Array.isArray(result) ? result : (result.data || []);
    } catch (error: unknown) {
      console.error(`Error fetching timetable for service ${serviceId}:`, error);
      // Return empty array instead of throwing error to prevent UI crash
      // But show a warning in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Timetable feature may not be implemented in the backend API');
      }
      return [];
    }
  }

  // Get service statistics including revenue and occupancy
  async getServiceStatistics(serviceId: number): Promise<PublicServiceStatistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/public-services/${serviceId}/statistics`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error(`Error fetching statistics for service ${serviceId}:`, error);
      throw error;
    }
  }

  // Create trip from public service
  async createTripFromService(serviceId: number, departureDate: string): Promise<string> {
    const params = new URLSearchParams();
    params.append('departure_date', departureDate);
    
    const response = await fetch(`${API_BASE_URL}/public-services/${serviceId}/create-trip?${params.toString()}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const result = await this.handleResponse<{ message: string }>(response);
    return result.message;
  }

  // Validate public service data before sending to API
  validatePublicServiceData(serviceData: CreatePublicServiceRequest | UpdatePublicServiceRequest): string[] {
    const errors: string[] = [];

    if ('route_name' in serviceData && (!serviceData.route_name || serviceData.route_name.trim() === '')) {
      errors.push('Route name is required');
    }

    if ('stops' in serviceData && (!serviceData.stops || serviceData.stops.length === 0)) {
      errors.push('At least one stop is required');
    }

    if ('schedule' in serviceData && (!serviceData.schedule || serviceData.schedule.length === 0)) {
      errors.push('At least one schedule entry is required');
    }

    if ('capacity' in serviceData && (!serviceData.capacity || serviceData.capacity <= 0)) {
      errors.push('Capacity must be greater than 0');
    }

    if ('fare' in serviceData && (!serviceData.fare || serviceData.fare <= 0)) {
      errors.push('Fare must be greater than 0');
    }

    return errors;
  }
}

// Export singleton instance
export const publicService = new PublicServiceService();
export default publicService;