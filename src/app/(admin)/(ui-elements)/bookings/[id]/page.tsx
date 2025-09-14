'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import BookingDetails from '@/components/ui-elements/booking-management/BookingDetails';

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const bookingId = parseInt(params?.id as string);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/signin');
    return null;
  }

  // Invalid booking ID
  if (!bookingId || isNaN(bookingId)) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Booking Details" />
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">⚠️ Invalid Booking ID</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The booking ID &quot;{params?.id}&quot; is not valid.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleClose = () => {
    router.back();
  };

  const handleRefresh = () => {
    // This will be handled by the BookingDetails component
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle={`Booking #${bookingId}`} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📋 Booking Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage booking #{bookingId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/bookings/all')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            All Bookings
          </button>
        </div>
      </div>

      {/* Booking Details Component */}
      <BookingDetails
        bookingId={bookingId}
        onClose={handleClose}
        onRefresh={handleRefresh}
      />
    </div>
  );
}