'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { tripService, Trip, TripFilterOptions } from '@/services/tripService';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import TripTable from '@/components/ui-elements/trip-management/TripTable';
import TripModal from '@/components/ui-elements/trip-management/TripModal';
import TripSearchFilter from '@/components/ui-elements/trip-management/TripSearchFilter';
import { PlusIcon } from '@/icons';

export default function TripsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // State management
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);
  const [limit] = useState(10);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Filter states
  const [filters, setFilters] = useState<TripFilterOptions>({
    page: currentPage,
    limit: limit
  });

  // Authentication check
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Only allow admin users to access this page
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // Load initial data
    loadTrips();
  }, [isAuthenticated, user, isLoading, router]);

  // Load trips when filters change
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadTrips();
    }
  }, [filters, currentPage]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update filters with current page
      const searchFilters = {
        ...filters,
        page: currentPage,
        limit: limit
      };

      const tripsData = await tripService.getTrips(searchFilters);
      setTrips(tripsData);

      // Get total count for pagination
      const count = await tripService.getTripsCount(searchFilters);
      setTotalTrips(count);

    } catch (err) {
      console.error('Failed to load trips:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = () => {
    setSelectedTrip(null);
    setShowCreateModal(true);
  };

  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowEditModal(true);
  };

  const handleDeleteTrip = async (tripId: number) => {
    try {
      // Remove from local state immediately for better UX
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      setTotalTrips(prev => prev - 1);
    } catch (error) {
      // If there's an error, reload the trips
      console.error('Error updating UI after delete:', error);
      loadTrips();
    }
  };

  const handleTripSuccess = () => {
    loadTrips();
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedTrip(null);
  };

  const handleFiltersChange = (newFilters: TripFilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadTrips();
  };

  const handleReset = () => {
    const resetFilters: TripFilterOptions = {
      page: 1,
      limit: limit
    };
    setFilters(resetFilters);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadTrips();
  };

  // Calculate pagination info
  const totalPages = Math.ceil(totalTrips / limit);
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalTrips);

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
        pageTitle="Trip Management"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Trip Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage scheduled trips, routes, and passenger transportation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
          <Button
            onClick={handleCreateTrip}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <PlusIcon className="h-4 w-4" />
            Create Trip
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

      {/* Search and Filters */}
      <TripSearchFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
      />

      {/* Trips Table */}
      <ComponentCard title="Trips Management">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Trips
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalTrips > 0 ? (
                  <>Showing {startIndex} to {endIndex} of {totalTrips} trips</>
                ) : (
                  'No trips found'
                )}
              </p>
            </div>
          </div>

          {/* Table */}
          <TripTable
            trips={trips}
            onEdit={handleEditTrip}
            onDelete={handleDeleteTrip}
            currentUserRole={user?.role}
            loading={loading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                >
                  Previous
                </Button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Create Trip Modal */}
      <TripModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleTripSuccess}
        title="Create New Trip"
      />

      {/* Edit Trip Modal */}
      <TripModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        trip={selectedTrip}
        onSuccess={handleTripSuccess}
        title="Edit Trip"
      />
    </div>
  );
}