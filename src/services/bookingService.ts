// Booking Management API Service
// This file contains all API calls for truck and public service booking functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Booking interfaces based on the API specification
export interface Booking {
  booking_id: number;
  source: string;
  destination: string;
  service_type: "cargo" | "passenger" | "public";
  price: number;
  user_id: number;
  truck_id: number;
  booking_status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface CreateBookingRequest {
  source: string;
  destination: string;
  service_type: "cargo" | "passenger" | "public";
  price: number;
  user_id: number;
}

export interface UpdateBookingRequest {
  source?: string;
  destination?: string;
  service_type?: "cargo" | "passenger" | "public";
  price?: number;
  booking_status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
}

export interface UpdateBookingStatusRequest {
  booking_status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
}

export interface Dispatch {
  dispatch_id: number;
  booking_id: number;
  assigned_driver: number | null;
  dispatch_time: string | null;
  arrival_time: string | null;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface BookingWithDispatch {
  booking: Booking;
  dispatch: Dispatch | null;
}

export interface BookingAnalyticsPeriod {
  start_date: string;
  end_date: string;
}

export interface BookingAnalyticsSummary {
  total_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  average_booking_value: number;
  completion_rate: number;
}

export interface BookingStatusCount {
  status: string;
  count: number;
}

export interface BookingServiceTypeCount {
  service_type: string;
  count: number;
}

export interface BookingAnalytics {
  period: BookingAnalyticsPeriod;
  summary: BookingAnalyticsSummary;
  by_status: BookingStatusCount[];
  by_service_type: BookingServiceTypeCount[];
}

export interface BookingRevenueByStatus {
  status: string;
  revenue: number;
}

export interface BookingRevenueByServiceType {
  service_type: string;
  revenue: number;
}

export interface BookingDailyRevenueTrend {
  date: string;
  revenue: number;
}

export interface BookingRevenue {
  period: BookingAnalyticsPeriod;
  total_revenue: number;
  revenue_by_status: BookingRevenueByStatus[];
  revenue_by_service_type: BookingRevenueByServiceType[];
  daily_revenue_trend: BookingDailyRevenueTrend[];
}

export interface BookingPeakHour {
  hour: number;
  booking_count: number;
}

export interface BookingPeakDay {
  day: string;
  booking_count: number;
}

export interface BookingHourlyDistribution {
  hour: number;
  booking_count: number;
}

export interface BookingDailyDistribution {
  day: string;
  booking_count: number;
}

export interface BookingPeakHours {
  period: BookingAnalyticsPeriod;
  peak_hour: BookingPeakHour;
  peak_day: BookingPeakDay;
  hourly_distribution: BookingHourlyDistribution[];
  daily_distribution: BookingDailyDistribution[];
}

export interface BookingFilterOptions {
  booking_status?: string;
  service_type?: string;
  user_id?: number;
  truck_id?: number;
  search?: string;
  page?: number;
  limit?: number;
  date_from?: string;
  date_to?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

// Removed unused ApiResponse interface

class BookingService {
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
      let errorData: unknown;
      
      // Try to parse the error response
      try {
        errorData = await response.json();
        console.error('API Error Response:', errorData);
      } catch (parseError) {
        // If JSON parsing fails, use status-based error
        console.error('Failed to parse error response:', parseError);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Handle FastAPI validation errors (422)
      if (response.status === 422 && errorData && typeof errorData === 'object' && 'detail' in errorData && Array.isArray((errorData as { detail: unknown }).detail)) {
        const validationErrors = (errorData as { detail: Array<{ loc?: string[]; msg: string }> }).detail.map((error) => {
          const field = error.loc ? error.loc.join('.') : 'unknown';
          return `${field}: ${error.msg}`;
        }).join(', ');
        throw new Error(`Validation error: ${validationErrors}`);
      }
      
      // Handle other error formats
      if (errorData && typeof errorData === 'object' && 'detail' in errorData) {
        const detail = (errorData as { detail: unknown }).detail;
        if (typeof detail === 'string') {
          throw new Error(detail);
        } else if (typeof detail === 'object') {
          throw new Error(`API Error: ${JSON.stringify(detail)}`);
        }
      }
      
      // Fallback to generic message with status
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Create a new booking for truck or public service
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    console.log('Creating booking with data:', bookingData);
    
    const response = await fetch(`${API_BASE_URL}/bookings/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });

    console.log('Create booking response status:', response.status);
    return this.handleResponse<Booking>(response);
  }

  // Get all bookings with pagination and filters
  async getBookings(filters: BookingFilterOptions = {}): Promise<PaginatedResponse<Booking>> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.booking_status) params.append('booking_status', filters.booking_status);
    if (filters.service_type) params.append('service_type', filters.service_type);
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.truck_id) params.append('truck_id', filters.truck_id.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    
    // Add pagination parameters (API uses skip/limit, not page/limit)
    if (filters.page && filters.page > 0) {
      const skip = (filters.page - 1) * (filters.limit || 10);
      params.append('skip', skip.toString());
    } else {
      params.append('skip', '0');
    }
    
    if (filters.limit) {
      const limit = Math.min(Math.max(filters.limit, 1), 100);
      params.append('limit', limit.toString());
    } else {
      params.append('limit', '100');
    }

    const response = await fetch(`${API_BASE_URL}/bookings/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    const bookings = await this.handleResponse<Booking[]>(response);
    return { data: bookings };
  }

  // Get a specific booking by ID
  async getBookingById(bookingId: number): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Booking>(response);
  }

