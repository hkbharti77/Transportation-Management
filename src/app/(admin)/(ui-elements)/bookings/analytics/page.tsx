'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { bookingService, BookingAnalytics } from '@/services/bookingService';



export default function BookingAnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<BookingAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading booking analytics data...');
      
      // Calculate date range based on selection
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      const data = await bookingService.getBookingAnalytics(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading booking analytics data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics data');
      setAnalyticsData(null);
    } finally {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Booking Analytics" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Booking Analytics" />
        <ComponentCard title="Error Loading Analytics">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Failed to Load Analytics Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <Button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </Button>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Show empty state when no real data is available
  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Booking Analytics" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              📊 Booking Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time analytics and insights for booking management
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
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </Button>
          </div>
        </div>

        {/* No Data State */}
        <ComponentCard title="No Analytics Data Available">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Booking Analytics Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Analytics data will appear here once bookings are processed through the system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                onClick={() => window.location.href = '/bookings'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                View Bookings
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Retry Loading
              </Button>
            </div>
          </div>
        </ComponentCard>

        {/* Placeholder Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ComponentCard title="Total Bookings">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">🎟️</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Total Revenue">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Average Booking Value">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">📈</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Booking Value</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Completion Rate">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  // Display analytics data when available
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Booking Analytics" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Booking Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analytics from {new Date(analyticsData.period.start_date).toLocaleDateString()} to {new Date(analyticsData.period.end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            disabled={loading}
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
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ComponentCard title="Total Bookings">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🎟️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analyticsData.summary.total_bookings.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">All bookings in period</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Completed Bookings">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analyticsData.summary.completed_bookings.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Successfully completed</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Revenue">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ₹{analyticsData.summary.total_revenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total earnings</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Average Booking Value">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Booking Value</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ₹{analyticsData.summary.average_booking_value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Average per booking</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Completion Rate">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {analyticsData.summary.completion_rate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Success rate</p>
          </div>
        </ComponentCard>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <ComponentCard title="Bookings by Status">
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.by_status.map((item) => {
                const percentage = analyticsData.summary.total_bookings > 0 
                  ? Math.round((item.count / analyticsData.summary.total_bookings) * 100)
                  : 0;
                
                const colors = {
                  pending: 'bg-yellow-500',
                  confirmed: 'bg-green-500',
                  in_progress: 'bg-blue-500',
                  completed: 'bg-purple-500',
                  cancelled: 'bg-red-500'
                };
                
                const color = colors[item.status as keyof typeof colors] || 'bg-gray-500';
                
                return (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${color}`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.count}
                      </span>
                      <Badge size="sm" color="light">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ComponentCard>

        {/* Service Type Distribution */}
        <ComponentCard title="Bookings by Service Type">
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.by_service_type.map((item) => {
                const percentage = analyticsData.summary.total_bookings > 0 
                  ? Math.round((item.count / analyticsData.summary.total_bookings) * 100)
                  : 0;
                
                
                const icons = {
                  cargo: '🚛',
                  passenger: '👥',
                  public: '🚌'
                };
                
                const icon = icons[item.service_type as keyof typeof icons] || '🚐';
                
                return (
                  <div key={item.service_type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{icon}</div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {item.service_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.count}
                      </span>
                      <Badge size="sm" color="light">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Additional Insights */}
      <ComponentCard title="Key Insights">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Performance</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {analyticsData.summary.completion_rate}% of bookings are successfully completed
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">💵</div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Revenue</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Average booking value is ₹{analyticsData.summary.average_booking_value.toLocaleString()}
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Activity</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {analyticsData.summary.total_bookings} total bookings in selected period
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}