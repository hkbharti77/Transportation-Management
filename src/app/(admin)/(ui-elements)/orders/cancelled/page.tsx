'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { orderService, Order } from '@/services/orderService';

// Update the Order interface to match the actual Order interface from the service
interface CancelledOrder extends Order {
  cancellation_date?: string;
  cancellation_reason?: string;
  refund_status?: 'pending' | 'processed' | 'denied';
  refund_amount?: number;
}

export default function CancelledOrdersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<CancelledOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);

  const loadCancelledOrders = async () => {
    try {
      setLoading(true);
      // Fetch real cancelled orders from the API
      const cancelledOrders = await orderService.getOrdersByStatus('cancelled');
      
      // Transform the orders to include cancellation data (this would come from the API in a real implementation)
      const transformedOrders: CancelledOrder[] = cancelledOrders.map(order => ({
        ...order,
        cancellation_date: order.updated_at || new Date().toISOString(),
        cancellation_reason: 'Cancelled by customer', // This would come from the API
        refund_status: 'pending', // This would come from the API
        refund_amount: order.total_amount * 0.8 // This would come from the API
      }));
      
      setOrders(transformedOrders);
      setTotalOrders(transformedOrders.length);
      setTotalLoss(transformedOrders.reduce((sum, order) => sum + order.total_amount, 0));
    } catch (error) {
      console.error('Error loading cancelled orders:', error);
      // Show error message to user
      alert('Failed to load cancelled orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadCancelledOrders();
    }
  }, [isAuthenticated, user]);

  const getOrderTypeIcon = (cargoType: string) => {
    const icons = {
      general: '📦',
      fragile: '🛡️',
      hazardous: '⚠️',
      perishable: '🍎',
      liquid: '💧',
      bulk: '🚛',
    };
    return icons[cargoType as keyof typeof icons] || '📦';
  };

  const getRefundStatusColor = (status: string): "warning" | "success" | "error" => {
    const colors: Record<string, "warning" | "success" | "error"> = {
      pending: 'warning',
      processed: 'success',
      denied: 'error',
    };
    return colors[status] || 'warning';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const totalRefunded = orders.reduce((sum, order) => sum + (order.refund_amount || 0), 0);
  const refundRate = totalOrders > 0 ? (totalRefunded / totalLoss * 100) : 0;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Cancelled Orders" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ❌ Cancelled Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review cancelled orders and manage refund processes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadCancelledOrders}
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComponentCard title="Total Cancelled">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{totalOrders}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Revenue Loss">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💸</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Loss</p>
            <p className="text-2xl font-bold text-red-600">${totalLoss.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Refunded">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Refunded</p>
            <p className="text-2xl font-bold text-orange-600">${totalRefunded.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Refund Rate">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Refund Rate</p>
            <p className="text-2xl font-bold text-purple-600">{refundRate.toFixed(1)}%</p>
          </div>
        </ComponentCard>
      </div>

      {/* Cancellation Analysis */}
      <ComponentCard title="Cancellation Analysis">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-2 border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Customer Initiated</h3>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.cancellation_reason?.includes('Customer')).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Customer changed plans</p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Service Issues</h3>
              <p className="text-2xl font-bold text-orange-600">
                {orders.filter(o => o.cancellation_reason?.includes('breakdown') || o.cancellation_reason?.includes('unable')).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle/service problems</p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Policy Violations</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.cancellation_reason?.includes('Late')).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Late cancellations</p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Cancelled Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <ComponentCard title="Loading...">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          </ComponentCard>
        ) : orders.length === 0 ? (
          <ComponentCard title="No Cancelled Orders">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Cancelled Orders</h3>
              <p className="text-gray-600 dark:text-gray-400">All orders are proceeding successfully.</p>
            </div>
          </ComponentCard>
        ) : (
          orders.map((order) => (
            <ComponentCard key={order.id} title={`Cancelled Order #${order.id}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getOrderTypeIcon(order.cargo_type)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Order #{order.id}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Customer: {order.customer_id} • {order.cargo_type.charAt(0).toUpperCase() + order.cargo_type.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant="light" color="error">
                      ❌ CANCELLED
                    </Badge>
                    {order.refund_status && (
                      <Badge variant="light" color={getRefundStatusColor(order.refund_status)}>
                        {order.refund_status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Route</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.pickup_location} → {order.drop_location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Amount</p>
                    <p className="font-medium text-red-600">${order.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.cancellation_date ? formatDate(order.cancellation_date) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Refund Amount</p>
                    <p className="font-medium text-green-600">
                      {order.refund_amount ? `$${order.refund_amount.toFixed(2)}` : '$0.00'}
                    </p>
                  </div>
                </div>

                {order.cancellation_reason && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Cancellation Reason</p>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-l-4 border-red-500">
                      <p className="text-red-800 dark:text-red-200">{order.cancellation_reason}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Order created: {order.created_at ? formatDate(order.created_at) : 'N/A'}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/40 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      📄 View Details
                    </Button>
                    {order.refund_status === 'pending' && (
                      <Button
                        className="px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/40 border border-green-200 dark:border-green-800 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        💰 Process Refund
                      </Button>
                    )}
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