'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { analyticsService } from '@/services/analyticsService';

export default function FleetAnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For truck utilization, we'll use the truck-utilization endpoint
      const response = await fetch('http://localhost:8000/api/v1/admin/analytics/truck-utilization', {
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
      console.error('Error loading truck utilization data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load truck utilization data');
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
        <PageBreadCrumb pageTitle="Fleet Analytics" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading fleet analytics data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Fleet Analytics" />
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
        <PageBreadCrumb pageTitle="Fleet Analytics" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🚛 Fleet Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time analytics and insights for fleet management
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
            <div className="text-6xl mb-4">🚛</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Fleet Analytics Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Analytics data will appear here once fleet data is processed through the system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                onClick={() => window.location.href = '/trucks'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                View Trucks
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
          <ComponentCard title="Total Trucks">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">🚛</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Trucks</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Active Trucks">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Trucks</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Utilization Rate">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">📈</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Utilization Rate</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Total Distance">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">🛣️</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Distance</p>
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
      <PageBreadCrumb pageTitle="Fleet Analytics" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚛 Fleet Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time analytics and insights for fleet management
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard title="Total Trucks">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚛</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Trucks</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analyticsData.total_trucks}
            </p>
            <p className="text-xs text-gray-500 mt-1">All trucks in fleet</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Active Trucks">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Trucks</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analyticsData.active_trucks}
            </p>
            <p className="text-xs text-gray-500 mt-1">Currently in service</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Utilization Rate">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Utilization Rate</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {analyticsData.utilization_rate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Truck usage efficiency</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Distance">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🛣️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Distance</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(analyticsData.total_distance).toLocaleString()} km
            </p>
            <p className="text-xs text-gray-500 mt-1">All-time distance</p>
          </div>
        </ComponentCard>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard title="Avg Trip Duration">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Trip Duration</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {analyticsData.average_trip_duration} hrs
            </p>
            <p className="text-xs text-gray-500 mt-1">Average per trip</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Fuel Consumption">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⛽</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fuel Consumption</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {Math.round(analyticsData.fuel_consumption).toLocaleString()} L
            </p>
            <p className="text-xs text-gray-500 mt-1">Total fuel used</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Maintenance Trucks">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🔧</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Maintenance</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {analyticsData.maintenance_trucks}
            </p>
            <p className="text-xs text-gray-500 mt-1">Under maintenance</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Idle Trucks">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏸️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Idle Trucks</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {analyticsData.idle_trucks}
            </p>
            <p className="text-xs text-gray-500 mt-1">Not in service</p>
          </div>
        </ComponentCard>
      </div>

      {/* Utilization by Truck */}
      {analyticsData.utilization_by_truck && analyticsData.utilization_by_truck.length > 0 && (
        <ComponentCard title="Truck Utilization Details">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Truck ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">License Plate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Utilization %</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Trips</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Distance (km)</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.utilization_by_truck.map((truck: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">#{truck.truck_id}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{truck.license_plate}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-900 dark:text-white">{truck.utilization_rate}%</span>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${truck.utilization_rate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{truck.trip_count}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{Math.round(truck.total_distance).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ComponentCard>
      )}

      {/* Key Insights */}
      <ComponentCard title="Key Insights">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Efficiency</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Fleet utilization rate is {analyticsData.utilization_rate}%
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">🛣️</div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Distance</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Total distance covered: {Math.round(analyticsData.total_distance).toLocaleString()} km
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">⛽</div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Consumption</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Fuel consumption: {Math.round(analyticsData.fuel_consumption).toLocaleString()} liters
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}