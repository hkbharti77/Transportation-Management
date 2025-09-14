'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { paymentService } from '@/services/paymentService';

export default function CreatePaymentPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: 150,
    method: 'bank_transfer' as 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer' | 'net_banking' | 'crypto',
    booking_id: 17,
    order_id: 1,
    trip_id: 3,
    user_id: 3,
    invoice_id: 9,
    gateway_reference: 'PAY-9A7X3B2C'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const paymentData = {
        amount: formData.amount,
        method: formData.method,
        booking_id: formData.booking_id || undefined,
        order_id: formData.order_id || undefined,
        trip_id: formData.trip_id || undefined,
        user_id: formData.user_id || undefined,
        invoice_id: formData.invoice_id || undefined,
        gateway_reference: formData.gateway_reference
      };

      const result = await paymentService.createPayment(paymentData);
      console.log('Payment created:', result);
      setSuccess(true);
    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Create Payment" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💳 Create New Payment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Process a new payment for bookings, orders, or trips
          </p>
        </div>
      </div>

      <ComponentCard title="">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-800 dark:text-green-200">
                    Payment created successfully!
                  </p>
                </div>
              </div>
            )}

            {error && (
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
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method *
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="wallet">Wallet</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Booking ID
                </label>
                <input
                  type="number"
                  name="booking_id"
                  value={formData.booking_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order ID
                </label>
                <input
                  type="number"
                  name="order_id"
                  value={formData.order_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trip ID
                </label>
                <input
                  type="number"
                  name="trip_id"
                  value={formData.trip_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <input
                  type="number"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Invoice ID
                </label>
                <input
                  type="number"
                  name="invoice_id"
                  value={formData.invoice_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gateway Reference
                </label>
                <input
                  type="text"
                  name="gateway_reference"
                  value={formData.gateway_reference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                onClick={() => setFormData({
                  amount: 150,
                  method: 'bank_transfer',
                  booking_id: 17,
                  order_id: 1,
                  trip_id: 3,
                  user_id: 3,
                  invoice_id: 9,
                  gateway_reference: 'PAY-9A7X3B2C'
                })}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium"
              >
                Reset to Example
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Create Payment'
                )}
              </Button>
            </div>
          </form>
        </div>
      </ComponentCard>

      <ComponentCard title="API Endpoint Information">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Payment API Endpoint</h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <code className="text-sm text-gray-800 dark:text-gray-200">
              POST http://localhost:8000/api/v1/payments/
            </code>
          </div>
          
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Example Request Body</h4>
          <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "amount": ${formData.amount},
  "method": "${formData.method}",
  "booking_id": ${formData.booking_id},
  "order_id": ${formData.order_id},
  "trip_id": ${formData.trip_id},
  "user_id": ${formData.user_id},
  "invoice_id": ${formData.invoice_id},
  "gateway_reference": "${formData.gateway_reference}"
}`}
          </pre>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Response (201 Created)</h4>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "amount": ${formData.amount},
  "method": "${formData.method}",
  "booking_id": ${formData.booking_id},
  "order_id": ${formData.order_id},
  "trip_id": ${formData.trip_id},
  "payment_id": 0,
  "user_id": ${formData.user_id},
  "invoice_id": ${formData.invoice_id},
  "status": "pending",
  "transaction_id": "string",
  "gateway_reference": "${formData.gateway_reference}",
  "payment_time": null,
  "refund_time": null,
  "refund_amount": null,
  "refund_reason": null,
  "created_at": "2025-09-11T00:00:00Z",
  "updated_at": null
}`}
            </pre>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}