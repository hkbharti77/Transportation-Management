'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

interface Payment {
  id: number;
  booking_id: number;
  customer_name: string;
  amount: number;
  payment_method: 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'cash';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';
  transaction_id: string;
  payment_date: string;
  trip_route: string;
  seat_number: string;
  gateway_response?: string;
  refund_amount?: number;
  refund_reason?: string;
}

export default function PaymentManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock payment data
  const mockPayments: Payment[] = [
    {
      id: 1,
      booking_id: 101,
      customer_name: "Alice Johnson",
      amount: 450.00,
      payment_method: 'credit_card',
      payment_status: 'completed',
      transaction_id: "TXN001234567890",
      payment_date: '2024-01-15T09:45:00Z',
      trip_route: "Mumbai → Pune",
      seat_number: "A12",
      gateway_response: "Payment successful via Visa ending 4532"
    },
    {
      id: 2,
      booking_id: 102,
      customer_name: "Bob Smith",
      amount: 280.00,
      payment_method: 'upi',
      payment_status: 'pending',
      transaction_id: "UPI987654321012",
      payment_date: '2024-01-15T11:30:00Z',
      trip_route: "Delhi → Gurgaon",
      seat_number: "B05",
      gateway_response: "Awaiting customer confirmation"
    },
    {
      id: 3,
      booking_id: 103,
      customer_name: "Carol Williams",
      amount: 650.00,
      payment_method: 'net_banking',
      payment_status: 'completed',
      transaction_id: "NBK456789123456",
      payment_date: '2024-01-14T16:50:00Z',
      trip_route: "Chennai → Bangalore",
      seat_number: "C08",
      gateway_response: "HDFC Bank transfer successful"
    },
    {
      id: 4,
      booking_id: 104,
      customer_name: "David Brown",
      amount: 180.00,
      payment_method: 'debit_card',
      payment_status: 'failed',
      transaction_id: "DEB789012345678",
      payment_date: '2024-01-13T14:25:00Z',
      trip_route: "Kolkata → Howrah",
      seat_number: "D03",
      gateway_response: "Insufficient funds in account"
    },
    {
      id: 5,
      booking_id: 105,
      customer_name: "Eva Davis",
      amount: 120.00,
      payment_method: 'credit_card',
      payment_status: 'refunded',
      transaction_id: "REF345678901234",
      payment_date: '2024-01-12T10:35:00Z',
      trip_route: "Hyderabad → Secunderabad",
      seat_number: "E15",
      gateway_response: "Refund processed successfully",
      refund_amount: 96.00,
      refund_reason: "Booking cancelled by customer"
    },
    {
      id: 6,
      booking_id: 106,
      customer_name: "Frank Miller",
      amount: 520.00,
      payment_method: 'upi',
      payment_status: 'processing',
      transaction_id: "UPI567890123456",
      payment_date: '2024-01-16T08:15:00Z',
      trip_route: "Pune → Mumbai",
      seat_number: "F18",
      gateway_response: "Payment being processed"
    }
  ];

  const loadPayments = useCallback(async () => {
    try {
      setTimeout(() => {
        let filteredPayments = mockPayments;
        
        if (filterStatus !== 'all') {
          filteredPayments = mockPayments.filter(payment => payment.payment_status === filterStatus);
        }
        
        setPayments(filteredPayments);
      }, 1000);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  }, [filterStatus]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadPayments();
    }
  }, [isAuthenticated, user, loadPayments]);

  const handleRetryPayment = (paymentId: number) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { ...payment, payment_status: 'processing' as const, gateway_response: 'Retrying payment...' } 
        : payment
    ));
  };

  const handleProcessRefund = (paymentId: number) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { ...payment, payment_status: 'refunded' as const, refund_amount: payment.amount * 0.8 } 
        : payment
    ));
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      credit_card: '💳',
      debit_card: '💳',
      upi: '📱',
      net_banking: '🏦',
      cash: '💵',
    };
    return icons[method as keyof typeof icons] || '💳';
  };

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
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {/* Payment Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
            <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Failed Amount</p>
            <p className="text-2xl font-bold text-red-600">${failedAmount.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {mockPayments.length > 0 ? ((mockPayments.filter(p => p.payment_status === 'completed').length / mockPayments.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </ComponentCard>
      </div>

      {/* Payments List */}
      <div className="grid grid-cols-1 gap-6">
        {payments.length === 0 ? (
          <ComponentCard>
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💳</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Payments Found</h3>
              <p className="text-gray-600 dark:text-gray-400">No payments match the selected filter criteria.</p>
            </div>
          </ComponentCard>
        ) : (
          payments.map((payment) => (
            <ComponentCard key={payment.id}>
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
                    <Badge className={getStatusBadge(payment.payment_status)}>
                      {payment.payment_status.toUpperCase()}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 text-xs">
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

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Transaction processed: {new Date(payment.payment_date).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
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
                      className="px-4 py-2 text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-800/40 border border-orange-200 dark:border-orange-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      📊 Generate Report
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