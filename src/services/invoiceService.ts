// Invoice Management API Service
// This file contains all API calls for invoice functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Invoice interfaces based on the API specification
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

export interface UpdateInvoiceStatusRequest {
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
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

class InvoiceService {
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

  // Create a new invoice
  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<Invoice> {
    console.log('Creating invoice with data:', invoiceData);
    
    const response = await fetch(`${API_BASE_URL}/payments/invoices/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(invoiceData),
    });

    console.log('Create invoice response status:', response.status);
    return this.handleResponse<Invoice>(response);
  }

  // Get all invoices for a specific user
  async getUserInvoices(userId: number): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/user/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Invoice[]>(response);
  }

  // Generate invoice from booking or other entities
  async generateInvoice(invoiceData: GenerateInvoiceRequest): Promise<GenerateInvoiceResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(invoiceData),
    });

    return this.handleResponse<GenerateInvoiceResponse>(response);
  }

  // Generate PDF for invoice
  async generateInvoicePDF(pdfData: GenerateInvoicePDFRequest): Promise<GenerateInvoicePDFResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/${pdfData.invoice_id}/pdf`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(pdfData),
    });

    return this.handleResponse<GenerateInvoicePDFResponse>(response);
  }

  // Get invoice statistics
  async getInvoiceStatistics(): Promise<InvoiceStatistics> {
    const response = await fetch(`${API_BASE_URL}/payments/statistics/invoices`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<InvoiceStatistics>(response);
  }

  // Search and filter invoices
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

  // Update invoice status
  async updateInvoiceStatus(invoiceId: number, statusData: UpdateInvoiceStatusRequest): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/${invoiceId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(statusData),
    });

    return this.handleResponse<Invoice>(response);
  }

  // Get invoice statuses
  async getInvoiceStatuses(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/statuses/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<string[]>(response);
  }

  // Create bulk invoices
  async createBulkInvoices(invoices: CreateInvoiceRequest[]): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/bulk/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(invoices),
    });

    return this.handleResponse<Invoice[]>(response);
  }

  // Export invoices data
  async exportInvoices(options: { 
    format: 'json' | 'csv';
    user_id?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ data: string; filename: string; content_type: string }> {
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

  // Get invoice details by ID
  async getInvoiceById(invoiceId: number): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/${invoiceId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Invoice>(response);
  }

  // Update invoice details
  async updateInvoice(invoiceId: number, invoiceData: Partial<Invoice>): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(invoiceData),
    });

    return this.handleResponse<Invoice>(response);
  }

  // Delete an invoice
  async deleteInvoice(invoiceId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/${invoiceId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // API may return empty response on successful deletion
    const result = await response.text();
    return result ? JSON.parse(result) : { message: 'Invoice deleted successfully' };
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();