// Payment Management API Service
// This file contains all API calls for payment functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Payment interfaces based on the API specification
export interface Payment {
  payment_id: number;
  amount: number;
  method: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer' | 'net_banking' | 'crypto';
  booking_id: number;
  order_id: number;
  trip_id: number;
  user_id: number;
  invoice_id: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';
  transaction_id: string;
  gateway_reference: string;
  payment_time: string | null;
  refund_time: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreatePaymentRequest {
  amount: number;
  method: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer' | 'net_banking' | 'crypto';
  booking_id?: number;
  order_id?: number;
  trip_id?: number;
  user_id?: number;
  invoice_id?: number;
  gateway_reference?: string;
}

export interface UpdatePaymentRequest {
  status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';
  transaction_id?: string;
  gateway_reference?: string;
  payment_time?: string;
  refund_time?: string;
  refund_amount?: number;
  refund_reason?: string;
  updated_at?: string;
}

export interface PaymentFilterOptions {
  status?: string;
  method?: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer' | 'net_banking' | 'crypto';
  user_id?: number;
  booking_id?: number;
  order_id?: number;
  trip_id?: number;
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

// Add new interfaces for the additional endpoints
export interface WebhookRequest {
  event_type: string;
  payment_id: string;
  status: string;
  amount: number;
  currency: string;
  timestamp: string;
  signature: string;
  data: {
    gateway_reference?: string;
    transaction_id?: string;
  };
}

export interface RefundRequest {
  payment_id: number;
  refund_amount: number;
  refund_reason: string;
  partial_refund: boolean;
}

export interface RefundResponse {
  refund_id: string;
  payment_id: number;
  refund_amount: number;
  refund_reason: string;
  status: string;
  refund_time: string;
  gateway_reference: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  item_id?: number;
  invoice_id?: number;
  total_price?: number;
  tax_amount?: number;
  created_at?: string;
}

export interface Invoice {
  user_id: number;
  booking_id?: number;
  invoice_number?: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  paid_date?: string;
  pdf_path?: string;
  notes?: string;
  billing_address?: string;
  shipping_address?: string;
  created_at?: string;
  updated_at?: string;
  invoice_items: InvoiceItem[];
  invoice_id?: number;
}

export interface CreateInvoiceRequest {
  user_id: number;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  currency: string;
  booking_id?: number;
  due_date?: string;
  notes?: string;
  billing_address?: string;
  shipping_address?: string;
  invoice_items: Omit<InvoiceItem, 'item_id' | 'invoice_id' | 'total_price' | 'tax_amount' | 'created_at'>[];
}

export interface GenerateInvoiceRequest {
  user_id: number;
  booking_id?: number;
  items: Omit<InvoiceItem, 'item_id' | 'invoice_id' | 'total_price' | 'tax_amount' | 'created_at'>[];
  tax_rate?: number;
  discount_amount?: number;
  due_date?: string;
  notes?: string;
}

export interface GenerateInvoiceResponse {
  invoice: Invoice;
  pdf_url: string | null;
  message: string;
}

export interface GenerateInvoicePDFRequest {
  invoice_id: number;
  template?: string;
}

export interface GenerateInvoicePDFResponse {
  success: boolean;
  pdf_url: string;
  file_size: number | null;
  message: string;
}

export interface PaymentStatistics {
  total_payments: number;
  total_amount: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  refunded_amount: number;
  average_payment: number;
  payment_methods_distribution: Record<string, number>;
}

export interface InvoiceStatistics {
  total_invoices: number;
  total_amount: number;
  paid_invoices: number;
  overdue_invoices: number;
  pending_invoices: number;
  average_invoice: number;
  total_tax_collected: number;
}

export interface UpdatePaymentStatusRequest {
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled' | 'expired';
  gateway_response?: string;
}

export interface UpdateInvoiceStatusRequest {
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export interface BulkPaymentRequest extends CreatePaymentRequest {
  batch_id?: string; // Add a property to make this interface distinct
  // Additional fields for bulk operations can be added here
}

export interface BulkInvoiceRequest extends CreateInvoiceRequest {
  batch_id?: string; // Add a property to make this interface distinct
  // Additional fields for bulk operations can be added here
}

export interface ExportRequest {
  format: 'json' | 'csv';
  user_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface ProcessPaymentRequest {
  gateway_data?: Record<string, unknown>;
}

export interface ProcessPaymentResponse {
  success: boolean;
  transaction_id?: string;
  status: string;
  message?: string;
  redirect_url?: string;
}

class PaymentService {
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
        if (typeof (errorData as { detail: unknown }).detail === 'string') {
          throw new Error((errorData as { detail: string }).detail);
        } else if (typeof (errorData as { detail: unknown }).detail === 'object') {
          throw new Error(`API Error: ${JSON.stringify((errorData as { detail: object }).detail)}`);
        }
      }
      
