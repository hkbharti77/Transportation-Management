'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { paymentService, ProcessPaymentRequest, ProcessPaymentResponse } from '@/services/paymentService';

export default function ProcessPaymentPage() {
  const { user, isAuthenticated } = useAuth();
  const [paymentId, setPaymentId] = useState<number>(17);
  const [gatewayData, setGatewayData] = useState({
    card_number: '4111111111111111',
    expiry: '12/25',
    cvv: '123'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessPaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'payment_id') {
      setPaymentId(value === '' ? 0 : Number(value));
    } else {
      setGatewayData(prev => ({
        ...prev,
        [name]: value
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
      
      const requestData: ProcessPaymentRequest = {
        gateway_data: gatewayData
      };
      
      // Process payment using the real API
      const response = await paymentService.processPayment(paymentId, requestData);
      setResult(response);
      
      // Mock response for demonstration
      // setResult({
      //   success: true,
      //   transaction_id: "PAY_1234567890ABCDEF",
      //   status: "processing",
      //   message: "Payment gateway redirect required",
      //   redirect_url: "https://api.testgateway.com/v1/pay/REF_1234567890AB"
      // });
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Process Payment" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💳 Process Payment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Process payment through payment gateway
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment ID
                </label>
                <input
                  type="number"
                  name="payment_id"
                  value={paymentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  name="card_number"
                  value={gatewayData.card_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  name="expiry"
                  value={gatewayData.expiry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  placeholder="12/25"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={gatewayData.cvv}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  {loading ? 'Processing Payment...' : 'Process Payment'}
                </Button>
              </div>
            </form>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Processing Information</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">How It Works</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Enter the payment ID and card details to process the payment through the payment gateway.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-800 dark:text-green-200">Supported Gateways</h3>
                <ul className="text-sm text-green-700 dark:text-green-300 mt-1 list-disc list-inside">
                  <li>Stripe</li>
                  <li>PayPal</li>
                  <li>Razorpay</li>
                  <li>Authorize.Net</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-medium text-purple-800 dark:text-purple-200">Security</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  All payment data is encrypted and securely transmitted to the payment gateway.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Important Notes</h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 list-disc list-inside">
                  <li>Test card numbers are provided for development</li>
                  <li>Real payments require valid card details</li>
                  <li>Redirect URLs are provided for 3D Secure authentication</li>
                </ul>
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
              Payment Processing Result
            </h2>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {result.success ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {result.status}
                  </span>
                </div>
                {result.transaction_id && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{result.transaction_id}</p>
                  </div>
                )}
              </div>
              {result.message && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Message</p>
                  <p className="font-medium text-gray-900 dark:text-white">{result.message}</p>
                </div>
              )}
              {result.redirect_url && (
                <div className="mt-6">
                  <Button
                    onClick={() => window.open(result!.redirect_url, '_blank')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Proceed to Payment Gateway
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}