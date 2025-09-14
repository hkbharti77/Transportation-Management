'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { paymentService } from '@/services/paymentService';

export default function UserPaymentsEndpointTestPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [responseString, setResponseString] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('3');
  const [skip, setSkip] = useState('0');
  const [limit, setLimit] = useState('100');

  const testGetUserPayments = async () => {
    setLoading(true);
    setError(null);
    setResponseString('');

    try {
      const result = await paymentService.getPaymentsByUserId(
        Number(userId), 
        Number(skip), 
        Number(limit)
      );
      // Convert response to string for display
      setResponseString(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('Error testing GET user payments endpoint:', err);
      setError(err instanceof Error ? err.message : 'Failed to test GET user payments endpoint');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="User Payments API Test" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🧪 User Payments API Endpoint Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test the GET user payments endpoint
          </p>
        </div>
      </div>

      <ComponentCard title="GET User Payments Endpoint Test">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">GET User Payments</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(_e) => setUserId(_e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Skip
              </label>
              <input
                type="text"
                value={skip}
                onChange={(_e) => setSkip(_e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Limit
              </label>
              <input
                type="text"
                value={limit}
                onChange={(_e) => setLimit(_e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Endpoint</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                GET http://localhost:8000/api/v1/payments/user/{userId}?skip={skip}&limit={limit}
              </code>
            </div>
          </div>

          <Button
            onClick={testGetUserPayments}
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
              'Test GET User Payments'
            )}
          </Button>
        </div>
      </ComponentCard>

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

      {responseString && (
        <ComponentCard title="Response">
          <div className="p-6">
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {responseString}
            </pre>
          </div>
        </ComponentCard>
      )}

      <ComponentCard title="Implementation Notes">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How to Use the User Payments API</h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              1. <strong>GET User Payments</strong>: Retrieve all payments associated with a specific user ID, with pagination support.
            </p>
            <p>
              2. <strong>Parameters</strong>:
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li><code>user_id</code> (path parameter): The ID of the user whose payments to retrieve</li>
                <li><code>skip</code> (query parameter): Number of records to skip for pagination (default: 0)</li>
                <li><code>limit</code> (query parameter): Maximum number of records to return (default: 100, max: 100)</li>
              </ul>
            </p>
            <p>
              3. <strong>UI Components</strong>: We&apos;ve created:
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>User-specific payments page to view all payments for a particular user</li>
                <li>API endpoint test page for the user payments endpoint</li>
              </ul>
            </p>
            <p>
              4. <strong>Navigation</strong>: The user payments page can be accessed from the user management section.
            </p>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}