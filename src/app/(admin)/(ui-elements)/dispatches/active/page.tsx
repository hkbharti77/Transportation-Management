'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import DispatchTable from '@/components/ui-elements/dispatch-management/DispatchTable';
import DispatchDetails from '@/components/ui-elements/dispatch-management/DispatchDetails';
import { Dispatch } from '@/services/dispatchService';

export default function ActiveDispatchesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
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

  if (selectedDispatch) {
    return (
      <DispatchDetails
        dispatchId={selectedDispatch.dispatch_id}
        onClose={() => setSelectedDispatch(null)}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Active Dispatches" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚚 Active Dispatches
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Dispatches currently in progress and en route
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
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            All Dispatches
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

      {/* Information Panel */}
      <ComponentCard title="Active Dispatches Monitoring">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Real-time Monitoring
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  These dispatches are currently in progress. Monitor their status and update arrival times 
                  as needed. Click on any dispatch to view detailed information and manage the delivery process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComponentCard title="Confirmed & Ready">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">--</p>
            <p className="text-xs text-gray-500 mt-1">Ready for dispatch</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Currently En Route">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚚</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">--</p>
            <p className="text-xs text-gray-500 mt-1">Currently dispatched</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Near Completion">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🏁</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Near Arrival</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">--</p>
            <p className="text-xs text-gray-500 mt-1">Approaching destination</p>
          </div>
        </ComponentCard>
      </div>

      {/* Quick Actions */}
      <ComponentCard title="Quick Actions">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push('/dispatches/pending')}
              className="w-full p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">⏳</div>
              <span className="font-medium">Pending Dispatches</span>
              <span className="text-xs opacity-75">View awaiting confirmation</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/new')}
              className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">➕</div>
              <span className="font-medium">Create Dispatch</span>
              <span className="text-xs opacity-75">Start new dispatch</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/analytics')}
              className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">📈</div>
              <span className="font-medium">Analytics</span>
              <span className="text-xs opacity-75">Performance metrics</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/all')}
              className="w-full p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">📋</div>
              <span className="font-medium">All Dispatches</span>
              <span className="text-xs opacity-75">Complete overview</span>
            </Button>
          </div>
        </div>
      </ComponentCard>

      {/* Active Dispatches Table */}
      <ComponentCard title="Active Dispatches (Confirmed & In Progress)">
        <div className="p-6">
          <div className="space-y-6">
            {/* Confirmed Dispatches */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ✅ Confirmed Dispatches
              </h3>
              <DispatchTable
                filters={{ status: 'confirmed' }}
                onDispatchSelect={setSelectedDispatch}
                onRefresh={handleRefresh}
                refreshTrigger={refreshTrigger}
              />
            </div>

            {/* In Progress Dispatches */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🚚 In Progress Dispatches
              </h3>
              <DispatchTable
                filters={{ status: 'in_transit' }}
                onDispatchSelect={setSelectedDispatch}
                onRefresh={handleRefresh}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}