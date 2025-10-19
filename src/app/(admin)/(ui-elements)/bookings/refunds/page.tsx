'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { paymentService, RefundRequest, RefundResponse } from '@/services/paymentService';

export default function RefundProcessingPage() {
  const { user, isAuthenticated } = useAuth();
  const [refundData, setRefundData] = useState<RefundRequest>({
    payment_id: 17,
    refund_amount: 50.00,
    refund_reason: 'Customer requested partial refund',
    partial_refund: true
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RefundResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setRefundData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setRefundData(prev => ({
        ...prev,
        [name]: name.includes('amount') || name.includes('payment_id') ? 
          (value === '' ? 0 : Number(value)) : value
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
      
      // Process refund using the real API
      const response = await paymentService.processRefund({
        payment_id: refundData.payment_id,
        refund_amount: refundData.refund_amount,
        refund_reason: refundData.refund_reason,
        partial_refund: refundData.partial_refund
      });
      
      setResult(response);
    } catch (err) {
      console.error('Error processing refund:', err);
      setError(err instanceof Error ? err.message : 'Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Refund Processing" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💰 Refund Processing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Process refunds for payments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Refund Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment ID
                </label>
                <input
                  type="number"
                  name="payment_id"
                  value={refundData.payment_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Refund Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="refund_amount"
                  value={refundData.refund_amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Refund Reason
                </label>
                <textarea
                  name="refund_reason"
                  value={refundData.refund_reason}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="partial_refund"
                  checked={refundData.partial_refund}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Partial Refund
                </label>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  {loading ? 'Processing Refund...' : 'Process Refund'}
                </Button>
              </div>
            </form>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Refund Information</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">Refund Policies</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 list-disc list-inside">
                  <li>Full refunds within 24 hours of payment</li>
                  <li>Partial refunds subject to service fees</li>
                  <li>Refunds processed within 5-7 business days</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-800 dark:text-green-200">Supported Gateways</h3>
                <ul className="text-sm text-green-700 dark:text-green-300 mt-1 list-disc list-inside">
                  <li>Credit/Debit Cards</li>
                  <li>UPI Payments</li>
                  <li>Digital Wallets</li>
                  <li>Bank Transfers</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-medium text-purple-800 dark:text-purple-200">Refund Status</h3>
                <ul className="text-sm text-purple-700 dark:text-purple-300 mt-1 list-disc list-inside">
                  <li>Pending - Refund request received</li>
                  <li>Processing - Refund being processed</li>
                  <li>Completed - Refund successful</li>
                  <li>Failed - Refund failed</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Important Notes</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Always verify payment details before processing refunds. Refunds cannot be reversed once completed.
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
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

      {result && (
        <ComponentCard title="">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Refund Processed Successfully
            </h2>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Refund ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{result.refund_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Payment ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{result.payment_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Refund Amount</p>
                  <p className="font-medium text-green-600">${result.refund_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {result.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Refund Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(result.refund_time).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gateway Reference</p>
                  <p className="font-medium text-gray-900 dark:text-white">{result.gateway_reference}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Refund Reason</p>
                <p className="font-medium text-gray-900 dark:text-white">{result.refund_reason}</p>
              </div>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}