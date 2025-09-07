'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { orderService, Order } from '@/services/orderService';

export default function PendingOrdersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);

  const loadPendingOrders = async () => {
    try {
      setLoading(true);
      // Fetch real pending orders from the API
      const pendingOrders = await orderService.getPendingOrders();
      setOrders(pendingOrders);
      setTotalOrders(pendingOrders.length);
    } catch (error) {
      console.error('Error loading pending orders:', error);
      // Show error message to user
      alert('Failed to load pending orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadPendingOrders();
    }
  }, [isAuthenticated, user]);

  const handleApproveOrder = async (orderId: number) => {
    try {
      // Call the API to approve the order
      const approvedOrder = await orderService.approveOrder(orderId);
      
      // Update the UI to reflect the change
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'confirmed' } : order
      ));
      
      // Show success message or update total orders count
      setTotalOrders(prev => prev - 1);
    } catch (error) {
      console.error('Error approving order:', error);
      // Show error message to user
      alert('Failed to approve order. Please try again.');
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    try {
      // Call the API to reject the order
      const rejectedOrder = await orderService.rejectOrder(orderId);
      
      // Update the UI to reflect the change
      setOrders(prev => prev.filter(order => order.id !== orderId));
      
      // Show success message or update total orders count
      setTotalOrders(prev => prev - 1);
    } catch (error) {
      console.error('Error rejecting order:', error);
      // Show error message to user
      alert('Failed to reject order. Please try again.');
    }
  };

  const getCargoTypeBadgeColor = (cargoType: Order['cargo_type']) => {
    switch (cargoType) {
      case 'hazardous':
        return 'error';
      case 'fragile':
        return 'warning';
      case 'perishable':
        return 'info';
      case 'liquid':
        return 'primary';
      case 'bulk':
        return 'light';
      default:
        return 'success';
    }
  };

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'assigned':
        return 'primary';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'light';
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Pending Orders" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ⏳ Pending Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve pending customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadPendingOrders}
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Info */}
      <ComponentCard title="Order Status">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>{totalOrders}</strong> orders awaiting approval and processing
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Pending Orders Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <ComponentCard title="Loading...">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          </ComponentCard>
        ) : orders.length === 0 ? (
          <ComponentCard title="No Pending Orders">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">⏳</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Pending Orders</h3>
              <p className="text-gray-600 dark:text-gray-400">All orders have been processed.</p>
            </div>
          </ComponentCard>
        ) : (
          orders.map((order) => (
            <ComponentCard key={order.id} title={`Order #${order.id}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Order #{order.id}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Customer: {order.customer_id} • {order.cargo_type.charAt(0).toUpperCase() + order.cargo_type.slice(1)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge
                      size="sm"
                      color={getCargoTypeBadgeColor(order.cargo_type)}
                    >
                      {order.cargo_type}
                    </Badge>
                    <Badge 
                      size="sm"
                      color={getStatusBadgeColor(order.status)}
                    >
                      PENDING APPROVAL
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Route</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.pickup_location} → {order.drop_location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="font-medium text-green-600">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.created_at ? formatDate(order.created_at) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.estimated_delivery_time ? formatDate(order.estimated_delivery_time) : 'TBD'}
                    </p>
                  </div>
                </div>

                {order.cargo_weight && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.cargo_weight} kg</p>
                  </div>
                )}

                {order.cargo_description && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cargo Description</p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                      <p className="text-blue-800 dark:text-blue-200">{order.cargo_description}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => order.id && handleRejectOrder(order.id)}
                    className="px-6 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-800/40 border-2 border-red-200 dark:border-red-800 rounded-lg font-medium transition-all duration-200"
                    disabled={!order.id}
                  >
                    ❌ Reject
                  </Button>
                  <Button
                    onClick={() => order.id && handleApproveOrder(order.id)}
                    className="px-6 py-2 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/40 border-2 border-green-200 dark:border-green-800 rounded-lg font-medium transition-all duration-200"
                    disabled={!order.id}
                  >
                    ✅ Approve Order
                  </Button>
                </div>
              </div>
            </ComponentCard>
          ))
        )}
      </div>
    </div>
  );
}