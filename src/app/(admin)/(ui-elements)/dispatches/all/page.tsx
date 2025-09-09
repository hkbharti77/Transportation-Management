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

export default function AllDispatchesPage() {
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
      <PageBreadCrumb pageTitle="All Dispatches" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚚 All Dispatches
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor all dispatch operations
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
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">--</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Active Dispatches">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚚</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">--</p>
            <p className="text-xs text-gray-500 mt-1">Currently en route</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Completed Today">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">--</p>
            <p className="text-xs text-gray-500 mt-1">Delivered successfully</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Dispatches">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">--</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
        </ComponentCard>
      </div>

      {/* Quick Actions */}
      <ComponentCard title="Quick Actions">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push('/dispatches/new')}
              className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">➕</div>
              <span className="font-medium">Create New Dispatch</span>
              <span className="text-xs opacity-75">Start a new dispatch</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/pending')}
              className="w-full p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">⏳</div>
              <span className="font-medium">Pending Dispatches</span>
              <span className="text-xs opacity-75">View awaiting confirmation</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/active')}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">🚚</div>
              <span className="font-medium">Active Dispatches</span>
              <span className="text-xs opacity-75">Monitor in progress</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/analytics')}
              className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">📈</div>
              <span className="font-medium">Analytics</span>
              <span className="text-xs opacity-75">View performance metrics</span>
            </Button>
          </div>
        </div>
      </ComponentCard>

      {/* Dispatches Table */}
      <ComponentCard title="All Dispatches">
        <div className="p-6">
          <DispatchTable
            onDispatchSelect={setSelectedDispatch}
            onRefresh={handleRefresh}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </ComponentCard>
    </div>
  );
}