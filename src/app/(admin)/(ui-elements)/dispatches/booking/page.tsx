'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import DispatchDetails from '@/components/ui-elements/dispatch-management/DispatchDetails';
import { dispatchService, Dispatch } from '@/services/dispatchService';

export default function BookingDispatchPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleBookingSelect = async () => {
    const bookingIdStr = prompt('Enter Booking ID to view its dispatch:');
    if (!bookingIdStr) return;

    const bookingId = parseInt(bookingIdStr);
    if (isNaN(bookingId) || bookingId <= 0) {
      alert('Please enter a valid booking ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dispatchData = await dispatchService.getDispatchByBookingId(bookingId);
      setDispatch(dispatchData);
      setSelectedBookingId(bookingId);
    } catch (err) {
      console.error('Failed to load dispatch for booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dispatch');
      setDispatch(null);
      
      // Show user-friendly error message
      if (err instanceof Error && err.message.includes('404')) {
        alert(`No dispatch found for booking #${bookingId}. The booking may not have a dispatch assigned yet.`);
      } else {
        alert('Failed to load dispatch: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    if (selectedBookingId) {
      // Reload the dispatch for the current booking
      handleBookingSelectById(selectedBookingId);
    }
  };

  const handleBookingSelectById = async (bookingId: number) => {
    try {
      setLoading(true);
      setError(null);
      const dispatchData = await dispatchService.getDispatchByBookingId(bookingId);
      setDispatch(dispatchData);
      setSelectedBookingId(bookingId);
    } catch (err) {
      console.error('Failed to load dispatch for booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dispatch');
      setDispatch(null);
    } finally {
      setLoading(false);
    }
  };

  if (dispatch) {
    return (
      <DispatchDetails
        dispatchId={dispatch.dispatch_id}
        onClose={() => {
          setDispatch(null);
          setSelectedBookingId(null);
          setError(null);
        }}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Booking Dispatch Lookup" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📋 Booking Dispatch Lookup
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Find and view dispatch information for specific bookings
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

      {/* Information Panel */}
      <ComponentCard title="Booking Dispatch Information">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                One-to-One Booking Dispatch Relationship
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>
                  Each booking can have only one dispatch assigned to it. Use this lookup to quickly find 
                  the dispatch status and details for any specific booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Search Interface */}
      <ComponentCard title="Find Dispatch by Booking">
        <div className="p-6 text-center">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dispatch...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error loading dispatch</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Search for Booking Dispatch
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Enter a booking ID to find its associated dispatch information and current status.
              </p>
              
              <Button
                onClick={handleBookingSelect}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
              >
                🔍 Search by Booking ID
              </Button>
            </>
          )}
        </div>
      </ComponentCard>

      {/* Recently Searched */}
      {selectedBookingId && !dispatch && !loading && (
        <ComponentCard title="Search Results">
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Dispatch Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No dispatch was found for booking #{selectedBookingId}. The booking may not have a dispatch assigned yet.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => router.push(`/dispatches/new?booking_id=${selectedBookingId}`)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                ➕ Create Dispatch for This Booking
              </Button>
              <Button
                onClick={() => router.push('/bookings/all')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                📋 View Booking Details
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
              onClick={() => router.push('/dispatches/drivers')}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">👤</div>
              <span className="font-medium">Driver Dispatches</span>
              <span className="text-xs opacity-75">By driver</span>
            </Button>

            <Button
              onClick={() => router.push('/bookings/all')}
              className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">📋</div>
              <span className="font-medium">View Bookings</span>
              <span className="text-xs opacity-75">Booking list</span>
            </Button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}