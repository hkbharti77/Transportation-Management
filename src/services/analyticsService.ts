// Comprehensive Analytics Service
// This service aggregates analytics data from multiple backend services

import { orderService } from './orderService';
import { fleetService } from './fleetService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Comprehensive analytics interface combining all services
export interface OverallAnalytics {
  totalRevenue: number;
  totalBookings: number;
  totalOrders: number;
  totalTrips: number;
  activeFleets: number;
  totalDrivers: number;
  totalVehicles: number;
  totalCustomers: number;
  monthlyGrowth: number;
  customerSatisfaction: number;
  avgDeliveryTime: number;
  profitMargin: number;
  revenueGrowth: number;
  bookingGrowth: number;
  monthlyData: { month: string; revenue: number; bookings: number; orders: number }[];
  topRoutes: { route: string; count: number; revenue: number }[];
  performanceMetrics: {
    onTimeDelivery: number;
    customerRetention: number;
    averageRating: number;
    totalReviews: number;
  };
}

export interface BookingAnalytics {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  confirmationRate: number;
  cancellationRate: number;
  topRoutes: { route: string; bookingCount: number; revenue: number }[];
  paymentAnalysis: { method: string; count: number; revenue: number }[];
  monthlyTrends: { month: string; bookings: number; revenue: number }[];
  customerSatisfaction: {
    averageRating: number;
    totalReviews: number;
    repeatCustomers: number;
  };
  peakHours: { hour: string; bookings: number }[];
}

export interface FleetAnalytics {
  totalFleets: number;
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  totalDrivers: number;
  availableDrivers: number;
  busyDrivers: number;
  utilization: {
    vehicleUtilization: number;
    driverUtilization: number;
    fleetEfficiency: number;
  };
  maintenance: {
    scheduled: number;
    overdue: number;
    completed: number;
  };
}

// New Analytics Interfaces based on API endpoints
export interface ServiceSummaryAnalytics {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_services: number;
    total_cost: number;
    average_duration_minutes: number;
  };
  by_status: Array<{
    status: string;
    count: number;
  }>;
  by_type: Array<{
    type: string;
    count: number;
  }>;
}

export interface VehicleMaintenanceAnalytics {
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
}

export interface PartsInventoryAnalytics {
  summary: {
    total_parts: number;
    total_inventory_value: number;
  };
  by_status: Array<{
    status: string;
    count: number;
    value: number;
  }>;
  by_category: Array<{
    category: string;
    count: number;
    total_stock: number;
  }>;
  low_stock_alerts: Array<{
    part_id: number;
    part_name: string;
    current_stock: number;
    minimum_stock: number;
    category: string;
  }>;
}

export interface MaintenanceScheduleAnalytics {
  period_days: number;
  total_upcoming_services: number;
  services_by_date: Record<string, Array<{
    service_id: number;
    vehicle_id: number;
    service_type: string;
    description: string;
    priority: string;
    estimated_duration: number;
    cost: number;
  }>>;
  maintenance_schedules: Array<{
    schedule_id: number;
    vehicle_id: number;
    service_type: string;
    scheduled_date: string;
    priority: string;
    estimated_duration: number;
    cost: number;
  }>;
}

export interface ServiceCostAnalytics {
  period: {
    start_date: string;
    end_date: string;
  };
  group_by: string;
  total_cost: number;
  total_services: number;
  cost_breakdown: Array<{
    period: string;
    total_cost: number;
    service_count: number;
    average_cost: number;
  }>;
}

class AnalyticsService {
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

