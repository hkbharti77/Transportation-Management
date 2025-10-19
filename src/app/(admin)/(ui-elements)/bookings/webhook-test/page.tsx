'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { WebhookRequest } from '@/services/paymentService';

export default function WebhookTestPage() {
  const { user, isAuthenticated } = useAuth();
  const [webhookData, setWebhookData] = useState<WebhookRequest>({
    event_type: 'payment.completed',
    payment_id: 'TXN_1234567890ABCDEF',
    status: 'completed',
    amount: 150.00,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    signature: 'sig_webhook_signature_123',
    data: {
      gateway_reference: 'REF_1234567890AB',
      transaction_id: 'TXN_1234567890ABCDEF'
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<unknown>(null);
  const [formattedResult, setFormattedResult] = useState<React.ReactNode>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (result) {
      setFormattedResult(String(typeof result === 'string' ? result : JSON.stringify(result, null, 2)));
    }
  }, [result]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('data.')) {
      const dataKey = name.split('.')[1];
      setWebhookData(prev => ({
        ...prev,
        data: {
          ...prev.data,
          [dataKey]: value
        }
      }));
    } else {
      setWebhookData(prev => ({
        ...prev,
        [name]: name === 'amount' ? parseFloat(value) : value
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
      
      // In a real implementation:
      // const response = await paymentService.processWebhook(webhookData);
      // setResult(response);
      
      // Mock response for demonstration
      setResult({
        success: true,
        payment_id: 17
      });
    } catch (err) {
      console.error('Error processing webhook:', err);
      setError(err instanceof Error ? err.message : 'Failed to process webhook');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Webhook Testing" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔄 Webhook Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test payment webhook integration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Webhook Data">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Webhook Data</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Type
                </label>
                <select
                  name="event_type"
                  value={webhookData.event_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="payment.completed">Payment Completed</option>
                  <option value="payment.failed">Payment Failed</option>
                  <option value="payment.refunded">Payment Refunded</option>
                  <option value="payment.cancelled">Payment Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment ID
                </label>
                <input
                  type="text"
                  name="payment_id"
                  value={webhookData.payment_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={webhookData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={webhookData.amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  name="currency"
                  value={webhookData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timestamp
                </label>
                <input
                  type="text"
                  name="timestamp"
                  value={webhookData.timestamp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Signature
                </label>
                <input
                  type="text"
                  name="signature"
                  value={webhookData.signature}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gateway Reference
                </label>
                <input
                  type="text"
                  name="data.gateway_reference"
                  value={webhookData.data.gateway_reference || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="data.transaction_id"
                  value={webhookData.data.transaction_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Process Webhook'}
                </Button>
              </div>
            </form>
          </div>
        </ComponentCard>

        <ComponentCard title="Webhook Information">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Webhook Information</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">Webhook URL</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  POST http://127.0.0.1:8000/api/v1/payments/webhook
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-800 dark:text-green-200">Event Types</h3>
                <ul className="text-sm text-green-700 dark:text-green-300 mt-1 list-disc list-inside">
                  <li>payment.completed</li>
                  <li>payment.failed</li>
                  <li>payment.refunded</li>
                  <li>payment.cancelled</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-medium text-purple-800 dark:text-purple-200">Security</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  All webhooks include a signature for verification. Always validate the signature before processing.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Testing</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Use this form to simulate webhook events from your payment gateway for testing purposes.
                </p>
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

      {!!result && (
        <ComponentCard title="Success">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Webhook Processed Successfully
            </h2>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <pre className="text-sm text-green-800 dark:text-green-200 overflow-x-auto">
                {formattedResult}
              </pre>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}