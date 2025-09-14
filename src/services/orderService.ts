// Order Management API Service
// This file contains all API calls for transport order management functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Order {
  id?: number;
  pickup_location: string;
  drop_location: string;
  cargo_type: "general" | "fragile" | "hazardous" | "perishable" | "liquid" | "bulk";
  cargo_weight: number;
  cargo_description: string;
  pickup_time: string; // ISO datetime string
  estimated_delivery_time: string; // ISO datetime string
  total_amount: number;
  customer_id?: number;
  vehicle_id?: number | null;
  driver_id?: number | null;
  status?: "pending" | "confirmed" | "assigned" | "in_progress" | "completed" | "cancelled";
  actual_delivery_time?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

interface CreateOrderRequest {
  pickup_location: string;
  drop_location: string;
  cargo_type: "general" | "fragile" | "hazardous" | "perishable" | "liquid" | "bulk";
  cargo_weight: number;
  cargo_description: string;
  pickup_time: string;
  estimated_delivery_time: string;
  total_amount: number;
}

interface UpdateOrderRequest {
  pickup_location?: string;
  drop_location?: string;
  cargo_type?: "general" | "fragile" | "hazardous" | "perishable" | "liquid" | "bulk";
  cargo_weight?: number;
  cargo_description?: string;
  pickup_time?: string;
  estimated_delivery_time?: string;
  total_amount?: number;
  vehicle_id?: number | null;
  driver_id?: number | null;
  status?: "pending" | "confirmed" | "assigned" | "in_progress" | "completed" | "cancelled";
  actual_delivery_time?: string | null;
}

// Removed unused ApiResponse interface

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

interface FilterOptions {
  status?: string;
  cargo_type?: string;
  customer_id?: number;
  driver_id?: number;
  vehicle_id?: number;
  search?: string;
  page?: number;
  limit?: number;
  date_from?: string;
  date_to?: string;
}

interface OrderAnalytics {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_orders: number;
    completed_orders: number;
    total_revenue: number;
    average_order_value: number;
    completion_rate: number;
  };
  by_status: {
    status: string;
    count: number;
  }[];
  by_cargo_type: {
    cargo_type: string;
    count: number;
  }[];
}

interface OrderStats {
  total_orders: number;
  pending_orders: number;
  assigned_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  recent_orders_7_days: number;
  average_delivery_time_hours: number;
  completion_rate: number;
}

interface OrderRevenue {
  period: {
    start_date: string;
    end_date: string;
  };
  total_revenue: number;
  revenue_by_status: {
    status: string;
    revenue: number;
  }[];
  revenue_by_cargo_type: {
    cargo_type: string;
    revenue: number;
  }[];
  daily_revenue_trend: {
    date: string;
    revenue: number;
  }[];
}

// Add the new interface for popular routes
interface PopularRoute {
  pickup_location: string;
  drop_location: string;
  order_count: number;
  total_revenue: number;
  average_revenue: number;
}

