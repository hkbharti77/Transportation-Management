'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { analyticsService, OverallAnalytics } from '@/services/analyticsService';



export default function OverallAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<OverallAnalytics | null>(null);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days

  const loadAnalyticsData = useCallback(async () => {
    try {
      console.log('Loading analytics data from backend...');
      const data = await analyticsService.getOverallAnalytics();
      setAnalyticsData(data);
      console.log('Analytics data loaded successfully:', data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Show error message to user
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadAnalyticsData();
    }
  }, [isAuthenticated, user, dateRange, loadAnalyticsData]);

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Overall Analytics" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Transportation Management Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive business insights and performance metrics
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
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard title="Total Revenue">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${analyticsData.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">+{analyticsData.revenueGrowth}% growth</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Bookings">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🎫</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-600">{analyticsData.totalBookings.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">+{analyticsData.bookingGrowth}% growth</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Orders">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-purple-600">{analyticsData.totalOrders.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">{analyticsData.totalTrips} completed trips</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Customer Rating">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Customer Rating</p>
            <p className="text-2xl font-bold text-yellow-600">{analyticsData.customerSatisfaction}</p>
            <p className="text-xs text-gray-600 mt-1">{analyticsData.performanceMetrics.totalReviews} reviews</p>
          </div>
        </ComponentCard>
      </div>

      {/* Fleet & Operations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard title="Active Fleets">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚛</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Fleets</p>
            <p className="text-2xl font-bold text-indigo-600">{analyticsData.activeFleets}</p>
            <p className="text-xs text-gray-600 mt-1">{analyticsData.totalVehicles} total vehicles</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Drivers">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Drivers</p>
            <p className="text-2xl font-bold text-teal-600">{analyticsData.totalDrivers}</p>
            <p className="text-xs text-green-600 mt-1">Active workforce</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Customers">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🙋‍♂️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
            <p className="text-2xl font-bold text-pink-600">{analyticsData.totalCustomers.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">{analyticsData.performanceMetrics.customerRetention}% retention</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Avg Delivery Time">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Delivery Time</p>
            <p className="text-2xl font-bold text-orange-600">{analyticsData.avgDeliveryTime}h</p>
            <p className="text-xs text-green-600 mt-1">{analyticsData.performanceMetrics.onTimeDelivery}% on time</p>
          </div>
        </ComponentCard>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Business Performance">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Monthly Growth</span>
              <span className="text-lg font-bold text-green-600">+{analyticsData.monthlyGrowth}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Profit Margin</span>
              <span className="text-lg font-bold text-blue-600">{analyticsData.profitMargin}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Customer Retention</span>
              <span className="text-lg font-bold text-purple-600">{analyticsData.performanceMetrics.customerRetention}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">On-Time Delivery</span>
              <span className="text-lg font-bold text-teal-600">{analyticsData.performanceMetrics.onTimeDelivery}%</span>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Monthly Trends">
          <div className="p-6">
            <div className="space-y-3">
              {analyticsData.monthlyData.slice(-6).map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 w-12">{month.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">${month.revenue.toLocaleString()}</span>
                      <span className="text-blue-600">{month.bookings} bookings</span>
                      <span className="text-purple-600">{month.orders} orders</span>
                    </div>
                    <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(month.revenue / Math.max(...analyticsData.monthlyData.map(m => m.revenue))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Top Routes */}
      <ComponentCard title="Top Performing Routes">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Route</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Bookings</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Avg Value</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topRoutes.map((route, index) => (
                  <tr key={route.route} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4">
                      <Badge 
                        variant="light" 
                        color={index === 0 ? "warning" : index === 1 ? "light" : "info"}
                        size="sm"
                      >
                        #{index + 1}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{route.route}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{route.count}</td>
                    <td className="py-3 px-4 text-green-600 font-semibold">${route.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      ${Math.round(route.revenue / route.count).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ComponentCard>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard title="Booking Analytics">
          <div className="p-4 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Booking Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Detailed booking insights</p>
            <Button
              onClick={() => window.location.href = '/bookings/analytics'}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              View Details
            </Button>
          </div>
        </ComponentCard>

        <ComponentCard title="Order Analytics">
          <div className="p-4 text-center">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Order performance metrics</p>
            <Button
              onClick={() => window.location.href = '/orders/analytics'}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
            >
              View Details
            </Button>
          </div>
        </ComponentCard>

        <ComponentCard title="Trip Analytics">
          <div className="p-4 text-center">
            <div className="text-3xl mb-3">🚛</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Trip Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Trip and route insights</p>
            <Button
              onClick={() => window.location.href = '/trips/analytics'}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
            >
              View Details
            </Button>
          </div>
        </ComponentCard>

        <ComponentCard title="Route Analytics">
          <div className="p-4 text-center">
            <div className="text-3xl mb-3">🛣️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Route Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Route performance data</p>
            <Button
              onClick={() => window.location.href = '/routes/analytics'}
              className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm"
            >
              View Details
            </Button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
