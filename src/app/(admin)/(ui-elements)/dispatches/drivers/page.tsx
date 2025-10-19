'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import DriverDispatchTable from '@/components/ui-elements/dispatch-management/DriverDispatchTable';
import DispatchDetails from '@/components/ui-elements/dispatch-management/DispatchDetails';
import { Dispatch } from '@/services/dispatchService';

export default function DriverDispatchesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
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

  const handleDriverSelect = () => {
    const driverIdStr = prompt('Enter Driver ID to view their dispatches:');
    if (!driverIdStr) return;

    const driverId = parseInt(driverIdStr);
    if (isNaN(driverId) || driverId <= 0) {
      alert('Please enter a valid driver ID');
      return;
    }

    setSelectedDriverId(driverId);
    setSelectedDispatch(null); // Clear any selected dispatch
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
      <PageBreadCrumb pageTitle="Driver Dispatches" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            👤 Driver Dispatches
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View dispatches assigned to specific drivers
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
            onClick={handleDriverSelect}
            className="flex items-center gap-2 px-4 py-2 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-800/40 rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Select Driver
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
        </div>
      </div>

      {/* Information Panel */}
      <ComponentCard title="Driver Dispatch Management">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Driver Performance Tracking
              </h3>
              <div className="mt-2 text-sm text-purple-700 dark:text-purple-300">
                <p>
                  View and manage dispatches assigned to specific drivers. Track driver performance, 
                  workload, and dispatch status updates in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Driver Selection or Driver Dispatches */}
      {selectedDriverId ? (
        <ComponentCard title={`Driver #${selectedDriverId} Dispatches`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  👤 Driver #{selectedDriverId}
                </span>
              </div>
              <Button
                onClick={() => setSelectedDriverId(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
              >
                ← Select Different Driver
              </Button>
            </div>
            <DriverDispatchTable
              driverId={selectedDriverId}
              onDispatchSelect={setSelectedDispatch}
              onRefresh={handleRefresh}
              refreshTrigger={refreshTrigger}
              showDriverInfo={true}
            />
          </div>
        </ComponentCard>
      ) : (
        <ComponentCard title="Select a Driver">
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Choose a Driver to View Dispatches
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Enter a driver ID to view their assigned dispatches, performance metrics, and current workload.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Button
                onClick={handleDriverSelect}
                className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex flex-col items-center gap-2"
              >
                <div className="text-2xl">🔍</div>
                <span className="font-medium">Search by Driver ID</span>
                <span className="text-xs opacity-75">Enter specific driver ID</span>
              </Button>

              <Button
                onClick={() => router.push('/dispatches/active')}
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex flex-col items-center gap-2"
              >
                <div className="text-2xl">🚚</div>
                <span className="font-medium">Active Dispatches</span>
                <span className="text-xs opacity-75">View in progress</span>
              </Button>

              <Button
                onClick={() => router.push('/dispatches/pending')}
                className="w-full p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex flex-col items-center gap-2"
              >
                <div className="text-2xl">⏳</div>
                <span className="font-medium">Pending Dispatches</span>
                <span className="text-xs opacity-75">Awaiting action</span>
              </Button>
            </div>
          </div>
        </ComponentCard>
      )}

      {/* Quick Actions */}
      <ComponentCard title="Quick Actions">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push('/dispatches/new')}
              className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">➕</div>
              <span className="font-medium">Create Dispatch</span>
              <span className="text-xs opacity-75">New dispatch</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/all')}
              className="w-full p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">📋</div>
              <span className="font-medium">All Dispatches</span>
              <span className="text-xs opacity-75">Complete list</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/active')}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">🚚</div>
              <span className="font-medium">Active Dispatches</span>
              <span className="text-xs opacity-75">In progress</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/pending')}
              className="w-full p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">⏳</div>
              <span className="font-medium">Pending Dispatches</span>
              <span className="text-xs opacity-75">Need action</span>
            </Button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}