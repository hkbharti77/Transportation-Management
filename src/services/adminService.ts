// Admin Service
// This service handles admin-specific API calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

interface SystemHealth {
  service_name: string;
  status: string;
  response_time: number;
  error_count: number;
  details: Record<string, unknown>;
  health_id: number;
  last_check: string;
  created_at: string;
}

interface RecentAlert {
  alert_type: string;
  title: string;
  message: string;
  severity: string;
  metadata: Record<string, unknown>;
  alert_id: number;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface AdminOverview {
  total_users: number;
  active_users_today: number;
  total_bookings: number;
  bookings_today: number;
  total_revenue: number;
  revenue_today: number;
  total_trucks: number;
  active_trucks: number;
  system_health: SystemHealth[];
  recent_alerts: RecentAlert[];
}

export interface ReportFilters {
  city?: string;
  status?: string;
  vehicle_type?: string;
}

export interface ReportRequest {
  report_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metric_type: 'bookings' | 'revenue' | 'users' | 'vehicles';
  start_date: string;
  end_date: string;
  filters?: ReportFilters;
}

export interface ReportDataItem {
  label: string;
  value: number;
  [key: string]: unknown;
}

export interface ReportResponse {
  report_id: string;
  report_type: string;
  metric_type: string;
  period_start: string;
  period_end: string;
  data: ReportDataItem[];
  summary: {
    total: number;
    [key: string]: unknown;
  };
  generated_at: string;
}

class AdminService {
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

  // Get admin overview data
  async getAdminOverview(): Promise<AdminOverview> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/overview`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<AdminOverview>(response);
    } catch (error) {
      console.error('Error fetching admin overview:', error);
      throw error;
    }
  }

  // Generate admin report
  async generateReport(request: ReportRequest): Promise<ReportResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      return this.handleResponse<ReportResponse>(response);
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();