'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { paymentService, Payment } from '@/services/paymentService';

export default function PaymentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure id is a string
  const paymentId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentId || isNaN(parseInt(paymentId))) return;
      
      try {
        setLoading(true);
        setError(null);
        const paymentData = await paymentService.getPaymentById(parseInt(paymentId));
        setPayment(paymentData);
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && paymentId && !isNaN(parseInt(paymentId))) {
      fetchPaymentDetails();
    }
  }, [isAuthenticated, paymentId]);

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/signin');
    return null;
  }

  // Invalid payment ID
  if (!paymentId || isNaN(parseInt(paymentId))) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Payment Details" />
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">⚠️ Invalid Payment ID</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The payment ID &quot;{paymentId}&quot; is not valid.
          </p>
          <Button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Payment Details" />
        <ComponentCard title="Payment Details">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-2">⚠️ Error Loading Payment</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Go Back
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  // Payment not found
  if (!payment) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Payment Details" />
        <ComponentCard title="Payment Not Found">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💳</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Payment Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No payment found with ID #{paymentId}.
              </p>
              <Button
                onClick={() => router.push('/bookings/payments')}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
              >
                View All Payments
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    const statusVariants = {
      completed: { color: 'success' as const, variant: 'light' as const },
      pending: { color: 'warning' as const, variant: 'light' as const },
      processing: { color: 'info' as const, variant: 'light' as const },
      failed: { color: 'error' as const, variant: 'light' as const },
      refunded: { color: 'primary' as const, variant: 'light' as const },
    };
    return statusVariants[status as keyof typeof statusVariants] || statusVariants.pending;
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      cash: '💵',
      card: '💳',
      upi: '📱',
      wallet: '👝',
      bank_transfer: '🏦',
      net_banking: '💻',
      crypto: '₿',
    };
    return icons[method as keyof typeof icons] || '💳';
  };

  const handleDeletePayment = async () => {
    if (!payment?.payment_id) return;
    
    if (!window.confirm(`Are you sure you want to delete payment #${payment.payment_id}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await paymentService.deletePayment(payment.payment_id);
      // Redirect to payments list after successful deletion
      alert(`Payment #${payment.payment_id} deleted successfully.`);
      router.push('/bookings/payments');
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
      alert('Failed to delete payment. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle={`Payment #${paymentId}`} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💳 Payment Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed information for payment #{paymentId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/bookings/payments')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            All Payments
          </Button>
        </div>
      </div>

      {/* Payment Details */}
      <ComponentCard title="Payment Information">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{getMethodIcon(payment.method)}</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Payment #{payment.payment_id}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Created on {new Date(payment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge {...getStatusVariant(payment.status)}>
              {payment.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="border-l-4 border-brand-500 pl-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${payment.amount.toFixed(2)}
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {payment.method.replace('_', ' ')}
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
              <p className="text-lg font-mono text-gray-900 dark:text-white">
                {payment.transaction_id || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">关联信息</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">User ID</span>
                  <span className="font-medium text-gray-900 dark:text-white">{payment.user_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Booking ID</span>
                  <span className="font-medium text-gray-900 dark:text-white">{payment.booking_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order ID</span>
                  <span className="font-medium text-gray-900 dark:text-white">{payment.order_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Trip ID</span>
                  <span className="font-medium text-gray-900 dark:text-white">{payment.trip_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Invoice ID</span>
                  <span className="font-medium text-gray-900 dark:text-white">{payment.invoice_id || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">时间信息</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created At</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(payment.created_at).toLocaleString()}
                  </span>
                </div>
                {payment.payment_time && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(payment.payment_time).toLocaleString()}
                    </span>
                  </div>
                )}
                {payment.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Updated At</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(payment.updated_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {payment.gateway_reference && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gateway Reference</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="font-mono text-gray-900 dark:text-white break-all">
                  {payment.gateway_reference}
                </p>
              </div>
            </div>
          )}

          {(payment.refund_amount || payment.refund_time || payment.refund_reason) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Refund Information</h3>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {payment.refund_amount && (
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Refund Amount</p>
                      <p className="font-bold text-purple-800 dark:text-purple-200">
                        ${payment.refund_amount.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {payment.refund_time && (
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Refund Time</p>
                      <p className="font-medium text-purple-800 dark:text-purple-200">
                        {new Date(payment.refund_time).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {payment.refund_reason && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-purple-600 dark:text-purple-400">Refund Reason</p>
                      <p className="text-purple-800 dark:text-purple-200">
                        {payment.refund_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={() => router.push('/bookings/payments')}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
        >
          Back to Payments
        </Button>
        <Button
          onClick={handleDeletePayment}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          🗑️ Delete Payment
        </Button>
        <Button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          🖨️ Print Details
        </Button>
      </div>
    </div>
  );
}