  // Get comprehensive analytics combining data from all services
  async getOverallAnalytics(startDate?: string, endDate?: string): Promise<OverallAnalytics> {
    try {
      // Fetch data from multiple services in parallel
      const [
        orderStats,
        orderAnalytics,
        orderRevenue,
        // userStats,
        // fleetSummary,
        // tripStats
      ] = await Promise.allSettled([
        orderService.getOrderStats(),
        orderService.getOrderAnalytics(startDate, endDate),
        orderService.getOrderRevenue(startDate, endDate),
        // userService.getUserStats?.() || Promise.resolve(null),
        // fleetService.getFleetSummary?.() || Promise.resolve(null),
        // tripService.getTripStats?.() || Promise.resolve(null)
      ]);

      // Extract successful results
      const orderStatsData = orderStats.status === 'fulfilled' ? orderStats.value : null;
      const orderAnalyticsData = orderAnalytics.status === 'fulfilled' ? orderAnalytics.value : null;
      const orderRevenueData = orderRevenue.status === 'fulfilled' ? orderRevenue.value : null;

      // If no backend data available, return mock data
      if (!orderStatsData && !orderAnalyticsData && !orderRevenueData) {
        return this.getMockOverallAnalytics();
      }

      // Combine real backend data
      const analytics: OverallAnalytics = {
        totalRevenue: orderRevenueData?.total_revenue || 0,
        totalBookings: orderStatsData?.total_orders || 0, // Using orders as bookings for now
        totalOrders: orderStatsData?.total_orders || 0,
        totalTrips: orderStatsData?.completed_orders || 0,
        activeFleets: 12, // TODO: Get from fleet service
        totalDrivers: 156, // TODO: Get from user service  
        totalVehicles: 89, // TODO: Get from fleet service
        totalCustomers: 2341, // TODO: Get from user service
        monthlyGrowth: 18.5, // TODO: Calculate from historical data
        customerSatisfaction: 4.6, // TODO: Get from reviews/ratings
        avgDeliveryTime: orderStatsData?.average_delivery_time_hours || 2.4,
        profitMargin: 22.8, // TODO: Calculate from cost/revenue data
        revenueGrowth: 15.2, // TODO: Calculate from historical data
        bookingGrowth: 12.7, // TODO: Calculate from historical data
        monthlyData: this.transformDailyToMonthly(orderRevenueData?.daily_revenue_trend || []),
        topRoutes: await this.getTopRoutesFormatted(),
        performanceMetrics: {
          onTimeDelivery: orderStatsData?.completion_rate || 94.2,
          customerRetention: 87.5, // TODO: Calculate from user data
          averageRating: 4.6, // TODO: Get from reviews
          totalReviews: 2156 // TODO: Get from reviews
        }
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching backend analytics, falling back to mock data:', error);
      return this.getMockOverallAnalytics();
    }
  }

  // Get booking-specific analytics
  async getBookingAnalytics(startDate?: string, endDate?: string): Promise<BookingAnalytics> {
    try {
      const [orderAnalytics, orderStats, popularRoutes] = await Promise.allSettled([
        orderService.getOrderAnalytics(startDate, endDate),
        orderService.getOrderStats(),
        orderService.getPopularRoutes(10)
      ]);

      const analyticsData = orderAnalytics.status === 'fulfilled' ? orderAnalytics.value : null;
      const statsData = orderStats.status === 'fulfilled' ? orderStats.value : null;
      const routesData = popularRoutes.status === 'fulfilled' ? popularRoutes.value : null;

      if (!analyticsData && !statsData) {
        return this.getMockBookingAnalytics();
      }

      return {
        totalBookings: statsData?.total_orders || 0,
        confirmedBookings: statsData?.pending_orders || 0, // Map accordingly
        cancelledBookings: statsData?.cancelled_orders || 0,
        completedBookings: statsData?.completed_orders || 0,
        totalRevenue: analyticsData?.summary?.total_revenue || 0,
        averageBookingValue: analyticsData?.summary?.average_order_value || 0,
        confirmationRate: analyticsData?.summary?.completion_rate || 0,
        cancellationRate: ((statsData?.cancelled_orders || 0) / (statsData?.total_orders || 1)) * 100,
        topRoutes: routesData?.map(route => ({
          route: `${route.pickup_location} → ${route.drop_location}`,
          bookingCount: route.order_count,
          revenue: route.total_revenue
        })) || [],
        paymentAnalysis: this.getMockPaymentAnalysis(), // TODO: Implement when payment service available
        monthlyTrends: this.getMockMonthlyTrends(), // TODO: Transform from daily data
        customerSatisfaction: {
          averageRating: 4.4,
          totalReviews: 178,
          repeatCustomers: 89
        },
        peakHours: this.getMockPeakHours() // TODO: Implement peak hour analysis
      };
    } catch (error) {
      console.error('Error fetching booking analytics:', error);
      return this.getMockBookingAnalytics();
    }
  }

  // Get fleet analytics
  async getFleetAnalytics(): Promise<FleetAnalytics> {
    try {
      // Try to get fleet summary from backend
      const fleetSummary = await fleetService.getFleetSummary?.();
      
      return {
        totalFleets: 1, // Single fleet for now - can be improved with fleet count endpoint
        totalVehicles: fleetSummary?.total_trucks || 89,
        activeVehicles: fleetSummary?.available_trucks || 67,
        maintenanceVehicles: fleetSummary?.maintenance_trucks || 5,
        totalDrivers: fleetSummary?.total_drivers || 156,
        availableDrivers: fleetSummary?.available_drivers || 98,
        busyDrivers: fleetSummary?.on_trip_drivers || 58,
        utilization: {
          vehicleUtilization: 75.3,
          driverUtilization: 62.8,
          fleetEfficiency: 88.9
        },
        maintenance: {
          scheduled: 12,
          overdue: 3,
          completed: 45
        }
      };
    } catch (error) {
      console.error('Error fetching fleet analytics:', error);
      return this.getMockFleetAnalytics();
    }
  }

  // NEW ANALYTICS METHODS - Service Summary, Vehicle Maintenance, Parts Inventory, etc.
  
  // Get service summary statistics
  async getServiceSummary(startDate?: string, endDate?: string): Promise<ServiceSummaryAnalytics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const url = `${API_BASE_URL}/analytics/service-summary${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<ServiceSummaryAnalytics>(response);
    } catch (error) {
      console.error('Error fetching service summary analytics:', error);
      throw error;
    }
  }

  // Get vehicle maintenance status overview
  async getVehicleMaintenanceAnalytics(): Promise<VehicleMaintenanceAnalytics> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/vehicle-maintenance`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<VehicleMaintenanceAnalytics>(response);
    } catch (error) {
      console.error('Error fetching vehicle maintenance analytics:', error);
      throw error;
    }
  }

  // Get parts inventory status
  async getPartsInventoryAnalytics(): Promise<PartsInventoryAnalytics> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/parts-inventory-status`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<PartsInventoryAnalytics>(response);
    } catch (error) {
      console.error('Error fetching parts inventory analytics:', error);
      throw error;
    }
  }

  // Get upcoming maintenance schedule
  async getMaintenanceSchedule(daysAhead: number = 30): Promise<MaintenanceScheduleAnalytics> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/maintenance-schedule?days_ahead=${daysAhead}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<MaintenanceScheduleAnalytics>(response);
    } catch (error) {
      console.error('Error fetching maintenance schedule analytics:', error);
      throw error;
    }
  }

  // Get service cost analysis
  async getServiceCostAnalysis(
    startDate?: string, 
    endDate?: string, 
    groupBy: 'month' | 'week' | 'day' | 'vehicle' | 'service_type' = 'month'
  ): Promise<ServiceCostAnalytics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      params.append('group_by', groupBy);
      
      const response = await fetch(`${API_BASE_URL}/analytics/cost-analysis?${params.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<ServiceCostAnalytics>(response);
    } catch (error) {
      console.error('Error fetching service cost analytics:', error);
      throw error;
    }
  }

  // Helper methods for data transformation
  private async getTopRoutesFormatted(): Promise<{ route: string; count: number; revenue: number }[]> {
    try {
      const routes = await orderService.getPopularRoutes(5);
      return routes.map(route => ({
        route: `${route.pickup_location} → ${route.drop_location}`,
        count: route.order_count,
        revenue: route.total_revenue
      }));
    } catch {
      return [
        { route: "Mumbai → Pune", count: 187, revenue: 98750.00 },
        { route: "Delhi → Gurgaon", count: 156, revenue: 78900.00 },
        { route: "Chennai → Bangalore", count: 143, revenue: 89650.00 },
        { route: "Kolkata → Howrah", count: 98, revenue: 45670.00 },
        { route: "Hyderabad → Secunderabad", count: 87, revenue: 43210.00 }
      ];
    }
  }

  private transformDailyToMonthly(dailyData: { date: string; revenue: number }[]): { month: string; revenue: number; bookings: number; orders: number }[] {
    // Group daily data by month and aggregate
    const monthlyData: { [key: string]: { revenue: number; count: number } } = {};
    
    dailyData.forEach(day => {
      const month = new Date(day.date).toLocaleDateString('en', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, count: 0 };
      }
      monthlyData[month].revenue += day.revenue;
      monthlyData[month].count += 1;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      bookings: Math.floor(data.count * 8.5), // Estimate bookings
      orders: Math.floor(data.count * 6.8) // Estimate orders
    }));
  }

  // Mock data methods (fallback when backend is unavailable)
  private getMockOverallAnalytics(): OverallAnalytics {
    return {
      totalRevenue: 450750.00,
      totalBookings: 1234,
      totalOrders: 987,
      totalTrips: 756,
      activeFleets: 12,
      totalDrivers: 156,
      totalVehicles: 89,
      totalCustomers: 2341,
      monthlyGrowth: 18.5,
      customerSatisfaction: 4.6,
      avgDeliveryTime: 2.4,
      profitMargin: 22.8,
      revenueGrowth: 15.2,
      bookingGrowth: 12.7,
      monthlyData: [
        { month: "Jan", revenue: 98750.00, bookings: 245, orders: 198 },
        { month: "Feb", revenue: 87650.00, bookings: 221, orders: 176 },
        { month: "Mar", revenue: 112340.00, bookings: 278, orders: 223 },
        { month: "Apr", revenue: 95670.00, bookings: 234, orders: 187 },
        { month: "May", revenue: 108890.00, bookings: 267, orders: 214 },
        { month: "Jun", revenue: 125450.00, bookings: 289, orders: 231 }
      ],
      topRoutes: [
        { route: "Mumbai → Pune", count: 187, revenue: 98750.00 },
        { route: "Delhi → Gurgaon", count: 156, revenue: 78900.00 },
        { route: "Chennai → Bangalore", count: 143, revenue: 89650.00 },
        { route: "Kolkata → Howrah", count: 98, revenue: 45670.00 },
        { route: "Hyderabad → Secunderabad", count: 87, revenue: 43210.00 }
      ],
      performanceMetrics: {
        onTimeDelivery: 94.2,
        customerRetention: 87.5,
        averageRating: 4.6,
        totalReviews: 2156
      }
    };
  }

  private getMockBookingAnalytics(): BookingAnalytics {
    return {
      totalBookings: 234,
      confirmedBookings: 187,
      cancelledBookings: 28,
      completedBookings: 165,
      totalRevenue: 89750.00,
      averageBookingValue: 383.33,
      confirmationRate: 79.91,
      cancellationRate: 11.97,
      topRoutes: [
        { route: "Mumbai → Pune", bookingCount: 42, revenue: 18900.00 },
        { route: "Delhi → Jaipur", bookingCount: 38, revenue: 15960.00 },
        { route: "Chennai → Bangalore", bookingCount: 35, revenue: 22750.00 },
        { route: "Kolkata → Bhubaneswar", bookingCount: 28, revenue: 14560.00 },
        { route: "Hyderabad → Vijayawada", bookingCount: 24, revenue: 9840.00 }
      ],
      paymentAnalysis: this.getMockPaymentAnalysis(),
      monthlyTrends: this.getMockMonthlyTrends(),
      customerSatisfaction: {
        averageRating: 4.4,
        totalReviews: 178,
        repeatCustomers: 89
      },
      peakHours: this.getMockPeakHours()
    };
  }

  private getMockPaymentAnalysis() {
    return [
      { method: "Credit Card", count: 156, revenue: 59820.00 },
      { method: "Debit Card", count: 78, revenue: 29930.00 },
      { method: "UPI/Digital Wallet", count: 45, revenue: 17200.00 },
      { method: "Net Banking", count: 23, revenue: 8800.00 }
    ];
  }

  private getMockMonthlyTrends() {
    return [
      { month: "Jan", bookings: 58, revenue: 22340.00 },
      { month: "Feb", bookings: 52, revenue: 19850.00 },
      { month: "Mar", bookings: 67, revenue: 25670.00 },
      { month: "Apr", bookings: 57, revenue: 21890.00 }
    ];
  }

  private getMockPeakHours() {
    return [
      { hour: "06:00", bookings: 28 },
      { hour: "08:00", bookings: 45 },
      { hour: "10:00", bookings: 32 },
      { hour: "14:00", bookings: 38 },
      { hour: "18:00", bookings: 52 },
      { hour: "20:00", bookings: 39 }
    ];
  }

  private getMockFleetAnalytics(): FleetAnalytics {
    return {
      totalFleets: 12,
      totalVehicles: 89,
      activeVehicles: 67,
      maintenanceVehicles: 5,
      totalDrivers: 156,
      availableDrivers: 98,
      busyDrivers: 58,
      utilization: {
        vehicleUtilization: 75.3,
        driverUtilization: 62.8,
        fleetEfficiency: 88.9
      },
      maintenance: {
        scheduled: 12,
        overdue: 3,
        completed: 45
      }
    };
  }

  // Check if backend is available
  async checkBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