      // Fallback to generic message with status
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Create a new payment
  async createPayment(paymentData: CreatePaymentRequest): Promise<Payment> {
    console.log('Creating payment with data:', paymentData);
    
    const response = await fetch(`${API_BASE_URL}/payments/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    console.log('Create payment response status:', response.status);
    return this.handleResponse<Payment>(response);
  }

  // Get a specific payment by ID
  async getPaymentById(paymentId: number): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Payment>(response);
  }

  // Get all payments with pagination and filters
  async getPayments(filters: PaymentFilterOptions = {}): Promise<PaginatedResponse<Payment>> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.method) params.append('method', filters.method);
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.booking_id) params.append('booking_id', filters.booking_id.toString());
    if (filters.order_id) params.append('order_id', filters.order_id.toString());
    if (filters.trip_id) params.append('trip_id', filters.trip_id.toString());
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

    const response = await fetch(`${API_BASE_URL}/payments/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    const payments = await this.handleResponse<Payment[]>(response);
    return { data: payments };
  }

  // Update an existing payment
  async updatePayment(paymentId: number, paymentData: UpdatePaymentRequest): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    return this.handleResponse<Payment>(response);
  }

  // Delete a payment
  async deletePayment(paymentId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // API may return empty response on successful deletion
    const result = await response.text();
    return result ? JSON.parse(result) : { message: 'Payment deleted successfully' };
  }

  // Process a refund for a payment by ID
  async processRefundById(paymentId: number, refundAmount?: number, refundReason?: string): Promise<Payment> {
    const requestBody: { refund_amount?: number; refund_reason?: string } = {};
    if (refundAmount !== undefined) requestBody.refund_amount = refundAmount;
    if (refundReason !== undefined) requestBody.refund_reason = refundReason;

    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<Payment>(response);
  }

  // Get payments for current user
  async getUserPayments(): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payments/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Payment[]>(response);
  }

  // Get payments for a specific user with pagination
  async getPaymentsByUserId(userId: number, skip: number = 0, limit: number = 100): Promise<Payment[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', Math.min(Math.max(limit, 1), 100).toString());

    const response = await fetch(`${API_BASE_URL}/payments/user/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Payment[]>(response);
  }

  // Get payments for a specific booking
  async getPaymentsByBookingId(bookingId: number): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payments/booking/${bookingId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Payment[]>(response);
  }

  // Get payments by status with pagination
  async getPaymentsByStatus(status: Payment['status'], skip: number = 0, limit: number = 100): Promise<Payment[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', Math.min(Math.max(limit, 1), 100).toString());

    const response = await fetch(`${API_BASE_URL}/payments/status/${status}?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Payment[]>(response);
  }

  // Get pending payments (legacy method for backward compatibility)
  async getPendingPayments(filters: Omit<PaymentFilterOptions, 'status'> = {}): Promise<Payment[]> {
    const paymentFilters: PaymentFilterOptions = { ...filters, status: 'pending' };
    const result = await this.getPayments(paymentFilters);
    return result.data;
  }

  // Get completed payments (legacy method for backward compatibility)
  async getCompletedPayments(filters: Omit<PaymentFilterOptions, 'status'> = {}): Promise<Payment[]> {
    const paymentFilters: PaymentFilterOptions = { ...filters, status: 'completed' };
    const result = await this.getPayments(paymentFilters);
    return result.data;
  }

  // Get refunded payments (legacy method for backward compatibility)
  async getRefundedPayments(filters: Omit<PaymentFilterOptions, 'status'> = {}): Promise<Payment[]> {
    const paymentFilters: PaymentFilterOptions = { ...filters, status: 'refunded' };
    const result = await this.getPayments(paymentFilters);
    return result.data;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
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

  // 1. Process Webhook
  async processWebhook(webhookData: WebhookRequest): Promise<{ success: boolean; payment_id: number }> {
    const response = await fetch(`${API_BASE_URL}/payments/webhook`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(webhookData),
    });

    return this.handleResponse<{ success: boolean; payment_id: number }>(response);
  }

  // 2. Process Refund
  async processRefund(refundData: RefundRequest): Promise<RefundResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/refund`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(refundData),
    });

    return this.handleResponse<RefundResponse>(response);
  }

  // 3. Create Invoice
  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(invoiceData),
    });

    return this.handleResponse<Invoice>(response);
  }

  // 4. Get User Invoices
  async getUserInvoices(userId: number): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/user/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Invoice[]>(response);
  }

  // 5. Generate Invoice
  async generateInvoice(invoiceData: GenerateInvoiceRequest): Promise<GenerateInvoiceResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(invoiceData),
    });

    return this.handleResponse<GenerateInvoiceResponse>(response);
  }

  // 6. Generate Invoice PDF
  async generateInvoicePDF(pdfData: GenerateInvoicePDFRequest): Promise<GenerateInvoicePDFResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/${pdfData.invoice_id}/pdf`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(pdfData),
    });

