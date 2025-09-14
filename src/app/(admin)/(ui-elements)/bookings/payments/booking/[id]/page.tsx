'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Badge from '@/components/ui/badge/Badge';
import { paymentService, Payment } from '@/services/paymentService';

export default function BookingPaymentsPage() {
  const { user, isAuthenticated } = useAuth();
  const { id } = useParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const paymentData = await paymentService.getPaymentsByBookingId(Number(id));
      setPayments(paymentData);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && id) {
      loadPayments();
    }
  }, [isAuthenticated, user, id, loadPayments]);

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, "primary" | "success" | "error" | "warning" | "info" | "light" | "dark"> = {
      completed: "success",
      pending: "warning",
      processing: "info",
      failed: "error",
      refunded: "dark",
    };
    return statusColors[status] || "light";
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      cash: '💵',
      card: '💳',
      upi: '📱',
      wallet: '',
      bank_transfer: '🏦',
      net_banking: '💻',
      crypto: '₿',
    };
    return icons[method as keyof typeof icons] || '💳';
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Booking Payments" />
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle={`Booking #${id} Payments`} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💳 Payments for Booking #{id}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View all payments associated with this booking
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <ComponentCard title="No Payments Found">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Payments Found</h3>
            <p className="text-gray-600 dark:text-gray-400">No payments have been made for this booking yet.</p>
          </div>
        </ComponentCard>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {payments.map((payment) => (
              <ComponentCard key={payment.payment_id} title={`Payment #${payment.payment_id}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{getMethodIcon(payment.method)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Payment #{payment.payment_id}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Amount: ${payment.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge color={getStatusColor(payment.status)}>
                        {payment.status.toUpperCase()}
                      </Badge>
                      <Badge color="light">
                        {payment.method.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                      <p className="font-mono text-sm">{payment.transaction_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gateway Reference</p>
                      <p className="font-mono text-sm">{payment.gateway_reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Created At</p>
                      <p className="font-medium">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment Time</p>
                      <p className="font-medium">
                        {payment.payment_time 
                          ? new Date(payment.payment_time).toLocaleDateString()
                          : 'Not processed'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {payment.user_id > 0 && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                        <p className="font-medium">#{payment.user_id}</p>
                      </div>
                    )}
                    
                    {payment.order_id > 0 && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                        <p className="font-medium">#{payment.order_id}</p>
                      </div>
                    )}
                    
                    {payment.trip_id > 0 && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Trip ID</p>
                        <p className="font-medium">#{payment.trip_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              </ComponentCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}