'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

export default function SystemMetricsPage() {
  const { user, isAuthenticated } = useAuth();
  const [metricsData, setMetricsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetricsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch system metrics data from the API endpoint
      const response = await fetch('http://localhost:8000/api/v1/admin/system/metrics', {
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
      setMetricsData(data);
    } catch (error) {
      console.error('Error loading system metrics data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load metrics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadMetricsData();
    }
  }, [isAuthenticated, user, loadMetricsData]);

  const handleRefresh = () => {
    loadMetricsData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="System Metrics" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading system metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="System Metrics" />
        <ComponentCard title="Error Loading Metrics">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Failed to Load System Metrics
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
  if (!metricsData) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="System Metrics" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🖥️ System Metrics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time system performance and resource utilization
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
        <ComponentCard title="No Metrics Data Available">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🖥️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No System Metrics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              System metrics data will appear here once the system is monitored.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                onClick={() => window.location.href = '/admin/overview'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                View Overview
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
          <ComponentCard title="CPU Usage">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">💻</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-400">--%</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Memory Usage">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">🧠</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-400">--%</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Disk Usage">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">💾</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Disk Usage</p>
              <p className="text-2xl font-bold text-gray-400">--%</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Active Connections">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">🔗</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connections</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  // Display metrics data when available
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="System Metrics" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🖥️ System Metrics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time system performance and resource utilization
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

      {/* System Resource Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard title="CPU Usage">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💻</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metricsData.cpu_usage.toFixed(1)}%
            </p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  metricsData.cpu_usage > 80 ? 'bg-red-500' : 
                  metricsData.cpu_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${metricsData.cpu_usage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Processor utilization</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Memory Usage">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🧠</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {metricsData.memory_usage.toFixed(1)}%
            </p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  metricsData.memory_usage > 80 ? 'bg-red-500' : 
                  metricsData.memory_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${metricsData.memory_usage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">RAM utilization</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Disk Usage">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💾</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Disk Usage</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {metricsData.disk_usage.toFixed(1)}%
            </p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  metricsData.disk_usage > 90 ? 'bg-red-500' : 
                  metricsData.disk_usage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${metricsData.disk_usage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Storage utilization</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Active Connections">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🔗</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Connections</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {metricsData.active_connections}
            </p>
            <p className="text-xs text-gray-500 mt-1">Current connections</p>
          </div>
        </ComponentCard>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComponentCard title="Response Time">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {metricsData.response_time.toFixed(1)}ms
            </p>
            <p className="text-xs text-gray-500 mt-1">Average response time</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Error Rate">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {metricsData.error_rate.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Request error percentage</p>
          </div>
        </ComponentCard>

        <ComponentCard title="System Uptime">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏱</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metricsData.uptime}
            </p>
            <p className="text-xs text-gray-500 mt-1">System availability</p>
          </div>
        </ComponentCard>
      </div>

      {/* Key Insights */}
      <ComponentCard title="System Health Insights">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">💻</div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">CPU Performance</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {metricsData.cpu_usage.toFixed(1)}% utilization
              </p>
              <Badge 
                variant="light" 
                color={
                  metricsData.cpu_usage > 80 ? "error" : 
                  metricsData.cpu_usage > 60 ? "warning" : "success"
                }
                className="mt-2"
              >
                {metricsData.cpu_usage > 80 ? "High" : 
                 metricsData.cpu_usage > 60 ? "Moderate" : "Normal"}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">🧠</div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Memory Usage</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {metricsData.memory_usage.toFixed(1)}% of memory used
              </p>
              <Badge 
                variant="light" 
                color={
                  metricsData.memory_usage > 80 ? "error" : 
                  metricsData.memory_usage > 60 ? "warning" : "success"
                }
                className="mt-2"
              >
                {metricsData.memory_usage > 80 ? "High" : 
                 metricsData.memory_usage > 60 ? "Moderate" : "Normal"}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">⏱</div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">System Uptime</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {metricsData.uptime}
              </p>
              <Badge variant="light" color="success" className="mt-2">
                Operational
              </Badge>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}