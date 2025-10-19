'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';

export default function StaffDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedToday: 0,
    pendingTasks: 0,
    totalTrips: 0
  });
  const [loading, setLoading] = useState(true);

  // Check authentication and role
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Redirect if user is not staff
    if (user?.role && user.role !== 'staff') {
      const defaultRoute = getDefaultDashboardRoute(user.role);
      router.push(defaultRoute);
      return;
    }

    // Load dashboard data
    loadDashboardData();
  }, [isAuthenticated, isLoading, user, router]);

  const getDefaultDashboardRoute = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin/overview';
      case 'driver':
        return '/driver-home';
      case 'customer':
      case 'public_service_manager':
        return '/dashboard';
      case 'dispatcher':
        return '/dispatcher-home';
      case 'staff':
        return '/staff-dashboard';
      default:
        return '/';
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch actual data from your API
      // For now, we'll use mock data
      
      // Mock data - in a real app, you would fetch this from your API
      setStats({
        activeOrders: 18,
        completedToday: 12,
        pendingTasks: 5,
        totalTrips: 87
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated or not staff
  if (!isAuthenticated || user?.role !== 'staff') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Staff Dashboard" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            👨‍💼 Staff Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Limited access dashboard for staff members
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard title="Active Orders">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.activeOrders}</p>
            <p className="text-xs text-gray-500 mt-1">Currently processing</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Completed Today">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Finished</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedToday}</p>
            <p className="text-xs text-gray-500 mt-1">Successfully completed</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Pending Tasks">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">To Do</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingTasks}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Trips">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚚</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">All Time</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalTrips}</p>
            <p className="text-xs text-gray-500 mt-1">Managed trips</p>
          </div>
        </ComponentCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ComponentCard title="Order Management">
          <div className="p-4 space-y-3">
            <Button
              onClick={() => router.push('/orders')}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>View Orders</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/orders/active')}
              className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Active Orders</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/orders/completed')}
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Completed Orders</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
          </div>
        </ComponentCard>

        <ComponentCard title="Trip Management">
          <div className="p-4 space-y-3">
            <Button
              onClick={() => router.push('/trips')}
              className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>View Trips</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/trips/active')}
              className="w-full p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Active Trips</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/vehicles')}
              className="w-full p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Vehicle Status</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </Button>
          </div>
        </ComponentCard>
      </div>

      {/* Recent Activity */}
      <ComponentCard title="Recent Activity">
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Order Processed</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order #ORD-2023-001 has been processed</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Trip Started</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Trip #TRIP-2023-045 has started</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Report Generated</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily operations report completed</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}