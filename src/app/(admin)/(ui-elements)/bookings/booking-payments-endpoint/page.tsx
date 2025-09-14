'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { paymentService } from '@/services/paymentService';
import { invoiceService } from '@/services/invoiceService';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  data?: unknown;
  error?: string;
}

export default function BookingPaymentsEndpointTestPage() {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState('17');

  const formatDataForDisplay = (data: unknown): string => {
    if (data === null || data === undefined) {
      return '';
    }
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error formatting data for display:", error);
      return String(data);
    }
  };

  const runAllTests = async () => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    
    setLoading(true);
    setTestResults([]);
    
    const results: TestResult[] = [];
    
    // Test 1: Get Payments by Booking ID
    try {
      const result = await paymentService.getPaymentsByBookingId(Number(bookingId));
      results.push({
        endpoint: "Get Payments by Booking ID",
        status: "success",
        data: result
      });
    } catch (error) {
      results.push({
        endpoint: "Get Payments by Booking ID",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    
    // Test 2: Get All Payments
    try {
      const result = await paymentService.getPayments({});
      results.push({
        endpoint: "Get All Payments",
        status: "success",
        data: result
      });
    } catch (error) {
      results.push({
        endpoint: "Get All Payments",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    
    // Test 3: Search Payments
    try {
      const result = await paymentService.searchPayments({});
      results.push({
        endpoint: "Search Payments",
        status: "success",
        data: result
      });
    } catch (error) {
      results.push({
        endpoint: "Search Payments",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    
    // Test 4: Get Payment Statistics
    try {
      const result = await paymentService.getPaymentStatistics();
      results.push({
        endpoint: "Get Payment Statistics",
        status: "success",
        data: result
      });
    } catch (error) {
      results.push({
        endpoint: "Get Payment Statistics",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    
    // Test 5: Get Payment Methods
    try {
      const result = await paymentService.getPaymentMethods();
      results.push({
        endpoint: "Get Payment Methods",
        status: "success",
        data: result
      });
    } catch (error) {
      results.push({
        endpoint: "Get Payment Methods",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    
    // Test 6: Get Payment Statuses
    try {
      const result = await paymentService.getPaymentStatuses();
      results.push({
        endpoint: "Get Payment Statuses",
        status: "success",
        data: result
      });
    } catch (error) {
      results.push({
        endpoint: "Get Payment Statuses",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    
    // Test 7: Get User Payments
    try {
      const result = await paymentService.getUserPayments();
      results.push({
        endpoint: "Get User Payments",
        status: "success",
        data: result
      });
    } catch (error) {
      results.push({
        endpoint: "Get User Payments",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    
    // Test 8: Get User Invoices
    try {
      const result = await invoiceService.getUserInvoices(user?.id || 1);
      results.push({
        endpoint: "Get User Invoices",
        status: "success",
        data: result
      });
    } catch (error) {
      results.push({
        endpoint: "Get User Invoices",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    
    // Test 9: Search Invoices
    try {
      const result = await invoiceService.searchInvoices({});
      results.push({
        endpoint: "Search Invoices",
        status: "success",
        data: result
      });
    } catch (error) {
      results.push({
        endpoint: "Search Invoices",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    
    // Test 10: Get Invoice Statistics
    try {
      const result = await invoiceService.getInvoiceStatistics();
      results.push({
        endpoint: "Get Invoice Statistics",
        status: "success",
        data: result
      });
    } catch (error) {
      results.push({
        endpoint: "Get Invoice Statistics",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    
    setTestResults(results);
    setLoading(false);
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Booking Payments API Test" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🧪 Booking Payments API Endpoints Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test multiple payment and invoice API endpoints
          </p>
        </div>
        <Button
          onClick={runAllTests}
          disabled={loading}
          className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run All Tests'}
        </Button>
      </div>

      <ComponentCard title="GET Booking Payments">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">GET Booking Payments</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Booking ID
              </label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Endpoint</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                GET http://localhost:8000/api/v1/payments/booking/{bookingId}
              </code>
            </div>
          </div>

          <Button
            onClick={runAllTests}
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
              'Test All Payment Endpoints'
            )}
          </Button>
        </div>
      </ComponentCard>

      <ComponentCard title="Test Results">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Results</h2>
          
          {testResults.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">🧪</div>
              <p className="text-gray-600 dark:text-gray-400">
                Click &quot;Run All Tests&quot; to test all payment API endpoints
              </p>
            </div>
          )}
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Running tests... ({testResults.length}/10 completed)
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  result.status === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : result.status === 'error' 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {String(result.endpoint)}
                    </h3>
                    {result.status === 'success' && result.data !== undefined && result.data !== null && (
                      <pre className="mt-2 text-xs text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                        <span>{formatDataForDisplay(result.data)}</span>
                      </pre>
                    )}
                    {result.status === 'error' && result.error && (
                      <p className="mt-2 text-sm text-red-800 dark:text-red-200">
                        {String(result.error)}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    result.status === 'success' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : result.status === 'error' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {result.status === 'success' ? 'Success' : result.status === 'error' ? 'Error' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Implementation Notes">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How to Use the Payment API</h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              1. <strong>GET Booking Payments</strong>: Retrieve all payments associated with a specific booking ID.
            </p>
            <p>
              2. <strong>Parameters</strong>:
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li><code>booking_id</code> (path parameter): The ID of the booking whose payments to retrieve</li>
              </ul>
            </p>
            <p>
              3. <strong>Additional Endpoints</strong>: This test page now includes:
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Get all payments (no filters)</li>
                <li>Search payments with filters</li>
                <li>Get payment statistics</li>
                <li>Get available payment methods</li>
                <li>Get available payment statuses</li>
                <li>Get payments for current user</li>
                <li>Get invoices for current user</li>
                <li>Search invoices with filters</li>
                <li>Get invoice statistics</li>
              </ul>
            </p>
            <p>
              4. <strong>Navigation</strong>: The booking payments page can be accessed from the booking management section.
            </p>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}