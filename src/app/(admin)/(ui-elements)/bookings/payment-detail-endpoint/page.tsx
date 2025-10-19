'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { paymentService } from '@/services/paymentService';

export default function PaymentDetailEndpointTestPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState('13');
  const [updateData, setUpdateData] = useState({
    status: 'pending' as 'pending' | 'completed' | 'failed' | 'refunded' | 'processing',
    transaction_id: 'string',
    gateway_reference: 'string',
    payment_time: '2025-09-11T01:09:28.013Z'
  });

  // Convert response to string for rendering
  const responseString = response ? JSON.stringify(response, null, 2) : 'No response data';

  // Ensure the response string is always a valid ReactNode
  const displayResponse: React.ReactNode = responseString;

  // Helper function to check if there's a valid response
  const hasResponse = (): boolean => {
    return response !== null && response !== undefined;
  };

  const testGetPayment = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await paymentService.getPaymentById(Number(paymentId));
      setResponse(result);
    } catch (err) {
      console.error('Error testing GET payment endpoint:', err);
      setError(err instanceof Error ? err.message : 'Failed to test GET payment endpoint');
    } finally {
      setLoading(false);
    }
  };

  const testUpdatePayment = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await paymentService.updatePayment(Number(paymentId), updateData);
      setResponse(result);
    } catch (err) {
      console.error('Error testing PUT payment endpoint:', err);
      setError(err instanceof Error ? err.message : 'Failed to test PUT payment endpoint');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Payment Detail API Test" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🧪 Payment Detail API Endpoint Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test the payment detail GET and PUT endpoints
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GET Payment Test */}
        <ComponentCard title="GET Payment by ID">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">GET Payment by ID</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment ID
              </label>
              <input
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Endpoint</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <code className="text-sm text-gray-800 dark:text-gray-200">
                  GET http://127.0.0.1:8000/api/v1/payments/{paymentId}
                </code>
              </div>
            </div>

            <Button
              onClick={testGetPayment}
              disabled={loading}
              className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing...
                </>
              ) : (
                'Test GET Payment'
              )}
            </Button>
          </div>
        </ComponentCard>

        {/* PUT Payment Test */}
        <ComponentCard title="PUT Update Payment">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">PUT Update Payment</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment ID
              </label>
              <input
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={updateData.status}
                onChange={(e) => setUpdateData({...updateData, status: e.target.value as 'pending' | 'completed' | 'failed' | 'refunded' | 'processing'})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                value={updateData.transaction_id}
                onChange={(e) => setUpdateData({...updateData, transaction_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gateway Reference
              </label>
              <input
                type="text"
                value={updateData.gateway_reference}
                onChange={(e) => setUpdateData({...updateData, gateway_reference: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Time
              </label>
              <input
                type="text"
                value={updateData.payment_time}
                onChange={(e) => setUpdateData({...updateData, payment_time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Endpoint</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <code className="text-sm text-gray-800 dark:text-gray-200">
                  PUT http://127.0.0.1:8000/api/v1/payments/{paymentId}
                </code>
              </div>
            </div>

            <Button
              onClick={testUpdatePayment}
              disabled={loading}
              className="px-6 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing...
                </>
              ) : (
                'Test PUT Payment'
              )}
            </Button>
          </div>
        </ComponentCard>
      </div>

      {error && (
        <ComponentCard title="Error">
          <div className="p-6">
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
          </div>
        </ComponentCard>
      )}

      {hasResponse() && displayResponse !== "No response data" && (
        <ComponentCard title="Response">
          <div className="p-6">
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {displayResponse}
            </pre>
          </div>
        </ComponentCard>
      )}

      <ComponentCard title="Implementation Notes">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How to Use the Payment Detail API</h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              1. <strong>GET Payment by ID</strong>: Retrieve detailed information about a specific payment using its ID.
            </p>
            <p>
              2. <strong>PUT Update Payment</strong>: Update payment details such as status, transaction ID, gateway reference, and payment time.
            </p>
            <p>
              3. <strong>UI Components</strong>: We&apos;ve created:
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Payment detail page with comprehensive information display</li>
                <li>Update form for modifying payment details</li>
                <li>API endpoint test page for both GET and PUT operations</li>
              </ul>
            </p>
            <p>
              4. <strong>Navigation</strong>: The payment management page now links to individual payment detail pages.
            </p>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}