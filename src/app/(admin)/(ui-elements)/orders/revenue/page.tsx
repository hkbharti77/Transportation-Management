'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { orderService, OrderRevenue } from '@/services/orderService';

export default function RevenueAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<OrderRevenue | null>(null);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days

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

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      
      // Fetch real revenue data from the API
      const { startDate, endDate } = getDateRange();
      const data = await orderService.getOrderRevenue(startDate, endDate);
      
      setRevenueData(data);
    } catch (error) {
      console.error('Error loading revenue data:', error);
      // Show error message to user
      alert('Failed to load revenue data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadRevenueData();
    }
  }, [isAuthenticated, user, dateRange]);

  const handleRefresh = () => {
    loadRevenueData();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Find the highest revenue value for scaling the bar charts
  const maxRevenueByStatus = Math.max(...revenueData.revenue_by_status.map(item => item.revenue), 1);
  const maxRevenueByCargoType = Math.max(...revenueData.revenue_by_cargo_type.map(item => item.revenue), 1);
  const maxDailyRevenue = Math.max(...revenueData.daily_revenue_trend.map(item => item.revenue), 1);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Revenue Analytics" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💰 Revenue Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed revenue analysis and trends
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${revenueData.total_revenue.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analysis Period</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {new Date(revenueData.period.start_date).toLocaleDateString()} - {new Date(revenueData.period.end_date).toLocaleDateString()}
            </p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data Points</p>
            <p className="text-2xl font-bold text-blue-600">{revenueData.daily_revenue_trend.length}</p>
            <p className="text-xs text-gray-500">Days of Data</p>
          </div>
        </ComponentCard>
      </div>

      {/* Revenue by Status */}
      <ComponentCard title="Revenue by Order Status">
        <div className="p-6">
          <div className="space-y-4">
            {revenueData.revenue_by_status.map((item) => (
              <div key={item.status} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {item.status.replace('_', ' ')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-green-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${maxRevenueByStatus > 0 ? (item.revenue / maxRevenueByStatus) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="w-24 text-right text-sm font-bold text-green-600">
                  ${item.revenue.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ComponentCard>

      {/* Revenue by Cargo Type */}
      <ComponentCard title="Revenue by Cargo Type">
        <div className="p-6">
          <div className="space-y-4">
            {revenueData.revenue_by_cargo_type.map((item) => (
              <div key={item.cargo_type} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {item.cargo_type}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${maxRevenueByCargoType > 0 ? (item.revenue / maxRevenueByCargoType) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="w-24 text-right text-sm font-bold text-blue-600">
                  ${item.revenue.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ComponentCard>

      {/* Daily Revenue Trend */}
      <ComponentCard title="Daily Revenue Trend">
        <div className="p-6">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="flex items-end gap-2 h-64">
                {revenueData.daily_revenue_trend.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div 
                      className="w-full bg-green-500 rounded-t transition-all duration-300 flex items-end justify-center"
                      style={{ height: `${maxDailyRevenue > 0 ? (item.revenue / maxDailyRevenue) * 80 : 0}%` }}
                    >
                      <span className="text-white text-xs font-bold mb-1 rotate-90 origin-center translate-y-4">
                        ${item.revenue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}