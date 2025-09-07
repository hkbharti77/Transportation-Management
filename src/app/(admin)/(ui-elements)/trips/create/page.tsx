'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { tripService } from '@/services/tripService';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import TripForm from '@/components/ui-elements/trip-management/TripForm';
import Button from '@/components/ui/button/Button';

export default function CreateTripPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTrip = async (tripData: any) => {
    try {
      setCreating(true);
      setError(null);
      
      await tripService.createTrip(tripData);
      
      // Success - redirect to trips list
      router.push('/trips');
    } catch (error: any) {
      console.error('Error creating trip:', error);
      setError(error.response?.data?.message || 'Failed to create trip. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    router.push('/trips');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb
        pageTitle="Create New Trip"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ➕ Create New Trip
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Schedule a new trip with route, vehicle, and passenger details
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Trips
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <Button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                ×
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Trip Form */}
      <ComponentCard title="Trip Details">
        <div className="p-6">
          <TripForm
            onSubmit={handleCreateTrip}
            onCancel={handleCancel}
            loading={creating}
            submitButtonText="Create Trip"
          />
        </div>
      </ComponentCard>

      {/* Helper Information */}
      <ComponentCard title="Trip Creation Guidelines">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📋 Required Information
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Route ID (destination and stops)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Vehicle assignment
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Driver assignment
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Departure and arrival times
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Passenger capacity and fare
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💡 Tips for Success
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Ensure vehicle is available for scheduled time
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Verify driver availability and certification
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Set realistic departure/arrival times
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Consider passenger capacity vs. demand
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Review fare pricing for profitability
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}