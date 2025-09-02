// User Management API Service
// This file contains all API calls for user management functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "customer" | "public_service_manager";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  avatar?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

interface FilterOptions {
  role?: string;
  is_active?: boolean; // Changed from 'status' to match API parameter
  search?: string;
  page?: number;
  limit?: number;
}

class UserService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Admin Login
  async login(username: string, password: string): Promise<{ access_token: string; user: User }> {
    // Create form data for x-www-form-urlencoded as expected by your backend
    const formBody = new URLSearchParams();
    formBody.append('username', username);
    formBody.append('password', password);
    formBody.append('grant_type', '');
    formBody.append('scope', '');
    formBody.append('client_id', '');
    formBody.append('client_secret', '');

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString()
    });

    const data = await this.handleResponse<{ access_token: string; user: User }>(response);
    localStorage.setItem('access_token', data.access_token);
    return data;
  }

  // Get all users with pagination and filters (Admin only)
  async getUsers(filters: FilterOptions = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    
    // Add role filter
    if (filters.role) params.append('role', filters.role);
    
    // Add status filter (is_active)
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    
    // Add search filter
    if (filters.search) params.append('search', filters.search);
    
    // Add pagination parameters
    if (filters.page && filters.page > 0) {
      const skip = (filters.page - 1) * (filters.limit || 10);
      params.append('skip', skip.toString());
    }
    
    // Add limit with validation (max 100 as per API)
    if (filters.limit) {
      const limit = Math.min(Math.max(filters.limit, 1), 100); // Ensure between 1 and 100
      params.append('limit', limit.toString());
    } else {
      params.append('limit', '10'); // Default limit
    }

    const response = await fetch(`${API_BASE_URL}/users/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    const users = await this.handleResponse<User[]>(response);
    return { data: users };
  }

  // Get users with advanced pagination and filtering
  async getUsersWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: Omit<FilterOptions, 'page' | 'limit'> = {}
  ): Promise<PaginatedResponse<User>> {
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(limit, 1), 100);
    
    const filterOptions: FilterOptions = {
      ...filters,
      page: validPage,
      limit: validLimit
    };
    
    return this.getUsers(filterOptions);
  }

  // Get total count of users for pagination
  async getUsersCount(filters: Omit<FilterOptions, 'page' | 'limit'> = {}): Promise<number> {
    const params = new URLSearchParams();
    
    if (filters.role) params.append('role', filters.role);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.search) params.append('search', filters.search);
    
    // Set a high limit to get all users for counting
    params.append('limit', '1000');
    params.append('skip', '0');

    const response = await fetch(`${API_BASE_URL}/users/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    const users = await this.handleResponse<User[]>(response);
    return users.length;
  }

  // Get all customers (Admin only)
  async getCustomers(skip: number = 0, limit: number = 100): Promise<User[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/users/customers?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<User[]>(response);
  }

  // Get all transporters (Admin only)
  async getTransporters(skip: number = 0, limit: number = 100): Promise<User[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/users/transporters?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<User[]>(response);
  }

  // Get all drivers (Admin only)
  async getDrivers(skip: number = 0, limit: number = 100): Promise<User[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/users/drivers?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<User[]>(response);
  }

  // Get drivers with advanced pagination and filtering
  async getDriversWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: Omit<FilterOptions, 'page' | 'limit'> = {}
  ): Promise<PaginatedResponse<User>> {
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(limit, 1), 100);
    
    const skip = (validPage - 1) * validLimit;
    
    const drivers = await this.getDrivers(skip, validLimit);
    return { 
      data: drivers, 
      page: validPage, 
      limit: validLimit 
    };
  }

  // Get total count of drivers for pagination
  async getDriversCount(): Promise<number> {
    try {
      // Use a reasonable limit instead of 1000 to avoid 422 errors
      const drivers = await this.getDrivers(0, 100);
      return drivers.length;
    } catch (error) {
      console.error('Error getting drivers count:', error);
      // Return 0 if we can't get the count, but don't break the page
      return 0;
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  // Get single user by ID
  async getUserById(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  // Create new user
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse<User>(response);
  }

  // Update user
  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse<User>(response);
  }

  // Change user role
  async changeUserRole(userId: number, role: string): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    return this.handleResponse<ApiResponse<User>>(response);
  }

  // Activate/Deactivate user
  async toggleUserStatus(userId: number, isActive: boolean): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/activate`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_active: isActive }),
    });

    return this.handleResponse<ApiResponse<User>>(response);
  }

  // Delete user
  async deleteUser(userId: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ApiResponse<null>>(response);
  }

  // Delete user (Admin only) - New method for the specific endpoint
  async deleteUserById(userId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  }

  // Reset user password
  async resetUserPassword(userId: number): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ApiResponse<{ message: string }>>(response);
  }

  // Change current user password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    const params = new URLSearchParams();
    params.append('current_password', currentPassword);
    params.append('new_password', newPassword);

    const response = await fetch(`${API_BASE_URL}/users/me/password?${params.toString()}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ApiResponse<{ message: string }>>(response);
  }

  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Get current user token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get current user profile from localStorage
  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Check if current user is admin
  isCurrentUserAdmin(): boolean {
    const currentUser = this.getCurrentUserFromStorage();
    return currentUser?.role === 'admin';
  }
}

// Export singleton instance
export const userService = new UserService();
export type { User, ApiResponse, PaginatedResponse, FilterOptions };
