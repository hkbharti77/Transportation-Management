'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { orderService, Order } from '@/services/orderService';

interface CompletedOrder extends Order {
  completion_date?: string;
  delivery_time?: string;
  rating?: number;
  feedback?: string;
}

export default function CompletedOrdersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const loadCompletedOrders = async () => {
    try {
      setLoading(true);
      // Fetch real completed orders from the API
      const completedOrders = await orderService.getCompletedOrders();
      
      // Transform the orders to include completion data (this would come from the API in a real implementation)
      const transformedOrders: CompletedOrder[] = completedOrders.map(order => ({
        ...order,
        completion_date: order.actual_delivery_time || order.updated_at || new Date().toISOString(),
        delivery_time: '2d 3h 10m', // This would come from the API
        rating: Math.floor(Math.random() * 2) + 4, // This would come from the API
        feedback: 'Excellent service!' // This would come from the API
      }));
      
      setOrders(transformedOrders);
      setTotalOrders(transformedOrders.length);
      setTotalRevenue(transformedOrders.reduce((sum, order) => sum + order.total_amount, 0));
    } catch (error) {
      console.error('Error loading completed orders:', error);
      // Show error message to user
      alert('Failed to load completed orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadCompletedOrders();
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
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

  const averageRating = orders.length > 0 
    ? orders.reduce((sum, order) => sum + (order.rating || 0), 0) / orders.length 
    : 0;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Completed Orders" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ✅ Completed Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review successfully completed orders and customer feedback
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadCompletedOrders}
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
        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Completed</p>
            <p className="text-2xl font-bold text-green-600">{totalOrders}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
            <p className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Revenue/Order</p>
            <p className="text-2xl font-bold text-purple-600">${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}</p>
          </div>
        </ComponentCard>
      </div>

      {/* Completed Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <ComponentCard title="Loading...">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          </ComponentCard>
        ) : orders.length === 0 ? (
          <ComponentCard>
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Completed Orders</h3>
              <p className="text-gray-600 dark:text-gray-400">No orders have been completed yet.</p>
            </div>
          </ComponentCard>
        ) : (
          orders.map((order) => (
            <ComponentCard key={order.id}>
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
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      ✅ COMPLETED
                    </Badge>
                    {order.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        {renderStars(Math.floor(order.rating))}
                        <span className="text-gray-600 dark:text-gray-400">({order.rating})</span>
                      </div>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="font-medium text-green-600">${order.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completion Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.completion_date ? formatDate(order.completion_date) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Time</p>
                    <p className="font-medium text-blue-600">{order.delivery_time || 'N/A'}</p>
                  </div>
                </div>

                {order.feedback && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Customer Feedback</p>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-500">
                      <p className="text-green-800 dark:text-green-200 italic">&quot;{order.feedback}&quot;</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Order created: {order.created_at ? formatDate(order.created_at) : 'N/A'}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/40 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      📄 View Details
                    </Button>
                    <Button
                      className="px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/40 border border-purple-200 dark:border-purple-800 rounded-lg text-sm font-medium transition-all duration-200"
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