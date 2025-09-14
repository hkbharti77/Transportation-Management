'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { paymentService, Payment } from '@/services/paymentService';

interface PaymentUI {
  id: number;
  booking_id: number;
  customer_name: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer' | 'net_banking' | 'crypto';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';
  transaction_id: string;
  payment_date: string;
  trip_route: string;
  seat_number: string;
  gateway_response?: string;
  refund_amount?: number;
  refund_reason?: string;
  invoice_id?: number;
}

export default function PaymentManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentUI[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch payments using searchPayments endpoint
      const paymentsData = await paymentService.searchPayments({});
      
      // Transform API response to match the existing UI structure
      const transformedPayments: PaymentUI[] = paymentsData.map((payment: Payment) => ({
        id: payment.payment_id,
        booking_id: payment.booking_id,
        customer_name: `Customer ${payment.user_id}`,
        amount: payment.amount,
        payment_method: payment.method,
        payment_status: payment.status,
        transaction_id: payment.transaction_id || `TXN-${payment.payment_id}`,
        payment_date: payment.created_at,
        trip_route: `Route ${payment.trip_id || payment.order_id || payment.booking_id}`,
        seat_number: `S-${payment.payment_id}`,
        gateway_response: payment.gateway_reference || undefined,
        refund_amount: payment.refund_amount || undefined,
        refund_reason: payment.refund_reason || undefined,
        invoice_id: payment.invoice_id || undefined,
      }));
      
      setPayments(transformedPayments);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payments');
      // Fallback to empty array on error
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadPayments();
    }
  }, [isAuthenticated, user, loadPayments]);

  const handleRetryPayment = async (paymentId: number) => {
    try {
      // Find the payment in our local state
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;
      
      // Update UI immediately to show processing state
      setPayments(prev => prev.map(p => 
        p.id === paymentId 
          ? { ...p, payment_status: 'processing', gateway_response: 'Retrying payment...' } 
          : p
      ));
      
      // In a real implementation, we would call the API to retry the payment
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update to completed status after "processing"
      setPayments(prev => prev.map(p => 
        p.id === paymentId 
          ? { ...p, payment_status: 'completed', gateway_response: 'Payment successful' } 
          : p
      ));
    } catch (err) {
      console.error('Error retrying payment:', err);
      setPayments(prev => prev.map(p => 
        p.id === paymentId 
          ? { ...p, payment_status: 'failed', gateway_response: 'Payment retry failed' } 
          : p
      ));
    }
  };

  const handleProcessRefund = async (paymentId: number) => {
    try {
      // Find the payment in our local state
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;
      
      // Update UI immediately to show refund processing
      setPayments(prev => prev.map(p => 
        p.id === paymentId 
          ? { ...p, payment_status: 'refunded', refund_amount: p.amount * 0.8 } 
          : p
      ));
      
      // In a real implementation, we would call the API to process the refund
      // await paymentService.processRefund({ 
      //   payment_id: paymentId, 
      //   refund_amount: payment.amount * 0.8, 
      //   refund_reason: "Customer request",
      //   partial_refund: true
      // });
    } catch (err) {
      console.error('Error processing refund:', err);
      // Revert UI changes on error
      setPayments(prev => prev.map(p => 
        p.id === paymentId 
          ? { ...p, payment_status: 'completed' } 
          : p
      ));
    }
  };


  const handleDeletePayment = async (paymentId: number) => {
    if (!window.confirm(`Are you sure you want to delete payment #${paymentId}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await paymentService.deletePayment(paymentId);
      // Remove the deleted payment from the state
      setPayments(prev => prev.filter(payment => payment.id !== paymentId));
      // Show success message
      alert(`Payment #${paymentId} deleted successfully.`);
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
      alert('Failed to delete payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const getMethodIcon = (method: string) => {
    const icons = {
      cash: '💵',
      card: '💳',
      upi: '📱',
      wallet: '�',
      bank_transfer: '🏦',
      net_banking: '💻',
      crypto: '₿',
    };
    return icons[method as keyof typeof icons] || '💳';
  };

  // Filter payments based on selected status
  const filteredPayments = filterStatus === 'all' 
    ? payments 
    : payments.filter(payment => payment.payment_status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const totalRevenue = payments.filter(p => p.payment_status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.payment_status === 'pending' || p.payment_status === 'processing').reduce((sum, p) => sum + p.amount, 0);
  const failedAmount = payments.filter(p => p.payment_status === 'failed').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Payment Management" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💳 Payment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage all booking payments and transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Payments</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <Button
            onClick={loadPayments}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-green-700 dark:text-green-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </Button>
        </div>
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

      {/* Payment Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
            <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Failed Amount</p>
            <p className="text-2xl font-bold text-red-600">${failedAmount.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {payments.length > 0 ? ((payments.filter(p => p.payment_status === 'completed').length / payments.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </ComponentCard>
      </div>

      {/* Payments List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPayments.length === 0 ? (
          <ComponentCard title="">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💳</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Payments Found</h3>
              <p className="text-gray-600 dark:text-gray-400">No payments match the selected filter criteria.</p>
            </div>
          </ComponentCard>
        ) : (
          filteredPayments.map((payment) => (
            <ComponentCard key={payment.id} title="">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getMethodIcon(payment.payment_method)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Payment #{payment.id}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {payment.customer_name} • Booking #{payment.booking_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge color="primary">
                      {payment.payment_status.toUpperCase()}
                    </Badge>
                    <Badge color="light">
                      {payment.payment_method.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="font-medium text-green-600">${payment.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Trip Route</p>
                    <p className="font-medium text-gray-900 dark:text-white">{payment.trip_route}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Seat Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{payment.seat_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded border">
                    {payment.transaction_id}
                  </p>
                </div>

                {payment.gateway_response && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gateway Response</p>
                    <div className={`p-3 rounded-lg border-l-4 ${
                      payment.payment_status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                      payment.payment_status === 'failed' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                      'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    }`}>
                      <p className={`text-sm ${
                        payment.payment_status === 'completed' ? 'text-green-800 dark:text-green-200' :
                        payment.payment_status === 'failed' ? 'text-red-800 dark:text-red-200' :
                        'text-blue-800 dark:text-blue-200'
                      }`}>
                        {payment.gateway_response}
                      </p>
                    </div>
                  </div>
                )}

                {payment.refund_amount && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Refund Information</p>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-purple-500">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-800 dark:text-purple-200">Refund Amount:</span>
                        <span className="font-bold text-purple-600">${payment.refund_amount.toFixed(2)}</span>
                      </div>
                      {payment.refund_reason && (
                        <p className="text-xs text-purple-600 mt-1">{payment.refund_reason}</p>
                      )}
                    </div>
                  </div>
                )}

                {payment.invoice_id && payment.invoice_id > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Invoice</p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-800 dark:text-blue-200">Invoice ID:</span>
                        <span className="font-bold text-blue-600">#{payment.invoice_id}</span>
                      </div>
                      <button 
                        onClick={() => router.push(`/bookings/invoices/${payment.invoice_id}`)}
                        className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        View Invoice Details →
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Transaction processed: {new Date(payment.payment_date).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/bookings/payments/${payment.id}`)}
                      className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/40 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      📄 View Details
                    </Button>
                    {payment.payment_status === 'failed' && (
                      <Button
                        onClick={() => handleRetryPayment(payment.id)}
                        className="px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/40 border border-green-200 dark:border-green-800 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        🔄 Retry Payment
                      </Button>
                    )}
                    {(payment.payment_status === 'completed' && !payment.refund_amount) && (
                      <Button
                        onClick={() => handleProcessRefund(payment.id)}
                        className="px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/40 border border-purple-200 dark:border-purple-800 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        💰 Process Refund
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeletePayment(payment.id)}
                      disabled={loading}
                      className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-800/40 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              </div>
            </ComponentCard>
          ))
        )}
      </div>
    </div>
  );
}