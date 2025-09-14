'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { orderService, OrderAnalytics } from '@/services/orderService';

export default function OrderAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<OrderAnalytics | null>(null);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days
  const [loading, setLoading] = useState(false);

  const loadAnalyticsData = useCallback(async () => {
    const getDateRange = () => {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '365':
          startDate.setDate(startDate.getDate() - 365);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
    };

    try {
      // Explicitly reference the setLoading function to ensure proper scope
      setLoading(true);
      
      // Fetch real analytics data from the API
      const { startDate, endDate } = getDateRange();
      const data = await orderService.getOrderAnalytics(startDate, endDate);
      
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Show error message to user
      alert('Failed to load analytics data. Please try again.');
    } finally {
      // Explicitly reference the setLoading function to ensure proper scope
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadAnalyticsData();
    }
  }, [isAuthenticated, user, dateRange, loadAnalyticsData]);

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin' || !analyticsData) {
    return null;
  }

  // Calculate additional metrics for display
  const totalOrders = analyticsData.summary.total_orders;
  const completedOrders = analyticsData.summary.completed_orders;
  const totalRevenue = analyticsData.summary.total_revenue;
  const averageOrderValue = analyticsData.summary.average_order_value;
  const completionRate = analyticsData.summary.completion_rate;
  
  // Calculate cancellation rate from by_status data
  const cancelledOrders = analyticsData.by_status.find(item => item.status === 'cancelled')?.count || 0;
  const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
  
  // Calculate active orders (not completed or cancelled)
  const activeOrders = totalOrders - completedOrders - cancelledOrders;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Order Analytics" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Order Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analytics and insights for order management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {loading ? 'Loading...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComponentCard title="">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Analytics</h3>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/orders/revenue')}
                className="w-full flex items-center justify-between px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/40 rounded-lg transition-all duration-200"
              >
                <span className="font-medium text-blue-700 dark:text-blue-400">💰 Revenue Analytics</span>
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button
                className="w-full flex items-center justify-between px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/40 rounded-lg transition-all duration-200"
              >
                <span className="font-medium text-purple-700 dark:text-purple-400">📦 Cargo Type Analysis</span>
                <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button
                className="w-full flex items-center justify-between px-4 py-3 text-left bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/40 rounded-lg transition-all duration-200"
              >
                <span className="font-medium text-green-700 dark:text-green-400">🚚 Delivery Performance</span>
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Reports</h3>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/orders/routes')}
                className="w-full flex items-center justify-between px-4 py-3 text-left bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-800/40 rounded-lg transition-all duration-200"
              >
                <span className="font-medium text-orange-700 dark:text-orange-400">🛣️ Popular Routes</span>
                <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button
                className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">📄 Export Analytics CSV</span>
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button
                className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">📊 Export Revenue Report</span>
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</p>
            <p className="text-2xl font-bold text-blue-600">${averageOrderValue.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
            <p className="text-2xl font-bold text-purple-600">{completionRate.toFixed(1)}%</p>
          </div>
        </ComponentCard>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Order Status Distribution">
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-900 dark:text-white">Completed</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600">{completedOrders}</span>
                  <span className="text-sm text-gray-500 ml-2">({completionRate.toFixed(1)}%)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-900 dark:text-white">Active</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-600">{activeOrders}</span>
                  <span className="text-sm text-gray-500 ml-2">({totalOrders > 0 ? (activeOrders/totalOrders*100).toFixed(1) : 0}%)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-900 dark:text-white">Cancelled</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-red-600">{cancelledOrders}</span>
                  <span className="text-sm text-gray-500 ml-2">({cancellationRate.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Order Types Distribution">
          <div className="p-6 space-y-4">
            {analyticsData.by_cargo_type.map((item) => (
              <div key={item.cargo_type} className="flex items-center gap-3">
                <span className="text-sm w-24 capitalize">{item.cargo_type}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalOrders > 0 ? (item.count / totalOrders) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{item.count}</span>
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>

      {/* Order Status Breakdown */}
      <ComponentCard title="Order Status Breakdown">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Count</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.by_status.map((item) => (
                  <tr key={item.status} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white capitalize">{item.status}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{item.count}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${totalOrders > 0 ? (item.count / totalOrders) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span>{totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(1) : 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ComponentCard>

      {/* Period Information */}
      <ComponentCard title="Analysis Period">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Start Date</h3>
              <p className="text-lg font-bold text-blue-600">
                {new Date(analyticsData.period.start_date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">End Date</h3>
              <p className="text-lg font-bold text-green-600">
                {new Date(analyticsData.period.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}