  // Update an existing booking
  async updateBooking(bookingId: number, bookingData: UpdateBookingRequest): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });

    return this.handleResponse<Booking>(response);
  }

  // Delete a booking
  async deleteBooking(bookingId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // API may return empty response on successful deletion
    const result = await response.text();
    return result ? JSON.parse(result) : { message: 'Booking deleted successfully' };
  }
  // Update booking status (new API format)
  async updateBookingStatus(bookingId: number, status: Booking['booking_status']): Promise<Booking> {
    const requestBody: UpdateBookingStatusRequest = {
      booking_status: status
    };

    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<Booking>(response);
  }

  // Cancel a booking (using DELETE method as per API spec)
  async cancelBooking(bookingId: number): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Booking>(response);
  }

  // Get bookings for current user
  async getUserBookings(): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/bookings/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Booking[]>(response);
  }

  // Get bookings for a specific user with pagination (Admin only)
  async getBookingsByUserId(userId: number, skip: number = 0, limit: number = 100): Promise<Booking[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', Math.min(Math.max(limit, 1), 100).toString());

    const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Booking[]>(response);
  }

  // Get bookings by status with pagination
  async getBookingsByStatus(status: Booking['booking_status'], skip: number = 0, limit: number = 100): Promise<Booking[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', Math.min(Math.max(limit, 1), 100).toString());

    const response = await fetch(`${API_BASE_URL}/bookings/status/${status}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Booking[]>(response);
  }

  // Confirm a booking (dedicated endpoint)
  async confirmBooking(bookingId: number): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/confirm`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Booking>(response);
  }

  // Complete a booking (dedicated endpoint)
  async completeBooking(bookingId: number): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/complete`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Booking>(response);
  }

  // Get pending bookings (legacy method for backward compatibility)
  async getPendingBookings(filters: Omit<BookingFilterOptions, 'booking_status'> = {}): Promise<Booking[]> {
    const bookingFilters: BookingFilterOptions = { ...filters, booking_status: 'pending' };
    const result = await this.getBookings(bookingFilters);
    return result.data;
  }

  // Get confirmed bookings (legacy method for backward compatibility)
  async getConfirmedBookings(filters: Omit<BookingFilterOptions, 'booking_status'> = {}): Promise<Booking[]> {
    const bookingFilters: BookingFilterOptions = { ...filters, booking_status: 'confirmed' };
    const result = await this.getBookings(bookingFilters);
    return result.data;
  }

  // Get cancelled bookings (legacy method for backward compatibility)
  async getCancelledBookings(filters: Omit<BookingFilterOptions, 'booking_status'> = {}): Promise<Booking[]> {
    const bookingFilters: BookingFilterOptions = { ...filters, booking_status: 'cancelled' };
    const result = await this.getBookings(bookingFilters);
    return result.data;
  }

  // Get active bookings (confirmed, in_progress)
  async getActiveBookings(filters: Omit<BookingFilterOptions, 'booking_status'> = {}): Promise<Booking[]> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.service_type) params.append('service_type', filters.service_type);
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.truck_id) params.append('truck_id', filters.truck_id.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    
    // Add multiple status values
    params.append('booking_status', 'confirmed');
    params.append('booking_status', 'in_progress');
    
    if (filters.limit) {
      const limit = Math.min(Math.max(filters.limit, 1), 100);
      params.append('limit', limit.toString());
    }

    const response = await fetch(`${API_BASE_URL}/bookings/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<Booking[]>(response);
  }

  // Get booking analytics data
  async getBookingAnalytics(startDate?: string, endDate?: string): Promise<BookingAnalytics> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`${API_BASE_URL}/bookings/analytics${params.toString() ? '?' + params.toString() : ''}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BookingAnalytics>(response);
  }

  // Get booking revenue data
  async getBookingRevenue(startDate?: string, endDate?: string): Promise<BookingRevenue> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`${API_BASE_URL}/bookings/revenue${params.toString() ? '?' + params.toString() : ''}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BookingRevenue>(response);
  }

  // Get booking peak hours data
  async getBookingPeakHours(startDate?: string, endDate?: string): Promise<BookingPeakHours> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`${API_BASE_URL}/bookings/peak-hours${params.toString() ? '?' + params.toString() : ''}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BookingPeakHours>(response);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Get booking with dispatch information
  async getBookingWithDispatch(bookingId: number): Promise<BookingWithDispatch> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/with-dispatch`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BookingWithDispatch>(response);
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
export const bookingService = new BookingService();