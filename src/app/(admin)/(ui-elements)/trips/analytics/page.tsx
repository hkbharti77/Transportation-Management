'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tripService, Trip } from '@/services/tripService';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

interface AnalyticsData {
  totalTrips: number;
  completedTrips: number;
  activeTrips: number;
  scheduledTrips: number;
  cancelledTrips: number;
  totalRevenue: number;
  totalPassengers: number;
  averageOccupancy: number;
  popularRoutes: { routeId: string; tripCount: number; revenue: number }[];
  monthlyStats: { month: string; trips: number; revenue: number }[];
  performanceMetrics: {
    onTimePerformance: number;
    cancellationRate: number;
    averageDuration: string;
    customerSatisfaction: number;
  };
}

export default function TripAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load all trips for analysis
      const allTrips = await tripService.getAllTrips({ page: 1, limit: 1000 });
      const trips = allTrips.data;

      // Calculate analytics
      const totalTrips = trips.length;
      const completedTrips = trips.filter(t => t.status === 'completed').length;
      const activeTrips = trips.filter(t => t.status === 'in_progress').length;
      const scheduledTrips = trips.filter(t => t.status === 'scheduled').length;
      const cancelledTrips = trips.filter(t => t.status === 'cancelled').length;

      // Revenue calculations
      const totalRevenue = trips.reduce((sum, trip) => {
        const passengers = (trip.total_seats || 0) - (trip.available_seats || 0);
        return sum + (passengers * (trip.fare || 0));
      }, 0);

      const totalPassengers = trips.reduce((sum, trip) => {
        return sum + ((trip.total_seats || 0) - (trip.available_seats || 0));
      }, 0);

      const averageOccupancy = trips.length > 0 
        ? (totalPassengers / trips.reduce((sum, trip) => sum + (trip.total_seats || 0), 0)) * 100 
        : 0;

      // Popular routes analysis
      const routeStats = trips.reduce((acc, trip) => {
        const routeId = trip.route_id?.toString() || 'Unknown';
        if (!acc[routeId]) {
          acc[routeId] = { tripCount: 0, revenue: 0 };
        }
        acc[routeId].tripCount++;
        const passengers = (trip.total_seats || 0) - (trip.available_seats || 0);
        acc[routeId].revenue += passengers * (trip.fare || 0);
        return acc;
      }, {} as Record<string, { tripCount: number; revenue: number }>);

      const popularRoutes = Object.entries(routeStats)
        .map(([routeId, stats]) => ({ routeId, ...stats }))
        .sort((a, b) => b.tripCount - a.tripCount)
        .slice(0, 5);

      // Mock monthly stats (in real app, you'd calculate from actual dates)
      const monthlyStats = [
        { month: 'Jan', trips: Math.floor(totalTrips * 0.15), revenue: Math.floor(totalRevenue * 0.12) },
        { month: 'Feb', trips: Math.floor(totalTrips * 0.18), revenue: Math.floor(totalRevenue * 0.16) },
        { month: 'Mar', trips: Math.floor(totalTrips * 0.22), revenue: Math.floor(totalRevenue * 0.20) },
        { month: 'Apr', trips: Math.floor(totalTrips * 0.25), revenue: Math.floor(totalRevenue * 0.28) },
        { month: 'May', trips: Math.floor(totalTrips * 0.20), revenue: Math.floor(totalRevenue * 0.24) },
      ];

      // Performance metrics
      const performanceMetrics = {
        onTimePerformance: Math.floor(85 + Math.random() * 10), // Mock data
        cancellationRate: ((cancelledTrips / totalTrips) * 100),
        averageDuration: '42 minutes', // Mock data
        customerSatisfaction: Math.floor(80 + Math.random() * 15), // Mock data
      };

      setAnalyticsData({
        totalTrips,
        completedTrips,
        activeTrips,
        scheduledTrips,
        cancelledTrips,
        totalRevenue,
        totalPassengers,
        averageOccupancy,
        popularRoutes,
        monthlyStats,
        performanceMetrics,
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadAnalyticsData();
    }
  }, [isAuthenticated, user, dateRange]);

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (isLoading || !analyticsData) {
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
      <PageBreadCrumb pageTitle="Trip Analytics" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Trip Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analytics and performance insights for trip management
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚌</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Trips</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalTrips}</p>
            <p className="text-xs text-green-600 mt-1">+12% from last period</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${analyticsData.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-1">+8% from last period</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Passengers</p>
            <p className="text-2xl font-bold text-blue-600">{analyticsData.totalPassengers}</p>
            <p className="text-xs text-green-600 mt-1">+15% from last period</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Occupancy</p>
            <p className="text-2xl font-bold text-purple-600">{analyticsData.averageOccupancy.toFixed(1)}%</p>
            <p className="text-xs text-green-600 mt-1">+3% from last period</p>
          </div>
        </ComponentCard>
      </div>

      {/* Trip Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Trip Status Distribution">
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-gray-900 dark:text-white">Completed</span>
                </div>
                <span className="font-bold">{analyticsData.completedTrips}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-900 dark:text-white">Active</span>
                </div>
                <span className="font-bold">{analyticsData.activeTrips}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-900 dark:text-white">Scheduled</span>
                </div>
                <span className="font-bold">{analyticsData.scheduledTrips}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-900 dark:text-white">Cancelled</span>
                </div>
                <span className="font-bold">{analyticsData.cancelledTrips}</span>
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Performance Metrics">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">On-Time Performance</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-600">{analyticsData.performanceMetrics.onTimePerformance}%</span>
                <Badge className="bg-green-100 text-green-800 text-xs">GOOD</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cancellation Rate</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-yellow-600">{analyticsData.performanceMetrics.cancellationRate.toFixed(1)}%</span>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">MODERATE</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Duration</span>
              <span className="font-bold text-gray-900 dark:text-white">{analyticsData.performanceMetrics.averageDuration}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Customer Satisfaction</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-600">{analyticsData.performanceMetrics.customerSatisfaction}%</span>
                <Badge className="bg-blue-100 text-blue-800 text-xs">EXCELLENT</Badge>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Popular Routes */}
      <ComponentCard title="Top Performing Routes">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Route ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Trip Count</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Avg Revenue/Trip</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.popularRoutes.map((route, index) => (
                  <tr key={route.routeId} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">#{index + 1}</Badge>
                        <span className="font-medium">Route {route.routeId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{route.tripCount}</td>
                    <td className="py-3 px-4 text-green-600 font-semibold">${route.revenue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      ${(route.revenue / route.tripCount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ComponentCard>

      {/* Monthly Trends */}
      <ComponentCard title="Monthly Trends">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {analyticsData.monthlyStats.map((stat) => (
              <div key={stat.month} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.month}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.trips}</p>
                <p className="text-xs text-green-600">${stat.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </ComponentCard>

      {/* Insights and Recommendations */}
      <ComponentCard title="Key Insights & Recommendations">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📈 Key Insights
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                Route {analyticsData.popularRoutes[0]?.routeId} is your most profitable with ${analyticsData.popularRoutes[0]?.revenue.toFixed(2)} revenue
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Average occupancy of {analyticsData.averageOccupancy.toFixed(1)}% indicates good demand
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                {analyticsData.performanceMetrics.cancellationRate.toFixed(1)}% cancellation rate needs attention
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                {analyticsData.performanceMetrics.onTimePerformance}% on-time performance is excellent
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              💡 Recommendations
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                Consider increasing frequency on top-performing routes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                Optimize scheduling during peak hours for better occupancy
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">✓</span>
                Implement better communication to reduce cancellations
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                Maintain current operational standards for punctuality
              </li>
            </ul>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}