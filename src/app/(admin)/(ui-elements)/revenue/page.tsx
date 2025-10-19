'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

interface RevenueAnalyticsData {
  total_revenue: number;
  revenue_today: number;
  revenue_this_week: number;
  revenue_this_month: number;
  revenue_trends: {
    date: string;
    revenue: number;
  }[];
  revenue_by_service?: Record<string, number>;
  payment_methods?: Record<string, number>;
  top_customers?: {
    customer_id: number;
    customer_name?: string;
    revenue?: number;
  }[];
}

export default function RevenueAnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<RevenueAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch revenue analytics data from the API endpoint
      const response = await fetch('http://127.0.0.1:8000/api/v1/admin/analytics/revenue', {
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
      console.error('Error loading revenue analytics data:', error);
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
        <PageBreadCrumb pageTitle="Revenue Analytics" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading revenue data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Revenue Analytics" />
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
        <PageBreadCrumb pageTitle="Revenue Analytics" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              💰 Revenue Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time analytics and insights for revenue performance
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
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Revenue Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Analytics data will appear here once revenue data is processed through the system.
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
          <ComponentCard title="Total Revenue">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Today's Revenue">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today&apos;s Revenue</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Weekly Revenue">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">🗓️</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Revenue</p>
              <p className="text-2xl font-bold text-gray-400">--</p>
              <p className="text-xs text-gray-400 mt-1">No data available</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Monthly Revenue">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">📆</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
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
      <PageBreadCrumb pageTitle="Revenue Analytics" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💰 Revenue Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time analytics and insights for revenue performance
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
        <ComponentCard title="Total Revenue">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₹{analyticsData.total_revenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">All-time revenue</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Today's Revenue">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Today&apos;s Revenue</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{analyticsData.revenue_today.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Revenue today</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Weekly Revenue">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🗓️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Revenue</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ₹{analyticsData.revenue_this_week.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Revenue this week</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Monthly Revenue">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📆</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ₹{analyticsData.revenue_this_month.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Revenue this month</p>
          </div>
        </ComponentCard>
      </div>

      {/* Revenue Trends */}
      <ComponentCard title="Revenue Trends (Last 7 Days)">
        <div className="p-6">
          <div className="space-y-4">
            {analyticsData.revenue_trends.map((revenue, index) => {
              const maxRevenue = Math.max(...analyticsData.revenue_trends.map((r: RevenueAnalyticsData['revenue_trends'][0]) => r.revenue));
              const percentage = maxRevenue > 0 ? (revenue.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 w-32">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {new Date(revenue.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-900 dark:text-white">&#8377;{revenue.revenue.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ComponentCard>

      {/* Revenue by Service */}
      {analyticsData.revenue_by_service && Object.keys(analyticsData.revenue_by_service).length > 0 && (
        <ComponentCard title="Revenue by Service">
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(analyticsData.revenue_by_service).map(([service, revenue]) => {
                const revenueValue = revenue as number;
                const totalRevenue = analyticsData.revenue_by_service ? Object.values(analyticsData.revenue_by_service).reduce((sum, val) => sum + val, 0) : 0;
                const percentage = totalRevenue > 0 ? Math.round((revenueValue / totalRevenue) * 100) : 0;
                
                // Icons for different service types
                const serviceIcons: Record<string, string> = {
                  cargo: '🚛',
                  passenger: '👥',
                  public: '🚌'
                };
                
                const icon = serviceIcons[service] || '📦';
                
                return (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{icon}</div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {service}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        &#8377;{revenueValue.toLocaleString()}
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

      {/* Payment Methods */}
      {analyticsData.payment_methods && Object.keys(analyticsData.payment_methods).length > 0 && (
        <ComponentCard title="Payment Methods">
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(analyticsData.payment_methods).map(([method, count]) => {
                const countValue = count as number;
                const totalCount = analyticsData.payment_methods ? Object.values(analyticsData.payment_methods).reduce((sum, val) => sum + val, 0) : 0;
                const percentage = totalCount > 0 ? Math.round((countValue / totalCount) * 100) : 0;
                
                // Icons for different payment methods
                const methodIcons: Record<string, string> = {
                  credit_card: '💳',
                  debit_card: '💳',
                  upi: '📱',
                  digital_wallet: '📱',
                  net_banking: '🏦',
                  cash: '💵'
                };
                
                const icon = methodIcons[method] || '💰';
                
                return (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{icon}</div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {method.replace('_', ' ')}
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

      {/* Top Customers */}
      {analyticsData.top_customers && analyticsData.top_customers.length > 0 && (
        <ComponentCard title="Top Customers">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.top_customers.map((customer, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <Badge 
                          variant="light" 
                          color={index === 0 ? "warning" : index === 1 ? "light" : "info"}
                          size="sm"
                        >
                          #{index + 1}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {customer.customer_name || `Customer ${customer.customer_id}`}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        &#8377;{customer.revenue?.toLocaleString() || 0}
                      </td>
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
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Total Revenue</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                &#8377;{analyticsData.total_revenue.toLocaleString()} all-time revenue
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Today&apos;s Earnings</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                &#8377;{analyticsData.revenue_today.toLocaleString()} earned today
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Growth</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                &#8377;{analyticsData.revenue_this_month.toLocaleString()} this month
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}