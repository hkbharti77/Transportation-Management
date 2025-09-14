'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { Payment } from '@/services/paymentService';
import { Invoice } from '@/services/invoiceService';

interface SearchFilters {
  user_id?: number;
  status?: string;
  booking_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  type: 'payments' | 'invoices';
}

export default function SearchPage() {
  const { user, isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'payments'
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || user?.role !== 'admin') return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (filters.type === 'payments') {
        // In a real implementation:
        // const paymentResults = await paymentService.searchPayments(filters);
        // setPayments(paymentResults);
        
        // Mock data for demonstration
        const mockPayments: Payment[] = [
          {
            payment_id: 1,
            amount: 150,
            method: "card",
            booking_id: 17,
            order_id: 1,
            trip_id: 3,
            user_id: 3,
            invoice_id: 9,
            status: "completed",
            transaction_id: "PAY_8DBC04DF6FFE43F0",
            gateway_reference: "PAY-9A7X3B2C",
            payment_time: "2025-09-11T06:26:19.306063+05:30",
            refund_time: null,
            refund_amount: null,
            refund_reason: null,
            created_at: "2025-09-11T06:26:19.306063+05:30",
            updated_at: null
          }
        ];
        setPayments(mockPayments);
        setInvoices([]);
      } else {
        // In a real implementation:
        // const invoiceResults = await invoiceService.searchInvoices(filters);
        // setInvoices(invoiceResults);
        
        // Mock data for demonstration
        const mockInvoices: Invoice[] = [
          {
            user_id: 1,
            booking_id: 1,
            invoice_number: "INV-202509-1234ABCD",
            total_amount: 200.00,
            subtotal: 180.00,
            tax_amount: 20.00,
            discount_amount: 0.00,
            currency: "USD",
            status: "sent",
            due_date: "2025-10-11T16:30:00Z",
            paid_date: undefined, // Changed from null to undefined
            pdf_path: undefined,  // Changed from null to undefined
            notes: "Transportation service invoice",
            billing_address: "123 Main St, City, State 12345",
            shipping_address: "123 Main St, City, State 12345",
            created_at: "2025-09-11T16:30:00Z",
            updated_at: undefined, // Changed from null to undefined
            invoice_items: [
              {
                description: "Cargo Transportation Service",
                quantity: 1,
                unit_price: 150.00,
                tax_rate: 10.0,
                item_id: 1,
                invoice_id: 1,
                total_price: 150.00,
                tax_amount: 15.00,
                created_at: "2025-09-11T16:30:00Z"
              }
            ],
            invoice_id: 1
          }
        ];
        setInvoices(mockInvoices);
        setPayments([]);
      }
    } catch (err) {
      console.error('Error searching:', err);
      setError(err instanceof Error ? err.message : 'Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'user_id' || name === 'booking_id' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Search Payments & Invoices" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔍 Search Payments & Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Search and filter payments and invoices
          </p>
        </div>
      </div>

      <ComponentCard title="Search Filters">
        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Type
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="payments">Payments</option>
                  <option value="invoices">Invoices</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <input
                  type="number"
                  name="user_id"
                  value={filters.user_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter user ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Booking ID
                </label>
                <input
                  type="number"
                  name="booking_id"
                  value={filters.booking_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter booking ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <input
                  type="text"
                  name="status"
                  value={filters.status || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter status"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Term
                </label>
                <input
                  type="text"
                  name="search"
                  value={filters.search || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter search term"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  name="date_from"
                  value={filters.date_from || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  name="date_to"
                  value={filters.date_to || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
        </div>
      </ComponentCard>

      {error && (
        <ComponentCard title="Error">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        </ComponentCard>
      )}

      {payments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Results ({payments.length})</h2>
          <div className="grid grid-cols-1 gap-4">
            {payments.map(payment => (
              <ComponentCard key={payment.payment_id} title={`Payment #${payment.payment_id}`}>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Payment #{payment.payment_id}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        User: {payment.user_id} | Booking: {payment.booking_id}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {payment.status}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">${payment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Method</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{payment.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </ComponentCard>
            ))}
          </div>
        </div>
      )}

      {invoices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invoice Results ({invoices.length})</h2>
          <div className="grid grid-cols-1 gap-4">
            {invoices.map(invoice => (
              <ComponentCard key={invoice.invoice_id} title={`Invoice ${invoice.invoice_number || `#${invoice.invoice_id}`}`}>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Invoice {invoice.invoice_number}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        User: {invoice.user_id} | Booking: {invoice.booking_id}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {invoice.status}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">${invoice.total_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </ComponentCard>
            ))}
          </div>
        </div>
      )}

      {payments.length === 0 && invoices.length === 0 && !loading && !error && (
        <ComponentCard title="No Results">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Results Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Adjust your search criteria and try again.
            </p>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}