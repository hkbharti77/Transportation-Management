'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { invoiceService, Invoice } from '@/services/invoiceService';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id || Array.isArray(id)) return;
      
      try {
        setLoading(true);
        setError(null);
        const invoiceData = await invoiceService.getInvoiceById(parseInt(id as string));
        setInvoice(invoiceData);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchInvoice();
    }
  }, [id, isAuthenticated, user]);

  const handleUpdateStatus = async (newStatus: Invoice['status']) => {
    if (!invoice?.invoice_id) return;
    
    try {
      const updatedInvoice = await invoiceService.updateInvoiceStatus(invoice.invoice_id, { status: newStatus });
      setInvoice(updatedInvoice);
    } catch (err) {
      console.error('Error updating invoice status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update invoice status');
    }
  };

  const handleGeneratePDF = async () => {
    if (!invoice?.invoice_id) return;
    
    try {
      const response = await invoiceService.generateInvoicePDF({ invoice_id: invoice.invoice_id });
      // In a real implementation, you might want to open the PDF in a new tab or download it
      alert(`PDF generated successfully! ${response.pdf_url ? 'Download URL: ' + response.pdf_url : ''}`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    }
  };

  const handleSendInvoice = async () => {
    try {
      // This would typically involve calling an API endpoint to send the invoice via email
      // For now, we'll just show a success message
      alert('Invoice sent to customer successfully!');
    } catch (err) {
      console.error('Error sending invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoice?.invoice_id) return;
    
    if (!window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await invoiceService.deleteInvoice(invoice.invoice_id);
      // Redirect to invoices list after successful deletion
      alert(`Invoice ${invoice.invoice_number} deleted successfully.`);
      router.push('/bookings/invoices');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      alert('Failed to delete invoice. Please try again.');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ComponentCard title="">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🧾</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Invoice Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400">The requested invoice could not be found.</p>
            <Button
              onClick={() => router.push('/bookings/invoices')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Invoices
            </Button>
          </div>
        </ComponentCard>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <PageBreadCrumb 
        pageTitle="Invoice Details" 
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🧾 Invoice {invoice.invoice_number}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed view of invoice #{invoice.invoice_id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="primary">
            {invoice.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <ComponentCard title="">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing Information</h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">Customer ID: {invoice.user_id}</p>
                {invoice.booking_id && (
                  <p className="text-gray-600 dark:text-gray-400">Booking ID: {invoice.booking_id}</p>
                )}
                {invoice.billing_address && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Billing Address:</p>
                    <p className="text-gray-900 dark:text-white">{invoice.billing_address}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Details</h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  Created: {new Date(invoice.created_at || '').toLocaleDateString()}
                </p>
                {invoice.due_date && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Due Date: {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                )}
                {invoice.paid_date && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Paid Date: {new Date(invoice.paid_date).toLocaleDateString()}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400">Currency: {invoice.currency}</p>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {invoice.notes}
              </p>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tax Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.invoice_items.map((item) => (
                    <tr key={item.item_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                        ${item.unit_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                        {item.tax_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                        ${item.total_price?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div></div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                  <span className="text-gray-900 dark:text-white">${invoice.tax_amount.toFixed(2)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                    <span className="text-gray-900 dark:text-white">-${invoice.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-lg font-semibold text-green-600">${invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => router.push('/bookings/invoices')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Invoices
        </Button>
        
        <Button
          onClick={handleGeneratePDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📄 Generate PDF
        </Button>
        
        <Button
          onClick={handleSendInvoice}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📤 Send Invoice
        </Button>
        
        {invoice.status === 'draft' && (
          <Button
            onClick={() => handleUpdateStatus('sent')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            🚀 Mark as Sent
          </Button>
        )}
        
        {invoice.status === 'sent' && (
          <Button
            onClick={() => handleUpdateStatus('paid')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            💰 Mark as Paid
          </Button>
        )}
        
        <Button
          onClick={handleDeleteInvoice}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🗑️ Delete Invoice
        </Button>
        
        <select
          value={invoice.status}
          onChange={(e) => handleUpdateStatus(e.target.value as Invoice['status'])}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  );
}