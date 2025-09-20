'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

interface DriverAnalyticsData {
  total_drivers: number;
  active_drivers: number;
  average_rating: number;
  total_trips: number;
  completed_trips: number;
  on_time_deliveries: number;
  rating_distribution?: Record<string, number>;
}

export default function DriverPerformanceAnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<DriverAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch driver performance analytics data from the API endpoint
      const response = await fetch('http://localhost:8000/api/v1/admin/analytics/driver-performance', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading driver performance analytics data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadAnalyticsData();
    }
  }, [isAuthenticated, user, loadAnalyticsData]);

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Driver Performance Analytics" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading driver performance data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Driver Performance Analytics" />
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
        <PageBreadCrumb pageTitle="Driver Performance Analytics" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🚛 Driver Performance Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time analytics and insights for driver performance
            </p>
          </div>
          <div className="flex items-center gap-3">
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
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Driver Performance Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Analytics data will appear here once driver data is processed through the system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                onClick={() => window.location.href = '/drivers'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                View Drivers
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
          <ComponentCard title="Total Drivers">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">👥</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Active Drivers">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Drivers</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Avg Rating">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Total Trips">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">🛣️</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Trips</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  // Calculate performance metrics
  const completionRate = analyticsData.total_trips > 0 
    ? Math.round((analyticsData.completed_trips / analyticsData.total_trips) * 100)
    : 0;
    
  const onTimeDeliveryRate = analyticsData.total_trips > 0 
    ? Math.round((analyticsData.on_time_deliveries / analyticsData.total_trips) * 100)
    : 0;

  // Display analytics data when available
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Driver Performance Analytics" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚛 Driver Performance Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time analytics and insights for driver performance
          </p>
        </div>
        <div className="flex items-center gap-3">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard title="Total Drivers">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Drivers</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analyticsData.total_drivers}
            </p>
            <p className="text-xs text-gray-500 mt-1">All registered drivers</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Active Drivers">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Drivers</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analyticsData.active_drivers}
            </p>
            <p className="text-xs text-gray-500 mt-1">Currently working</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Average Rating">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {analyticsData.average_rating}
            </p>
            <p className="text-xs text-gray-500 mt-1">Based on customer feedback</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Trips">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🛣️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Trips</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {analyticsData.total_trips.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">All-time trips</p>
          </div>
        </ComponentCard>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComponentCard title="Completed Trips">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🏁</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed Trips</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {analyticsData.completed_trips.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Successfully completed</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Completion Rate">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {completionRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Trip completion rate</p>
          </div>
        </ComponentCard>

        <ComponentCard title="On-Time Deliveries">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">On-Time Rate</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {onTimeDeliveryRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Delivered on time</p>
          </div>
        </ComponentCard>
      </div>

      {/* Rating Distribution */}
      {analyticsData.rating_distribution && Object.keys(analyticsData.rating_distribution).length > 0 && (
        <ComponentCard title="Rating Distribution">
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(analyticsData.rating_distribution).map(([rating, count]) => {
                const countValue = count as number;
                const totalCount = Object.values(analyticsData.rating_distribution!).reduce((sum: number, val: unknown) => sum + (val as number), 0);
                const percentage = totalCount > 0 ? Math.round((countValue / totalCount) * 100) : 0;
                
                return (
                  <div key={rating} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {rating} stars
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {countValue}
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
      )}

      {/* Key Insights */}
      <ComponentCard title="Key Insights">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">⭐</div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Rating</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Average driver rating is {analyticsData.average_rating}
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Completion</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {completionRate}% trip completion rate
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">⏱️</div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Punctuality</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {onTimeDeliveryRate}% on-time deliveries
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}