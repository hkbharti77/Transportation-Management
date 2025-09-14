'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { paymentService } from '@/services/paymentService';

export default function PaymentEndpointTestPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const testCreatePayment = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const paymentData = {
        amount: 150,
        method: "bank_transfer" as const,
        booking_id: 17,
        order_id: 1,
        trip_id: 3,
        user_id: 3,
        invoice_id: 9,
        gateway_reference: "PAY-9A7X3B2C"
      };

      const result = await paymentService.createPayment(paymentData);
      setResponse(result);
    } catch (err) {
      console.error('Error testing payment endpoint:', err);
      setError(err instanceof Error ? err.message : 'Failed to test payment endpoint');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Convert response to string for rendering
  const responseString = response ? JSON.stringify(response, null, 2) : 'No response data';

  // Ensure the response string is always a valid ReactNode
  const displayResponse: React.ReactNode = responseString;

  // Helper function to check if there's a valid response
  const hasResponse = (): boolean => {
    return response !== null && response !== undefined;
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Payment API Test" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🧪 Payment API Endpoint Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test the payment creation endpoint with sample data
          </p>
        </div>
      </div>

      <ComponentCard title="Test Payment Creation">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Test Payment Creation</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Endpoint</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                POST http://localhost:8000/api/v1/payments/
              </code>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sample Request Body</h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "amount": 150,
  "method": "bank_transfer",
  "booking_id": 17,
  "order_id": 1,
  "trip_id": 3,
  "user_id": 3,
  "invoice_id": 9,
  "gateway_reference": "PAY-9A7X3B2C"
}`}
            </pre>
          </div>

          <Button
            onClick={testCreatePayment}
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
              'Test Payment Creation'
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

      {hasResponse() && displayResponse !== "No response data" && (
        <ComponentCard title="Response (201 Created)">
          <div className="p-6">
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {displayResponse}
            </pre>
          </div>
        </ComponentCard>
      )}

      <ComponentCard title="Implementation Notes">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How to Use the Payment API</h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              1. <strong>Create Payment Service</strong>: We&apos;ve created a <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">paymentService.ts</code> file that follows the same pattern as other services in the application.
            </p>
            <p>
              2. <strong>Integration Points</strong>: The payment service can be integrated into:
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Booking confirmation flows</li>
                <li>Order processing workflows</li>
                <li>Trip completion processes</li>
                <li>Manual payment creation by admins</li>
              </ul>
            </p>
            <p>
              3. <strong>Data Model</strong>: The payment model includes:
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li><code>amount</code> - Payment amount</li>
                <li><code>method</code> - Payment method (cash, card, bank transfer, etc.)</li>
                <li><code>status</code> - Current payment status (pending, completed, failed, refunded)</li>
                <li>References to related entities (booking, order, trip, user, invoice)</li>
                <li>Audit fields (created_at, updated_at, payment_time, refund_time)</li>
              </ul>
            </p>
            <p>
              4. <strong>UI Components</strong>: We&apos;ve created:
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Payment management dashboard</li>
                <li>Create payment form</li>
                <li>API endpoint test page</li>
              </ul>
            </p>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}