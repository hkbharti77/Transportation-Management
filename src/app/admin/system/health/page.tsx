'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

// Define interface for system health data
interface SystemHealth {
  service_name: string;
  status: string;
  response_time: number;
  error_count: number;
  details: Record<string, unknown>;
  health_id: number;
  last_check: string;
  created_at: string;
}

export default function SystemHealthPage() {
  const { user, isAuthenticated } = useAuth();
  const [healthData, setHealthData] = useState<SystemHealth[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHealthData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch system health data from the API endpoint
      const response = await fetch('http://127.0.0.1:8000/api/v1/admin/system/health', {
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
      setHealthData(data);
    } catch (error) {
      console.error('Error loading system health data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadHealthData();
    }
  }, [isAuthenticated, user, loadHealthData]);

  const handleRefresh = () => {
    loadHealthData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="System Health" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading system health...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="System Health" />
        <ComponentCard title="Error Loading Health Data">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Failed to Load System Health Data
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
  if (!healthData) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="System Health" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🏥 System Health
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time system health monitoring and status
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
        <ComponentCard title="No Health Data Available">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No System Health Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              System health data will appear here once the system is monitored.
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
      </div>
    );
  }

  // Display health data when available
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="System Health" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🏥 System Health
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time system health monitoring and status
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

      {/* Overall System Status */}
      <ComponentCard title="Overall System Status">
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">
            {healthData && healthData.length > 0 && healthData.every((service: SystemHealth) => service.status === 'healthy') ? '✅' : '⚠️'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {healthData && healthData.length > 0 && healthData.every((service: SystemHealth) => service.status === 'healthy') ? 'All Systems Operational' : 'System Issues Detected'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {healthData && healthData.length > 0 ? `${healthData.length} services monitored` : 'No services currently monitored'}
          </p>
        </div>
      </ComponentCard>

      {/* Service Health Status */}
      {healthData && healthData.length > 0 ? (
        <ComponentCard title="Service Health Status">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Service</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Response Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Last Check</th>
                  </tr>
                </thead>
                <tbody>
                  {healthData.map((service: SystemHealth, index: number) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {service.service_name}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="light" 
                          color={service.status === 'healthy' ? 'success' : 'error'}
                        >
                          {service.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {service.response_time}ms
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(service.last_check).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ComponentCard>
      ) : (
        <ComponentCard title="No Services Monitored">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Services Being Monitored
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are currently no services configured for health monitoring.
            </p>
          </div>
        </ComponentCard>
      )}

      {/* Health Summary */}
      <ComponentCard title="Health Summary">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Healthy Services</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {healthData ? healthData.filter((service: SystemHealth) => service.status === 'healthy').length : 0}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Operating normally
              </p>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl mb-2">❌</div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Unhealthy Services</h3>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {healthData ? healthData.filter((service: SystemHealth) => service.status !== 'healthy').length : 0}
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Requiring attention
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">⏱️</div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Avg Response Time</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {healthData && healthData.length > 0 
                  ? Math.round(healthData.reduce((sum: number, service: SystemHealth) => sum + service.response_time, 0) / healthData.length) 
                  : 0}ms
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Across all services
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}