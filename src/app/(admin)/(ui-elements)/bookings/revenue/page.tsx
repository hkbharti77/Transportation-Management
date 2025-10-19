'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { bookingService, BookingRevenue } from '@/services/bookingService';

export default function BookingRevenuePage() {
  const { user, isAuthenticated } = useAuth();
  const [revenueData, setRevenueData] = useState<BookingRevenue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days

  const loadRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading booking revenue data...');
      
      // Calculate date range based on selection
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      const data = await bookingService.getBookingRevenue(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      setRevenueData(data);
    } catch (error) {
      console.error('Error loading booking revenue data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load revenue data');
      setRevenueData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadRevenueData();
    }
  }, [isAuthenticated, user, dateRange, loadRevenueData]);

  const handleRefresh = () => {
    loadRevenueData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Revenue Analytics" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading revenue data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Revenue Analytics" />
        <ComponentCard title="Error Loading Revenue Data">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Failed to Load Revenue Data
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
  if (!revenueData) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Revenue Analytics" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              💰 Revenue Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time revenue analytics and financial insights
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
        <ComponentCard title="No Revenue Data Available">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Revenue Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Revenue data will appear here once bookings generate revenue through the system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                onClick={() => window.location.href = '/bookings'}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
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
      </div>
    );
  }

  // Display revenue data when available
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Revenue Analytics" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💰 Revenue Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Revenue from {new Date(revenueData.period.start_date).toLocaleDateString()} to {new Date(revenueData.period.end_date).toLocaleDateString()}
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

      {/* Total Revenue Card */}
      <ComponentCard title="Total Revenue Overview">
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">💵</div>
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            ₹{revenueData.total_revenue.toLocaleString()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Total revenue in selected period
          </p>
        </div>
      </ComponentCard>

      {/* Revenue Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Status */}
        <ComponentCard title="Revenue by Booking Status">
          <div className="p-6">
            <div className="space-y-4">
              {revenueData.revenue_by_status.map((item) => {
                const percentage = revenueData.total_revenue > 0 
                  ? Math.round((item.revenue / revenueData.total_revenue) * 100)
                  : 0;
                
                const colors = {
                  pending: 'bg-yellow-500',
                  confirmed: 'bg-green-500',
                  in_progress: 'bg-blue-500',
                  completed: 'bg-purple-500',
                  cancelled: 'bg-red-500'
                };
                
                
                return (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${colors[item.status as keyof typeof colors] || 'bg-gray-500'}`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        ₹{item.revenue.toLocaleString()}
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

        {/* Revenue by Service Type */}
        <ComponentCard title="Revenue by Service Type">
          <div className="p-6">
            <div className="space-y-4">
              {revenueData.revenue_by_service_type.map((item) => {
                const percentage = revenueData.total_revenue > 0 
                  ? Math.round((item.revenue / revenueData.total_revenue) * 100)
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
                        ₹{item.revenue.toLocaleString()}
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

      {/* Daily Revenue Trend */}
      <ComponentCard title="Daily Revenue Trend">
        <div className="p-6">
          <div className="space-y-4">
            {revenueData.daily_revenue_trend.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📅</div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Days Tracked</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {revenueData.daily_revenue_trend.length}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📈</div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">Avg Daily Revenue</p>
                    <p className="text-xl font-bold text-green-900 dark:text-green-100">
                      ₹{Math.round(revenueData.total_revenue / revenueData.daily_revenue_trend.length).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Peak Day Revenue</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      ₹{Math.max(...revenueData.daily_revenue_trend.map(d => d.revenue)).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Total Revenue</p>
                    <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                      ₹{revenueData.total_revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Daily Breakdown</h4>
                  {revenueData.daily_revenue_trend.map((item) => (
                    <div key={item.date} className="flex items-center justify-between py-2 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-blue-500 font-mono text-sm">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          ₹{item.revenue.toLocaleString()}
                        </span>
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(item.revenue / Math.max(...revenueData.daily_revenue_trend.map(d => d.revenue))) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📈</div>
                <p className="text-gray-600 dark:text-gray-400">
                  No daily revenue trend data available for the selected period
                </p>
              </div>
            )}
          </div>
        </div>
      </ComponentCard>

      {/* Revenue Insights */}
      <ComponentCard title="Revenue Insights">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Total Revenue</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                ₹{revenueData.total_revenue.toLocaleString()} generated in the selected period
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Service Performance</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {revenueData.revenue_by_service_type.length} service types contributing to revenue
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Status Distribution</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {revenueData.revenue_by_status.length} different booking statuses generating revenue
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}