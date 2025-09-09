'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import EnhancedDispatchDetails from '@/components/ui-elements/dispatch-management/EnhancedDispatchDetails';

export default function EnhancedDispatchPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedDispatchId, setSelectedDispatchId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Authentication check
  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Check if user is admin or staff
    if (user?.role && !['admin', 'staff'].includes(user.role)) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin/staff
  if (!isAuthenticated || (user?.role && !['admin', 'staff'].includes(user.role))) {
    return null;
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDispatchSelect = () => {
    const dispatchIdStr = prompt('Enter Dispatch ID to view enhanced details:');
    if (!dispatchIdStr) return;

    const dispatchId = parseInt(dispatchIdStr);
    if (isNaN(dispatchId) || dispatchId <= 0) {
      alert('Please enter a valid dispatch ID');
      return;
    }

    setSelectedDispatchId(dispatchId);
  };

  if (selectedDispatchId) {
    return (
      <EnhancedDispatchDetails
        dispatchId={selectedDispatchId}
        onClose={() => setSelectedDispatchId(null)}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Enhanced Dispatch Details" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚚 Enhanced Dispatch Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View complete dispatch information including booking and driver details
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
          <Button
            onClick={() => router.push('/dispatches/all')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
          >
            All Dispatches
          </Button>
        </div>
      </div>

      {/* Information Panel */}
      <ComponentCard title="Enhanced Dispatch Details">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Complete Dispatch Information
              </h3>
              <div className="mt-2 text-sm text-purple-700 dark:text-purple-300">
                <p>
                  This enhanced view provides complete dispatch information including booking details, 
                  driver information, and advanced status management capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Search Interface */}
      <ComponentCard title="Select Dispatch for Enhanced View">
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Enhanced Dispatch Lookup
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Enter a dispatch ID to view comprehensive details including booking information, 
            driver details, and advanced management options.
          </p>
          
          <Button
            onClick={handleDispatchSelect}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
          >
            🔍 Search Enhanced Details
          </Button>
        </div>
      </ComponentCard>

      {/* Features List */}
      <ComponentCard title="Enhanced Features">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Complete Booking Info</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View full booking details including route, service type, pricing, and status
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Driver Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access driver information including license, experience, and contact details
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Actions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use enhanced status updates with automatic timestamp management
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">🕐</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Time Tracking</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatic dispatch and arrival time tracking with status updates
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">🚨</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Status Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Full dispatch lifecycle: pending → dispatched → in_transit → arrived → completed
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Updates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Live data refresh and synchronized status across all related systems
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Quick Actions */}
      <ComponentCard title="Quick Actions">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push('/dispatches/all')}
              className="w-full p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">📋</div>
              <span className="font-medium">All Dispatches</span>
              <span className="text-xs opacity-75">Complete list</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/drivers')}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">👤</div>
              <span className="font-medium">Driver Dispatches</span>
              <span className="text-xs opacity-75">By driver</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/booking')}
              className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">🔍</div>
              <span className="font-medium">Booking Lookup</span>
              <span className="text-xs opacity-75">Find by booking</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/test')}
              className="w-full p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">🧪</div>
              <span className="font-medium">API Testing</span>
              <span className="text-xs opacity-75">Test endpoints</span>
            </Button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}