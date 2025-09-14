'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { invoiceService, GenerateInvoiceRequest, GenerateInvoiceResponse } from '@/services/invoiceService';


export default function GenerateInvoicePage() {
  const { user, isAuthenticated } = useAuth();
  const [invoiceData, setInvoiceData] = useState<GenerateInvoiceRequest>({
    user_id: 1,
    items: [
      {
        description: 'Transportation Service',
        quantity: 1,
        unit_price: 100.00,
        tax_rate: 8.5
      }
    ],
    tax_rate: 8.5,
    discount_amount: 10.00,
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    notes: 'Generated from booking #1'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GenerateInvoiceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: name.includes('amount') || name.includes('rate') || name.includes('user_id') ? 
        (value === '' ? 0 : Number(value)) : value
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...invoiceData.items];
    (newItems[index] as Record<string, unknown>)[field] = field.includes('quantity') || field.includes('price') || field.includes('rate') ? 
      (value === '' ? 0 : Number(value)) : value;
    setInvoiceData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleAddItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          tax_rate: 0
        }
      ]
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      const newItems = [...invoiceData.items];
      newItems.splice(index, 1);
      setInvoiceData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || user?.role !== 'admin') return;
    
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      // Generate invoice using the real API
      const response = await invoiceService.generateInvoice(invoiceData);
      setResult(response);
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Generate Invoice" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🧾 Generate Invoice
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new invoice from booking or other entities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Invoice Details">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <input
                  type="number"
                  name="user_id"
                  value={invoiceData.user_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discount Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="discount_amount"
                  value={invoiceData.discount_amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={invoiceData.due_date || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={invoiceData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">Invoice Items</h3>
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    + Add Item
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {invoiceData.items.map((item, index) => (
                    <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400">Unit Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 dark:text-gray-400">Tax Rate (%)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.tax_rate}
                              onChange={(e) => handleItemChange(index, 'tax_rate', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          {invoiceData.items.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  {loading ? 'Generating Invoice...' : 'Generate Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </ComponentCard>

        <ComponentCard title="Information">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Generation Information</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">How It Works</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Fill in the invoice details and items, then click &quot;Generate Invoice&quot; to create a new invoice.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-800 dark:text-green-200">Invoice Status</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Generated invoices start with &quot;Draft&quot; status and can be sent to customers from the invoice management page.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-medium text-purple-800 dark:text-purple-200">Tax Calculation</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  Tax is calculated per item based on the tax rate. The total tax amount is shown in the generated invoice.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Important Notes</h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 list-disc list-inside">
                  <li>Invoice numbers are automatically generated</li>
                  <li>Due dates help track payment deadlines</li>
                  <li>Discounts are applied to the subtotal before tax</li>
                </ul>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

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

      {result && (
        <ComponentCard title="Result">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Invoice Generated Successfully
            </h2>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{result.invoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{result.invoice.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="font-medium text-green-600">${result.invoice.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                    {result.invoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {result.invoice.due_date ? new Date(result.invoice.due_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(result.invoice.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                <p className="font-medium text-gray-900 dark:text-white">{result.invoice.notes}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => window.location.href = `/bookings/invoices/${result.invoice.invoice_id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Invoice Details
                </Button>
              </div>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}