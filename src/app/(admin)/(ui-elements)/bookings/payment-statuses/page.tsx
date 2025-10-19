'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';

interface PaymentStatus {
  id: string;
  name: string;
  description: string;
  color: string;
  count?: number;
}

export default function PaymentStatusesPage() {
  const { user, isAuthenticated } = useAuth();
  const [paymentStatuses] = useState<PaymentStatus[]>([
    { id: 'pending', name: 'Pending', description: 'Payment initiated but not yet processed', color: 'bg-yellow-500' },
    { id: 'processing', name: 'Processing', description: 'Payment is being processed by the gateway', color: 'bg-blue-500' },
    { id: 'paid', name: 'Paid', description: 'Payment successfully completed', color: 'bg-green-500' },
    { id: 'failed', name: 'Failed', description: 'Payment attempt failed', color: 'bg-red-500' },
    { id: 'refunded', name: 'Refunded', description: 'Payment has been refunded to the customer', color: 'bg-purple-500' },
    { id: 'cancelled', name: 'Cancelled', description: 'Payment was cancelled by the user', color: 'bg-gray-500' },
    { id: 'expired', name: 'Expired', description: 'Payment link or session has expired', color: 'bg-orange-500' },
  ]);
  const [, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentStatuses = async () => {
      if (!isAuthenticated || user?.role !== 'admin') return;
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation:
        // const statuses = await paymentService.getPaymentStatuses();
        // setPaymentStatuses(statuses.map(status => ({
        //   id: status,
        //   name: status.charAt(0).toUpperCase() + status.slice(1),
        //   description: `${status} payment status`,
        //   color: getColorForStatus(status)
        // })));
      } catch (err) {
        console.error('Error loading payment statuses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load payment statuses');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentStatuses();
  }, [isAuthenticated, user]);


  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Payment Statuses" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Payment Statuses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of all payment status types and their meanings
          </p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentStatuses.map((status) => (
          <ComponentCard key={status.id} title={`${status.name} Status`}>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${status.color}`}></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {status.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {status.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status ID</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{status.id}</span>
                </div>
              </div>
            </div>
          </ComponentCard>
        ))}
      </div>

      <ComponentCard title="Status Flow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Status Flow</h2>
          <div className="overflow-x-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Pending</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2"></div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Processing</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2"></div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Paid</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <h3 className="font-medium text-red-800 dark:text-red-200">Failed</h3>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  Payment attempts that fail will be marked as failed. Customers can retry failed payments.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <h3 className="font-medium text-purple-800 dark:text-purple-200">Refunded</h3>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                  Successful payments can be refunded to the customer&apos;s original payment method.
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Cancelled</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  Payments can be cancelled by customers before processing is complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}