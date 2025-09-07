'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { orderService, Order, OrderStats } from '@/services/orderService';

export default function OrderDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real stats data from the API
      const [stats, recentOrdersResult] = await Promise.all([
        orderService.getOrderStats(),
        orderService.getOrders({ limit: 5 })
      ]);

      setDashboardData(stats);
      setRecentOrders(recentOrdersResult.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Show error message to user
      alert('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      assigned: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      in_progress: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
  };

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

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Order Management Dashboard" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📦 Order Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive overview of all customer orders and logistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/orders/create')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.total_orders}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{dashboardData.pending_orders}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Assigned</p>
            <p className="text-2xl font-bold text-indigo-600">{dashboardData.assigned_orders}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚀</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-green-600">{dashboardData.in_progress_orders}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-purple-600">{dashboardData.completed_orders}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{dashboardData.cancelled_orders}</p>
          </div>
        </ComponentCard>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Delivery Time</p>
            <p className="text-2xl font-bold text-blue-600">{dashboardData.average_delivery_time_hours.toFixed(1)} hours</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
            <p className="text-2xl font-bold text-green-600">{dashboardData.completion_rate.toFixed(1)}%</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Recent Orders (7d)</p>
            <p className="text-2xl font-bold text-purple-600">{dashboardData.recent_orders_7_days}</p>
          </div>
        </ComponentCard>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <ComponentCard title="Recent Orders">
          <div className="p-6">
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📦</div>
                  <p className="text-gray-500 dark:text-gray-400">No recent orders found</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getOrderTypeIcon(order.cargo_type)}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Customer: {order.customer_id} • {order.pickup_location} → {order.drop_location}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="light" color="warning">
                      {order.status ? order.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </ComponentCard>

        {/* Quick Actions */}
        <ComponentCard title="Quick Actions">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => router.push('/orders/create')}
                className="flex flex-col items-center gap-3 p-6 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/40 rounded-lg border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-all duration-200"
              >
                <div className="text-3xl">➕</div>
                <span className="text-blue-700 dark:text-blue-400 font-medium">Create Order</span>
              </Button>

              <Button
                onClick={() => router.push('/orders/active')}
                className="flex flex-col items-center gap-3 p-6 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/40 rounded-lg border-2 border-green-200 dark:border-green-800 hover:scale-105 transition-all duration-200"
              >
                <div className="text-3xl">🚀</div>
                <span className="text-green-700 dark:text-green-400 font-medium">Active Orders</span>
              </Button>

              <Button
                onClick={() => router.push('/orders/pending')}
                className="flex flex-col items-center gap-3 p-6 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-800/40 rounded-lg border-2 border-yellow-200 dark:border-yellow-800 hover:scale-105 transition-all duration-200"
              >
                <div className="text-3xl">⏳</div>
                <span className="text-yellow-700 dark:text-yellow-400 font-medium">Pending Orders</span>
              </Button>

              <Button
                onClick={() => router.push('/orders/analytics')}
                className="flex flex-col items-center gap-3 p-6 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/40 rounded-lg border-2 border-purple-200 dark:border-purple-800 hover:scale-105 transition-all duration-200"
              >
                <div className="text-3xl">📊</div>
                <span className="text-purple-700 dark:text-purple-400 font-medium">Analytics</span>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Management Links</h4>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/orders/tracking')}
                  className="w-full justify-start text-left text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  variant="outline"
                >
                  🗺️ Order Tracking
                </Button>
                <Button
                  onClick={() => router.push('/orders/completed')}
                  className="w-full justify-start text-left text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                  variant="outline"
                >
                  ✅ Completed Orders
                </Button>
                <Button
                  onClick={() => router.push('/orders/revenue')}
                  className="w-full justify-start text-left text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  variant="outline"
                >
                  💰 Revenue Analytics
                </Button>
                <Button
                  onClick={() => router.push('/orders/routes')}
                  className="w-full justify-start text-left text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                  variant="outline"
                >
                  🛣️ Popular Routes
                </Button>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Order Types Overview */}
      <ComponentCard title="Order Types Overview">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">📦</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">General Cargo</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {recentOrders.filter(o => o.cargo_type === 'general').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Standard shipments</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">🛡️</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Fragile Items</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {recentOrders.filter(o => o.cargo_type === 'fragile').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Special handling</p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">⚠️</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Hazardous Goods</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {recentOrders.filter(o => o.cargo_type === 'hazardous').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dangerous materials</p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}