class OrderService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
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

  // Create a new transport order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    return this.handleResponse<Order>(response);
  }

  // Get all orders with pagination and filters
  async getOrders(filters: FilterOptions = {}): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.cargo_type) params.append('cargo_type', filters.cargo_type);
    if (filters.customer_id) params.append('customer_id', filters.customer_id.toString());
    if (filters.driver_id) params.append('driver_id', filters.driver_id.toString());
    if (filters.vehicle_id) params.append('vehicle_id', filters.vehicle_id.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    
    // Add pagination parameters
    if (filters.page && filters.page > 0) {
      const skip = (filters.page - 1) * (filters.limit || 10);
      params.append('skip', skip.toString());
    }
    
    if (filters.limit) {
      const limit = Math.min(Math.max(filters.limit, 1), 100);
      params.append('limit', limit.toString());
    } else {
      params.append('limit', '10');
    }

    const response = await fetch(`${API_BASE_URL}/orders/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    const orders = await this.handleResponse<Order[]>(response);
    return { data: orders };
  }

  // Get a specific order by ID
  async getOrderById(orderId: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Order>(response);
  }

  // Update an existing order
  async updateOrder(orderId: number, orderData: UpdateOrderRequest): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    return this.handleResponse<Order>(response);
  }

  // Delete an order
  async deleteOrder(orderId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
  }

  // Assign a driver to an order
  async assignDriver(orderId: number, driverId: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/assign-driver`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ driver_id: driverId }),
    });

    return this.handleResponse<Order>(response);
  }

  // Assign a vehicle to an order
  async assignVehicle(orderId: number, vehicleId: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/assign-vehicle`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ vehicle_id: vehicleId }),
    });

    return this.handleResponse<Order>(response);
  }

  // Assign both vehicle and driver to an order (Admin only)
  async assignVehicleAndDriver(orderId: number, vehicleId: number, driverId: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/assign`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        vehicle_id: vehicleId,
        driver_id: driverId 
      }),
    });

    return this.handleResponse<Order>(response);
  }

  // Update order status
  async updateOrderStatus(orderId: number, status: Order['status']): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status?status_update=${status}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Order>(response);
  }

  // Approve a pending order (Admin only)
  async approveOrder(orderId: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/approve`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Order>(response);
  }

  // Reject a pending order (Admin only)
  async rejectOrder(orderId: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/reject`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Order>(response);
  }

  // Cancel an order (Available to both customers and admins)
  async cancelOrder(orderId: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Order>(response);
  }

  // Complete an order (Available to drivers and admins)
  async completeOrder(orderId: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/complete`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Order>(response);
  }

  // Get orders by status
  async getOrdersByStatus(status: Order['status'], filters: Omit<FilterOptions, 'status'> = {}): Promise<Order[]> {
    const orderFilters: FilterOptions = { ...filters, status };
    const result = await this.getOrders(orderFilters);
    return result.data;
  }

  // Get pending orders
  async getPendingOrders(filters: Omit<FilterOptions, 'status'> = {}): Promise<Order[]> {
    return this.getOrdersByStatus('pending', filters);
  }

  // Get active orders (confirmed, assigned, in_progress)
  async getActiveOrders(filters: Omit<FilterOptions, 'status'> = {}): Promise<Order[]> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.cargo_type) params.append('cargo_type', filters.cargo_type);
    if (filters.customer_id) params.append('customer_id', filters.customer_id.toString());
    if (filters.driver_id) params.append('driver_id', filters.driver_id.toString());
    if (filters.vehicle_id) params.append('vehicle_id', filters.vehicle_id.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    
    // Add multiple status values
    params.append('status', 'confirmed');
    params.append('status', 'assigned');
    params.append('status', 'in_progress');
    
    if (filters.limit) {
      const limit = Math.min(Math.max(filters.limit, 1), 100);
      params.append('limit', limit.toString());
    }

    const response = await fetch(`${API_BASE_URL}/orders/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<Order[]>(response);
  }

  // Get completed orders
  async getCompletedOrders(filters: Omit<FilterOptions, 'status'> = {}): Promise<Order[]> {
    return this.getOrdersByStatus('completed', filters);
  }

  // Get orders for a specific customer
  async getCustomerOrders(customerId: number, filters: Omit<FilterOptions, 'customer_id'> = {}): Promise<Order[]> {
    const orderFilters: FilterOptions = { ...filters, customer_id: customerId };
    const result = await this.getOrders(orderFilters);
    return result.data;
  }

  // Get orders for a specific driver
  async getDriverOrders(driverId: number, filters: Omit<FilterOptions, 'driver_id'> = {}): Promise<Order[]> {
    const orderFilters: FilterOptions = { ...filters, driver_id: driverId };
    const result = await this.getOrders(orderFilters);
    return result.data;
  }

  // Get order analytics data (Admin only)
  async getOrderAnalytics(startDate?: string, endDate?: string): Promise<OrderAnalytics> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`${API_BASE_URL}/orders/analytics?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<OrderAnalytics>(response);
  }

  // Get order statistics (Admin only)
  async getOrderStats(): Promise<OrderStats> {
    const response = await fetch(`${API_BASE_URL}/orders/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<OrderStats>(response);
  }

  // Get revenue analytics (Admin only)
  async getOrderRevenue(startDate?: string, endDate?: string): Promise<OrderRevenue> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`${API_BASE_URL}/orders/revenue?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<OrderRevenue>(response);
  }

  // Get popular routes based on order frequency (Admin only)
  async getPopularRoutes(limit: number = 10): Promise<PopularRoute[]> {
    // Ensure limit is between 1 and 50 as per API specification
    const validatedLimit = Math.min(Math.max(limit, 1), 50);
    const params = new URLSearchParams();
    params.append('limit', validatedLimit.toString());

    const response = await fetch(`${API_BASE_URL}/orders/routes/popular?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PopularRoute[]>(response);
  }
}

// Export singleton instance
export const orderService = new OrderService();

// Export types for use in components
export type { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderRequest, 
  FilterOptions as OrderFilterOptions,
  PaginatedResponse as OrderPaginatedResponse,
  OrderAnalytics,
  OrderStats,
  OrderRevenue,
  PopularRoute // Export the new interface
};