    return this.handleResponse<GenerateInvoicePDFResponse>(response);
  }

  // 7. Get Payment Statistics
  async getPaymentStatistics(): Promise<PaymentStatistics> {
    const response = await fetch(`${API_BASE_URL}/payments/statistics/payments`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PaymentStatistics>(response);
  }

  // 8. Get Invoice Statistics
  async getInvoiceStatistics(): Promise<InvoiceStatistics> {
    const response = await fetch(`${API_BASE_URL}/payments/statistics/invoices`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<InvoiceStatistics>(response);
  }

  // 9. Search Payments
  async searchPayments(filters: PaymentFilterOptions = {}): Promise<Payment[]> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.method) params.append('method', filters.method);
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.booking_id) params.append('booking_id', filters.booking_id.toString());
    if (filters.order_id) params.append('order_id', filters.order_id.toString());
    if (filters.trip_id) params.append('trip_id', filters.trip_id.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    const response = await fetch(`${API_BASE_URL}/payments/search/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Payment[]>(response);
  }

  // 10. Search Invoices
  async searchInvoices(filters: { 
    user_id?: number; 
    status?: string; 
    booking_id?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
  } = {}): Promise<Invoice[]> {
    const params = new URLSearchParams();
    
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.booking_id) params.append('booking_id', filters.booking_id.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    const response = await fetch(`${API_BASE_URL}/payments/invoices/search/?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Invoice[]>(response);
  }

  // 11. Update Payment Status
  async updatePaymentStatus(paymentId: number, statusData: UpdatePaymentStatusRequest): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(statusData),
    });

    return this.handleResponse<Payment>(response);
  }

  // 12. Update Invoice Status
  async updateInvoiceStatus(invoiceId: number, statusData: UpdateInvoiceStatusRequest): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/${invoiceId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(statusData),
    });

    return this.handleResponse<Invoice>(response);
  }

  // 13. Get Payment Methods
  async getPaymentMethods(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/payments/methods/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<string[]>(response);
  }

  // 14. Get Payment Statuses
  async getPaymentStatuses(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/payments/statuses/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<string[]>(response);
  }

  // 15. Get Invoice Statuses
  async getInvoiceStatuses(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/statuses/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<string[]>(response);
  }

  // 16. Create Bulk Payments
  async createBulkPayments(payments: BulkPaymentRequest[]): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payments/bulk/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payments),
    });

    return this.handleResponse<Payment[]>(response);
  }

  // 17. Create Bulk Invoices
  async createBulkInvoices(invoices: BulkInvoiceRequest[]): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/bulk/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(invoices),
    });

    return this.handleResponse<Invoice[]>(response);
  }

  // 18. Export Payments
  async exportPayments(options: ExportRequest): Promise<{ data: string; filename: string; content_type: string }> {
    const params = new URLSearchParams();
    params.append('format', options.format);
    if (options.user_id) params.append('user_id', options.user_id.toString());
    if (options.status) params.append('status', options.status);
    if (options.date_from) params.append('date_from', options.date_from);
    if (options.date_to) params.append('date_to', options.date_to);

    const response = await fetch(`${API_BASE_URL}/payments/export/payments?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ data: string; filename: string; content_type: string }>(response);
  }

  // 19. Export Invoices
  async exportInvoices(options: ExportRequest): Promise<{ data: string; filename: string; content_type: string }> {
    const params = new URLSearchParams();
    params.append('format', options.format);
    if (options.user_id) params.append('user_id', options.user_id.toString());
    if (options.status) params.append('status', options.status);
    if (options.date_from) params.append('date_from', options.date_from);
    if (options.date_to) params.append('date_to', options.date_to);

    const response = await fetch(`${API_BASE_URL}/payments/export/invoices?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ data: string; filename: string; content_type: string }>(response);
  }

  // 20. Get Payment (already exists as getPaymentById)

  // 21. Update Payment (already exists as updatePayment)

  // 22. Process Payment
  async processPayment(paymentId: number, processData: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/process`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(processData),
    });

    return this.handleResponse<ProcessPaymentResponse>(response);
  }

  // 23. Get Invoice
  async getInvoiceById(invoiceId: number): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/${invoiceId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Invoice>(response);
  }

  // 24. Update Invoice
  async updateInvoice(invoiceId: number, invoiceData: Partial<Invoice>): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(invoiceData),
    });

    return this.handleResponse<Invoice>(response);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();