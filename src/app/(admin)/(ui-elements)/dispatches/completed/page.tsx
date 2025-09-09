'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import DispatchTable from '@/components/ui-elements/dispatch-management/DispatchTable';
import DispatchDetails from '@/components/ui-elements/dispatch-management/DispatchDetails';
import { Dispatch, dispatchService } from '@/services/dispatchService';

export default function CompletedDispatchesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [completedStats, setCompletedStats] = useState<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  } | null>(null);

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

  // Load completed dispatch statistics
  const loadCompletedStats = async () => {
    try {
      const dispatches = await dispatchService.getDispatchesByStatusDedicated('completed', 0, 1000);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const todayCount = dispatches.filter(d => 
        new Date(d.created_at) >= today
      ).length;
      
      const weekCount = dispatches.filter(d => 
        new Date(d.created_at) >= weekStart
      ).length;
      
      const monthCount = dispatches.filter(d => 
        new Date(d.created_at) >= monthStart
      ).length;

      setCompletedStats({
        total: dispatches.length,
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount
      });
    } catch (error) {
      console.error('Failed to load completed dispatch stats:', error);
      setCompletedStats({
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCompletedStats();
    }
  }, [isAuthenticated, refreshTrigger]);

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
    loadCompletedStats();
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
      <PageBreadCrumb pageTitle="Completed Dispatches" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ✅ Completed Dispatches
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Successfully completed and delivered dispatches
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
        </div>
      </div>

      {/* Statistics Cards */}
      {completedStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ComponentCard title="Total Completed">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {completedStats.total}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                All time completed dispatches
              </p>
            </div>
          </ComponentCard>

          <ComponentCard title="Today">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {completedStats.today}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Completed today
              </p>
            </div>
          </ComponentCard>

          <ComponentCard title="This Week">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {completedStats.thisWeek}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Completed this week
              </p>
            </div>
          </ComponentCard>

          <ComponentCard title="This Month">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {completedStats.thisMonth}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Completed this month
              </p>
            </div>
          </ComponentCard>
        </div>
      )}

      {/* Information Panel */}
      <ComponentCard title="Completed Dispatch Management">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Completed Dispatch Archive
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>
                  View and manage all successfully completed dispatches. Track completion times, 
                  driver performance, and delivery statistics for completed orders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Completed Dispatches Table */}
      <ComponentCard title="Completed Dispatches List">
        <div className="p-6">
          <DispatchTable
            statusFilter="completed"
            onDispatchSelect={setSelectedDispatch}
            onRefresh={handleRefresh}
            refreshTrigger={refreshTrigger}
            showCompletedActions={true}
          />
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
              <span className="text-xs opacity-75">Awaiting action</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/analytics')}
              className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">📊</div>
              <span className="font-medium">Analytics</span>
              <span className="text-xs opacity-75">Performance data</span>
            </Button>
          </div>
        </div>
      </ComponentCard>

      {/* Performance Insights */}
      <ComponentCard title="Performance Insights">
        <div className="p-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Completion Rate Tracking
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    Monitor dispatch completion trends and driver performance metrics. 
                    Use this data to optimize routing and improve delivery efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}