"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { routeService, RouteStatsResponse, Route } from "@/services/routeService";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

const RouteAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [routeStats, setRouteStats] = useState<RouteStatsResponse | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsingFallback(false);
        
        // Fetch overall route statistics
        const stats = await routeService.getRouteStats();
        setRouteStats(stats);
        
        // Check if we're using fallback data by looking at a unique property
        // The fallback method won't have some properties that the real API might have
        if (!stats.hasOwnProperty('total_routes')) {
          setUsingFallback(true);
        }
        
        // Fetch all routes for the table
        const routesData = await routeService.getRoutes();
        setRoutes(routesData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics data";
        setError(errorMessage);
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchAnalyticsData();
    } else {
      setError("Only administrators can view route analytics");
      setLoading(false);
    }
  }, [isAdmin]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Only administrators can view route analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageBreadcrumb pageTitle="Route Analytics" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Route Analytics
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of route performance and statistics
        </p>
      </div>

      {usingFallback && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative mb-6 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
          <strong className="font-bold">Note: </strong>
          <span className="block sm:inline">Using calculated statistics as direct API endpoint is unavailable.</span>
        </div>
      )}

      {routeStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Routes</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{routeStats.total_routes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Routes</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{routeStats.status_breakdown.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900 p-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive Routes</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{routeStats.status_breakdown.inactive}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Distance</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{routeStats.avg_distance.toFixed(1)} km</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ComponentCard title="Average Metrics">
          {routeStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Estimated Time</h3>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatTime(routeStats.avg_estimated_time)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Base Fare</h3>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">₹{routeStats.avg_base_fare.toFixed(2)}</p>
              </div>
            </div>
          )}
        </ComponentCard>
        
        <ComponentCard title="Route Status Distribution">
          {routeStats && (
            <div className="flex items-center justify-center h-full">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{routeStats.total_routes}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Routes</div>
                  </div>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Active routes slice */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="10"
                    strokeDasharray={`${(routeStats.status_breakdown.active / routeStats.total_routes) * 283} ${283}`}
                    strokeDashoffset="25"
                    transform="rotate(-90 50 50)"
                  />
                  {/* Inactive routes slice */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="10"
                    strokeDasharray={`${(routeStats.status_breakdown.inactive / routeStats.total_routes) * 283} ${283}`}
                    strokeDashoffset={`${25 + (routeStats.status_breakdown.active / routeStats.total_routes) * 283}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <div className="ml-6">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active ({routeStats.status_breakdown.active})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Inactive ({routeStats.status_breakdown.inactive})</span>
                </div>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>

      <ComponentCard title="All Routes">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Route Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Start Point
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  End Point
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Est. Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Base Fare
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {routes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {route.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {route.route_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {route.start_point}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {route.end_point}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {route.distance} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatTime(route.estimated_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{route.base_fare}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        route.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {route.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </div>
  );
};

export default RouteAnalyticsPage;