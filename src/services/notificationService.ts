// Notification API Service
// This file contains all API calls for notification management functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Define interfaces for notifications
interface Notification {
  notification_id?: number;
  title: string;
  message: string;
  notification_type: 'sms' | 'email' | 'push';
  category?: string;
  priority: 'low' | 'normal' | 'high';
  user_id?: number;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  metadata?: Record<string, unknown>;
  retry_count?: number;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

// Define interface for notification templates
interface NotificationTemplate {
  template_id?: number;
  name: string;
  title_template: string;
  message_template: string;
  notification_type: 'sms' | 'email' | 'push';
  category: string;
  is_active: boolean;
  variables?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Define interface for notification list response
interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  size: number;
  unread_count: number;
}

// Define interface for notification stats response
interface NotificationStatsResponse {
  total_notifications: number;
  sent_notifications: number;
  delivered_notifications: number;
  failed_notifications: number;
  read_notifications: number;
  delivery_rate: number;
  read_rate: number;
  notifications_by_type: Record<string, number>;
  notifications_by_category: Record<string, number>;
}

// Define interfaces for broadcast notifications
interface BroadcastNotification {
  broadcast_id?: number;
  title: string;
  message: string;
  notification_type: 'sms' | 'email' | 'push';
  target_audience: string;
  scheduled_at?: string;
  sent_at?: string;
  total_recipients?: number;
  sent_count?: number;
  failed_count?: number;
  created_by: number;
  created_at?: string;
}

// Define interfaces for template-based notifications
interface TemplateNotificationRequest {
  user_ids: number[];
  template_name: string;
  title?: string;
  message?: string;
  notification_type: 'sms' | 'email' | 'push';
  category?: string;
  priority?: 'low' | 'normal' | 'high';
  scheduled_at?: string;
  template_variables?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface TemplateNotificationResponse {
  success: boolean;
  notifications_created: number;
  notifications_sent: number;
  failed_count: number;
  errors: string[];
}

interface SendNotificationResponse {
  notification_id: number;
  status: string;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  error_message: string | null;
}

interface ExecuteBroadcastResponse {
  broadcast_id: number;
  sent: number;
  failed: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

interface FilterOptions {
  category?: string;
  notification_type?: string;
  status?: string;
  priority?: string;
  user_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

class NotificationService {
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
        window.location.href = '/auth/signin';
        throw new Error('Authentication failed. Please log in again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Get all notifications with pagination and filters
  async getNotifications(filters: FilterOptions = {}): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.category) params.append('category', filters.category);
    if (filters.notification_type) params.append('notification_type', filters.notification_type);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.search) params.append('search', filters.search);
    
    // Add pagination parameters
    if (filters.page && filters.page > 0) {
      const skip = (filters.page - 1) * (filters.limit || 10);
      params.append('skip', skip.toString());
    }
    
    // Add limit with validation
    if (filters.limit) {
      const limit = Math.min(Math.max(filters.limit, 1), 100);
      params.append('limit', limit.toString());
    } else {
      params.append('limit', '10'); // Default limit
    }

    const response = await fetch(`${API_BASE_URL}/notifications/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    const notifications = await this.handleResponse<Notification[]>(response);
    return { data: notifications };
  }

  // Get notification by ID
  async getNotificationById(notificationId: number): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Notification>(response);
  }

  // Create new notification
  async createNotification(notificationData: Omit<Notification, 'notification_id' | 'created_at' | 'updated_at' | 'status' | 'sent_at' | 'delivered_at' | 'read_at' | 'retry_count' | 'error_message'>): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(notificationData),
    });

    return this.handleResponse<Notification>(response);
  }

  // Update notification
  async updateNotification(notificationId: number, notificationData: Partial<Notification>): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(notificationData),
    });

    return this.handleResponse<Notification>(response);
  }

  // Delete notification
  async deleteNotification(notificationId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Send notification immediately
  async sendNotification(notificationId: number): Promise<SendNotificationResponse> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/send`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<SendNotificationResponse>(response);
  }

  // Cancel scheduled notification
  async cancelNotification(notificationId: number): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Notification>(response);
  }

