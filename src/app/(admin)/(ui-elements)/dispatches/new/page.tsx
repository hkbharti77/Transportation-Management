'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import DispatchForm from '@/components/ui-elements/dispatch-management/DispatchForm';

export default function NewDispatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Get booking_id from URL parameters if provided
  const bookingIdParam = searchParams.get('booking_id');
  const defaultBookingId = bookingIdParam ? parseInt(bookingIdParam, 10) : undefined;

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

  const handleCreateSuccess = () => {
    // Show success message and redirect
    alert('Dispatch created successfully!');
    router.push('/dispatches/all');
  };

  const handleCancel = () => {
    router.push('/dispatches/all');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Create New Dispatch" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚚 Create New Dispatch
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new dispatch for an existing booking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/dispatches/all')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Dispatches
          </Button>
        </div>
      </div>

      {/* Information Panel */}
      <ComponentCard title="How Dispatch Creation Works">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Automatic Dispatch Processing
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p className="mb-2">
                  When you create a dispatch, the system will automatically:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check if the booking exists and is valid</li>
                  <li>Auto-assign a driver if the booking has a truck assigned</li>
                  <li>Set the initial dispatch status to "pending"</li>
                  <li>Create dispatch and arrival time slots</li>
                  <li>Generate tracking information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Dispatch Form */}
      <ComponentCard title="Create Dispatch">
        <div className="p-6">
          <DispatchForm
            onSuccess={handleCreateSuccess}
            onCancel={handleCancel}
            defaultBookingId={defaultBookingId}
          />
        </div>
      </ComponentCard>

      {/* Helper Information */}
      <ComponentCard title="Dispatch Information">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🚚 Dispatch Process
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Automatic booking validation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Driver assignment if available
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Real-time status tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Automated notifications
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📋 Status Workflow
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">⏳</span>
                  Pending → Awaiting confirmation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Confirmed → Ready for dispatch
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">🚚</span>
                  In Progress → Currently en route
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">✅</span>
                  Completed → Successfully delivered
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🎯 Key Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">📍</span>
                  Real-time tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-500">🕐</span>
                  Time management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">👤</span>
                  Driver assignment
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">🚨</span>
                  Status updates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}