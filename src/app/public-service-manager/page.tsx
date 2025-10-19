'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';

export default function PublicServiceManagerPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    activeServices: 0,
    upcomingServices: 0,
    ticketsToday: 0,
    totalServices: 0
  });
  const [loading, setLoading] = useState(true);

  // Check authentication and role
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Redirect if user is not a public service manager
    if (user?.role && user.role !== 'public_service_manager') {
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
        return '/dashboard';
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
        activeServices: 15,
        upcomingServices: 8,
        ticketsToday: 22,
        totalServices: 42
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated or not a public service manager
  if (!isAuthenticated || user?.role !== 'public_service_manager') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Public Service Dashboard" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚌 Public Service Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage public transportation services and tickets
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
          <Button
            onClick={() => router.push('/public-services/create')}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Service
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard title="Active Services">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚍</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Currently Running</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.activeServices}</p>
            <p className="text-xs text-gray-500 mt-1">In operation</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Upcoming Services">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.upcomingServices}</p>
            <p className="text-xs text-gray-500 mt-1">Planned for today</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Tickets Today">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🎟️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Booked</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.ticketsToday}</p>
            <p className="text-xs text-gray-500 mt-1">New reservations</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Services">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">All Services</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalServices}</p>
            <p className="text-xs text-gray-500 mt-1">Managed routes</p>
          </div>
        </ComponentCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ComponentCard title="Service Management">
          <div className="p-4 space-y-3">
            <Button
              onClick={() => router.push('/public-services')}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>View All Services</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/public-services/create')}
              className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Create New Service</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/public-services/availability')}
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Manage Availability</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>
          </div>
        </ComponentCard>

        <ComponentCard title="Ticket Management">
          <div className="p-4 space-y-3">
            <Button
              onClick={() => router.push('/public-services/tickets')}
              className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>View Tickets</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/public-services/tickets/book')}
              className="w-full p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Book Ticket</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/public-services/tickets/search')}
              className="w-full p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Search Tickets</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
          </div>
        </ComponentCard>

        <ComponentCard title="Analytics & Reports">
          <div className="p-4 space-y-3">
            <Button
              onClick={() => router.push('/public-services/analytics')}
              className="w-full p-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Service Analytics</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/public-services/statistics')}
              className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Usage Statistics</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/public-services/search')}
              className="w-full p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Route Search</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">New Service Created</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Route #101 from Downtown to Airport was created</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Service Updated</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Schedule for Route #205 has been updated</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">New Ticket Booked</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Passenger booked ticket for Route #303</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}