  // Send template-based notifications to multiple users
  async sendTemplateNotifications(requestData: TemplateNotificationRequest): Promise<TemplateNotificationResponse> {
    const response = await fetch(`${API_BASE_URL}/notifications/send`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    return this.handleResponse<TemplateNotificationResponse>(response);
  }

  // Get all broadcast notifications
  async getBroadcastNotifications(): Promise<BroadcastNotification[]> {
    const response = await fetch(`${API_BASE_URL}/notifications/broadcasts`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BroadcastNotification[]>(response);
  }

  // Create new broadcast notification
  async createBroadcastNotification(broadcastData: Omit<BroadcastNotification, 'broadcast_id' | 'created_at' | 'sent_at' | 'total_recipients' | 'sent_count' | 'failed_count'>, created_by: number): Promise<BroadcastNotification> {
    const params = new URLSearchParams();
    params.append('created_by', created_by.toString());
    
    const response = await fetch(`${API_BASE_URL}/notifications/broadcasts?${params.toString()}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(broadcastData),
    });

    return this.handleResponse<BroadcastNotification>(response);
  }

  // Get broadcast notification by ID
  async getBroadcastNotificationById(broadcastId: number): Promise<BroadcastNotification> {
    const response = await fetch(`${API_BASE_URL}/notifications/broadcasts/${broadcastId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BroadcastNotification>(response);
  }

  // Update broadcast notification
  async updateBroadcastNotification(broadcastId: number, broadcastData: Partial<BroadcastNotification>): Promise<BroadcastNotification> {
    const response = await fetch(`${API_BASE_URL}/notifications/broadcasts/${broadcastId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(broadcastData),
    });

    return this.handleResponse<BroadcastNotification>(response);
  }

  // Delete broadcast notification
  async deleteBroadcastNotification(broadcastId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/notifications/broadcasts/${broadcastId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Execute broadcast notification (send to all recipients)
  async executeBroadcast(broadcastId: number): Promise<ExecuteBroadcastResponse> {
    const response = await fetch(`${API_BASE_URL}/notifications/broadcasts/${broadcastId}/execute`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ExecuteBroadcastResponse>(response);
  }

  // Get notifications list with pagination (new endpoint)
  async getNotificationsList(skip: number = 0, limit: number = 50): Promise<NotificationListResponse> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/notifications/list?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<NotificationListResponse>(response);
  }

  // Get notification stats (new endpoint)
  async getNotificationStats(): Promise<NotificationStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/notifications/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<NotificationStatsResponse>(response);
  }

  // Template methods
  async getTemplates(filters: FilterOptions = {}): Promise<PaginatedResponse<NotificationTemplate>> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.category) params.append('category', filters.category);
    if (filters.notification_type) params.append('notification_type', filters.notification_type);
    if (filters.search) params.append('search', filters.search);
    
    // Add pagination parameters
    if (filters.page && filters.page > 0) {
      const skip = (filters.page - 1) * (filters.limit || 10);
      params.append('skip', skip.toString());
    }
    
    // Add limit with validation
    if (filters.limit) {
      const limit = Math.min(Math.max(filters.limit, 1), 100);
      params.append('limit', limit.toString());
    } else {
      params.append('limit', '10'); // Default limit
    }

    const response = await fetch(`${API_BASE_URL}/notifications/templates?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    const templates = await this.handleResponse<NotificationTemplate[]>(response);
    return { data: templates };
  }

  async getTemplateById(templateId: number): Promise<NotificationTemplate> {
    const response = await fetch(`${API_BASE_URL}/notifications/templates/${templateId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<NotificationTemplate>(response);
  }

  async createTemplate(templateData: Omit<NotificationTemplate, 'template_id' | 'created_at' | 'updated_at'>): Promise<NotificationTemplate> {
    const response = await fetch(`${API_BASE_URL}/notifications/templates`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(templateData),
    });

    return this.handleResponse<NotificationTemplate>(response);
  }

  async updateTemplate(templateId: number, templateData: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await fetch(`${API_BASE_URL}/notifications/templates/${templateId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(templateData),
    });

    return this.handleResponse<NotificationTemplate>(response);
  }

  async deleteTemplate(templateId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/notifications/templates/${templateId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export type { Notification, BroadcastNotification, NotificationTemplate, TemplateNotificationRequest, TemplateNotificationResponse, SendNotificationResponse, ExecuteBroadcastResponse, PaginatedResponse, FilterOptions, NotificationListResponse, NotificationStatsResponse };