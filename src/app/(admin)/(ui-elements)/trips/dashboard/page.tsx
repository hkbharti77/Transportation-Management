'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tripService, Trip } from '@/services/tripService';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { useRouter } from 'next/navigation';

export default function TripDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalTrips: 0,
    activeTrips: 0,
    scheduledTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    recentTrips: [] as Trip[],
  });

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const allTrips = await tripService.getAllTrips({ page: 1, limit: 100 });
      
      const totalTrips = allTrips.data.length;
      const activeTrips = allTrips.data.filter(trip => trip.status === 'in_progress').length;
      const scheduledTrips = allTrips.data.filter(trip => trip.status === 'scheduled').length;
      const completedTrips = allTrips.data.filter(trip => trip.status === 'completed').length;
      const cancelledTrips = allTrips.data.filter(trip => trip.status === 'cancelled').length;
      
      const recentTrips = allTrips.data
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        .slice(0, 10);

      setDashboardData({
        totalTrips,
        activeTrips,
        scheduledTrips,
        completedTrips,
        cancelledTrips,
        recentTrips,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const getStatusBadgeColor = (status: string): "info" | "success" | "warning" | "error" => {
    const statusStyles: Record<string, "info" | "success" | "warning" | "error"> = {
      scheduled: 'info',
      in_progress: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return statusStyles[status] || 'info';
  };

  if (authLoading || isLoading) {
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
      <PageBreadCrumb pageTitle="Trip Management Dashboard" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚌 Trip Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive overview of all transportation activities
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ComponentCard title="Total Trips">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚌</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Trips</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.totalTrips}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Active Now">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🟢</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Now</p>
            <p className="text-2xl font-bold text-green-600">{dashboardData.activeTrips}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Scheduled">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600">{dashboardData.scheduledTrips}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Completed">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-purple-600">{dashboardData.completedTrips}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Cancelled">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{dashboardData.cancelledTrips}</p>
          </div>
        </ComponentCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Quick Actions">
          <div className="p-6 grid grid-cols-2 gap-4">
            <Button
              onClick={() => router.push('/trips/create')}
              className="flex flex-col items-center gap-3 p-6 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 hover:scale-105 transition-all"
            >
              <div className="text-3xl">➕</div>
              <span className="text-blue-700 font-medium">Create Trip</span>
            </Button>

            <Button
              onClick={() => router.push('/trips/scheduled')}
              className="flex flex-col items-center gap-3 p-6 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-purple-200 hover:scale-105 transition-all"
            >
              <div className="text-3xl">📅</div>
              <span className="text-purple-700 font-medium">Scheduled</span>
            </Button>

            <Button
              onClick={() => router.push('/trips/active')}
              className="flex flex-col items-center gap-3 p-6 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-200 hover:scale-105 transition-all"
            >
              <div className="text-3xl">🚌</div>
              <span className="text-green-700 font-medium">Active Trips</span>
            </Button>

            <Button
              onClick={() => router.push('/trips/analytics')}
              className="flex flex-col items-center gap-3 p-6 bg-orange-50 hover:bg-orange-100 rounded-lg border-2 border-orange-200 hover:scale-105 transition-all"
            >
              <div className="text-3xl">📊</div>
              <span className="text-orange-700 font-medium">Analytics</span>
            </Button>
          </div>
        </ComponentCard>

        <ComponentCard title="Recent Trips">
          <div className="p-6 space-y-4">
            {dashboardData.recentTrips.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🚌</div>
                <p className="text-gray-500">No recent trips found</p>
              </div>
            ) : (
              dashboardData.recentTrips.slice(0, 5).map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Trip #{trip.id}</p>
                    <p className="text-sm text-gray-500">Route: {trip.route_id}</p>
                  </div>
                  <Badge variant="light" color={getStatusBadgeColor(trip.status || 'scheduled')}>
                    {(trip.status || 'scheduled').replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}