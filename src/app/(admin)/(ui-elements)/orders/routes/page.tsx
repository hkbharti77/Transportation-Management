'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { orderService, PopularRoute } from '@/services/orderService';

export default function PopularRoutesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<PopularRoute[]>([]);
  const [limit, setLimit] = useState(10);

  const loadPopularRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getPopularRoutes(limit);
      setRoutes(data);
    } catch (error) {
      console.error('Error loading popular routes:', error);
      alert('Failed to load popular routes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadPopularRoutes();
    }
  }, [isAuthenticated, user, limit, loadPopularRoutes]);

  const handleRefresh = () => {
    loadPopularRoutes();
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
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

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Popular Routes" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚛 Popular Routes Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Most frequently ordered delivery routes based on order frequency
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="30">Top 30</option>
            <option value="50">Top 50</option>
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

      {/* Popular Routes Table */}
      <ComponentCard title="Popular Routes">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚛</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Route Data Available</h3>
              <p className="text-gray-600 dark:text-gray-400">No popular routes found in the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Route</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Order Count</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Total Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Avg. Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, index) => (
                    <tr key={`${route.pickup_location}-${route.drop_location}`} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          {index === 0 && <span className="text-yellow-500 mr-2">🥇</span>}
                          {index === 1 && <span className="text-gray-400 mr-2">🥈</span>}
                          {index === 2 && <span className="text-amber-700 mr-2">🥉</span>}
                          {index > 2 && <span className="mr-2">#{index + 1}</span>}
                          {index < 3 && <span>#{index + 1}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {route.pickup_location} → {route.drop_location}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {route.order_count} orders
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-green-600 dark:text-green-400">
                        ${route.total_revenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-medium text-purple-600 dark:text-purple-400">
                        ${route.average_revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Route Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🛣️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Routes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{routes.length}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-blue-600">
              {routes.reduce((sum, route) => sum + route.order_count, 0)}
            </p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              ${routes.reduce((sum, route) => sum + route.total_revenue, 0).toFixed(2)}
            </p>
          </div>
        </ComponentCard>
      </div>

      {/* Top Route Highlight */}
      {routes.length > 0 && (
        <ComponentCard title="Top Performing Route">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🥇</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {routes[0].pickup_location} → {routes[0].drop_location}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Most popular delivery route in the system
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">${routes[0].total_revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Order Volume</h4>
                <p className="text-2xl font-bold text-blue-600">{routes[0].order_count} orders</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Avg. Revenue</h4>
                <p className="text-2xl font-bold text-green-600">${routes[0].average_revenue.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Revenue Share</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {((routes[0].total_revenue / routes.reduce((sum, route) => sum + route.total_revenue, 0)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}