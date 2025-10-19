'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import BookingForm from '@/components/ui-elements/booking-management/BookingForm';

export default function NewBookingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const handleCreateSuccess = () => {
    // Redirect to bookings list or show success message
    router.push('/bookings?created=true');
  };

  const handleCancel = () => {
    router.back();
  };

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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Create New Booking" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚛 Create New Booking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Book truck or public service transportation
          </p>
        </div>
      </div>

      {/* Information Alert */}
      <ComponentCard title="Booking Information">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Automatic Assignment
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  The system will automatically assign an available truck and driver to your booking
                  and set the initial booking status to &quot;confirmed&quot;.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Booking Form */}
      <ComponentCard title="Create Booking">
        <div className="p-6">
          <BookingForm
            onSuccess={handleCreateSuccess}
            onCancel={handleCancel}
          />
        </div>
      </ComponentCard>

      {/* Helper Information */}
      <ComponentCard title="Booking Information">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🚛 Cargo Transport
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Heavy goods transportation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Freight and bulk cargo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Commercial deliveries
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Inter-city transport
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                👥 Passenger Service
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Group transportation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Private hire service
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Event transportation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Airport transfers
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🚌 Public Service
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Scheduled public transport
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Government services
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Community transport
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Emergency services
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Booking Process</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">1️⃣</span>
                </div>
                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Create Request</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Fill in pickup and delivery details</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">2️⃣</span>
                </div>
                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Auto Assignment</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">System assigns truck and driver</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">3️⃣</span>
                </div>
                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Confirmation</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Booking confirmed automatically</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">4️⃣</span>
                </div>
                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Dispatch</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Create dispatch record</p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}