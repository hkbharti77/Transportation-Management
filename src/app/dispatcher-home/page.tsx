'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { Dispatch } from '@/services/dispatchService';
import { useSidebar } from '@/context/SidebarContext';

export default function DispatcherHomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const {  } = useSidebar();
  const [stats, setStats] = useState({
    pendingDispatches: 0,
    activeDispatches: 0,
    completedToday: 0,
    totalDispatches: 0
  });
  const [recentDispatches, setRecentDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Check authentication and role
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Redirect if user is not a dispatcher
    if (user?.role && user.role !== 'dispatcher') {
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
        pendingDispatches: 12,
        activeDispatches: 8,
        completedToday: 24,
        totalDispatches: 142
      });
      
      // Mock recent dispatches
      setRecentDispatches([
        {
          dispatch_id: 1001,
          booking_id: 5001,
          assigned_driver: 201,
          dispatch_time: '2023-06-15T08:30:00Z',
          arrival_time: '2023-06-15T12:45:00Z',
          status: 'completed',
          created_at: '2023-06-15T08:00:00Z',
          updated_at: '2023-06-15T13:00:00Z'
        },
        {
          dispatch_id: 1002,
          booking_id: 5002,
          assigned_driver: 202,
          dispatch_time: '2023-06-15T09:15:00Z',
          arrival_time: null,
          status: 'in_transit',
          created_at: '2023-06-15T09:00:00Z',
          updated_at: '2023-06-15T09:15:00Z'
        },
        {
          dispatch_id: 1003,
          booking_id: 5003,
          assigned_driver: null,
          dispatch_time: null,
          arrival_time: null,
          status: 'pending',
          created_at: '2023-06-15T10:00:00Z',
          updated_at: '2023-06-15T10:00:00Z'
        }
      ]);
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated or not a dispatcher
  if (!isAuthenticated || user?.role !== 'dispatcher') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Dispatcher Dashboard" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚚 Dispatcher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and coordinate dispatch operations
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
            onClick={() => router.push('/dispatches/new')}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Dispatch
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard title="Pending Dispatches">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingDispatches}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Active Dispatches">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚚</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.activeDispatches}</p>
            <p className="text-xs text-gray-500 mt-1">Currently en route</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Completed Today">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedToday}</p>
            <p className="text-xs text-gray-500 mt-1">Delivered successfully</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Dispatches">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalDispatches}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
        </ComponentCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ComponentCard title="Dispatch Management">
          <div className="p-4 space-y-3">
            <Button
              onClick={() => router.push('/dispatches/all')}
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>View All Dispatches</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/dispatches/new')}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Create New Dispatch</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/dispatches/available-drivers')}
              className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Available Drivers</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Button>
          </div>
        </ComponentCard>

        <ComponentCard title="Operations">
          <div className="p-4 space-y-3">
            <Button
              onClick={() => router.push('/orders')}
              className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Manage Orders</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/trips')}
              className="w-full p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Track Trips</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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

        <ComponentCard title="Analytics & Reports">
          <div className="p-4 space-y-3">
            <Button
              onClick={() => router.push('/dispatches/analytics')}
              className="w-full p-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Dispatch Analytics</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/drivers')}
              className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>Driver Performance</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/dispatches/test')}
              className="w-full p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-between"
            >
              <span>System Tests</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
          </div>
        </ComponentCard>
      </div>

      {/* Recent Dispatches */}
      <ComponentCard title="Recent Dispatches">
        <div className="p-6">
          {recentDispatches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentDispatches.map((dispatch) => (
                    <tr key={dispatch.dispatch_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">#{dispatch.dispatch_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{dispatch.booking_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {dispatch.assigned_driver ? `Driver #${dispatch.assigned_driver}` : 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${dispatch.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                          ${dispatch.status === 'dispatched' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                          ${dispatch.status === 'in_transit' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : ''}
                          ${dispatch.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                          ${dispatch.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}`}>
                          {dispatch.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(dispatch.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => router.push(`/dispatches/enhanced?dispatch_id=${dispatch.dispatch_id}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No recent dispatches</h3>
              <p className="text-gray-500 dark:text-gray-400">There are no recent dispatches to display.</p>
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}