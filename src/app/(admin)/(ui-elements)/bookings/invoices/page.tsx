'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { invoiceService } from '@/services/invoiceService';

interface InvoiceUI {
  id: number;
  invoice_number: string;
  booking_id: number;
  customer_name: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
  paid_date?: string;
  notes?: string;
}

export default function InvoiceManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceUI[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch actual invoice data from the API
      const apiInvoices = await invoiceService.searchInvoices({});
      
      // Transform API response to match the existing UI structure
      const transformedInvoices: InvoiceUI[] = apiInvoices.map(invoice => ({
        id: invoice.invoice_id || 0,
        invoice_number: invoice.invoice_number || `INV-${invoice.invoice_id}`,
        booking_id: invoice.booking_id || 0,
        customer_name: `Customer ${invoice.user_id}`,
        total_amount: invoice.total_amount,
        status: invoice.status,
        due_date: invoice.due_date || "",
        created_at: invoice.created_at || "",
        paid_date: invoice.paid_date || undefined,
        notes: invoice.notes || undefined,
      }));
      
      setInvoices(transformedInvoices);
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      // Fallback to empty array on error
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadInvoices();
    }
  }, [isAuthenticated, user, loadInvoices]);

  const handleDeleteInvoice = async (invoiceId: number, invoiceNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await invoiceService.deleteInvoice(invoiceId);
      // Remove the deleted invoice from the state
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      // Show success message
      alert(`Invoice ${invoiceNumber} deleted successfully.`);
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      alert('Failed to delete invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
  const pendingAmount = invoices
    .filter(i => i.status === 'sent' || i.status === 'draft')
    .reduce((sum, i) => sum + i.total_amount, 0);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Invoice Management" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🧾 Invoice Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage all invoices and billing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Invoices</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button
            onClick={loadInvoices}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-green-700 dark:text-green-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <ComponentCard title="">
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

      {/* Invoice Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🧾</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</p>
            <p className="text-2xl font-bold text-blue-600">{totalInvoices}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Paid Invoices</p>
            <p className="text-2xl font-bold text-green-600">{paidInvoices}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{overdueInvoices}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
            <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
          </div>
        </ComponentCard>
      </div>

      {/* Invoices List */}
      <div className="grid grid-cols-1 gap-6">
        {invoices.length === 0 ? (
          <ComponentCard title="">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🧾</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Invoices Found</h3>
              <p className="text-gray-600 dark:text-gray-400">No invoices match the selected filter criteria.</p>
            </div>
          </ComponentCard>
        ) : (
          invoices.map((invoice) => (
            <ComponentCard key={invoice.id} title="">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Invoice {invoice.invoice_number}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {invoice.customer_name} • Booking #{invoice.booking_id}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge color="primary">
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="font-medium text-green-600">${invoice.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</p>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {invoice.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Invoice created: {new Date(invoice.created_at).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/bookings/invoices/${invoice.id}`)}
                      className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/40 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      📄 View Details
                    </Button>
                    <Button
                      className="px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/40 border border-green-200 dark:border-green-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      📤 Send Invoice
                    </Button>
                    <Button
                      onClick={() => handleDeleteInvoice(invoice.id, invoice.invoice_number)}
                      disabled={loading}
                      className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-800/40 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              </div>
            </ComponentCard>
          ))
        )}
      </div>
    </div>
  );
}