'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tripService, Trip, TripFilterOptions } from '@/services/tripService';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import TripTable from '@/components/ui-elements/trip-management/TripTable';
import TripModal from '@/components/ui-elements/trip-management/TripModal';
import TripSearchFilter from '@/components/ui-elements/trip-management/TripSearchFilter';

export default function ScheduledTripsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // State management
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);
  const [limit] = useState(10);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Filter states
  const [filters, setFilters] = useState<TripFilterOptions>({
    page: 1,
    limit: limit,
    status: 'scheduled' // Pre-filter for scheduled trips only
  });

  // Load scheduled trips
  const loadScheduledTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripService.getAllTrips({
        ...filters,
        status: 'scheduled' // Always filter for scheduled trips
      });
      
      setTrips(response.data);
      setTotalTrips(response.total || response.data.length);
    } catch (error: unknown) {
      console.error('Error loading scheduled trips:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load scheduled trips';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadScheduledTrips();
    }
  }, [isAuthenticated, user, filters, loadScheduledTrips]);

  // Event handlers
  const handleEdit = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowEditModal(true);
  };

  const handleDelete = async (tripId: number) => {
    try {
      await tripService.deleteTrip(tripId);
      await loadScheduledTrips(); // Reload the list
    } catch (error: unknown) {
      console.error('Error deleting trip:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete trip';
      setError(errorMessage);
    }
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedTrip(null);
    loadScheduledTrips(); // Reload after any changes
  };

  const handleFiltersChange = (newFilters: Partial<TripFilterOptions>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      status: 'scheduled', // Always maintain scheduled filter
      page: 1 // Reset to first page when filters change
    }));
    setCurrentPage(1);
  };

  const handleSearch = (searchFilters?: TripFilterOptions) => {
    if (searchFilters) {
      setFilters({
        ...searchFilters,
        status: 'scheduled', // Always maintain scheduled filter
        page: 1 // Reset to first page
      });
    }
    setCurrentPage(1);
  };

  const handleReset = () => {
    const resetFilters: TripFilterOptions = {
      page: 1,
      limit: limit,
      status: 'scheduled' // Keep scheduled filter
    };
    setFilters(resetFilters);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadScheduledTrips();
  };

  // Calculate pagination info
  const totalPages = Math.ceil(totalTrips / limit);
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalTrips);

  if (isLoading && trips.length === 0) {
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
      <PageBreadCrumb pageTitle="Scheduled Trips" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📅 Scheduled Trips
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage upcoming scheduled trips and departure times
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={loading}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Status Info */}
      <ComponentCard title="Status Information">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-blue-800 dark:text-blue-200">
                Viewing <strong>scheduled trips only</strong>. Total: <strong>{totalTrips}</strong> trips awaiting departure.
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>

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
        hideStatusFilter={true} // Hide status filter since we're already filtering
      />

      {/* Trips Table */}
      <ComponentCard title="Scheduled Trips Management">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📅 Scheduled Trips ({totalTrips})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {totalTrips > 0 && `Showing ${startIndex}-${endIndex} of ${totalTrips} scheduled trips`}
              </p>
            </div>
          </div>

          <TripTable
            trips={trips}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentUserRole={user?.role}
            loading={loading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Edit Trip Modal */}
      {showEditModal && selectedTrip && (
        <TripModal
          isOpen={showEditModal}
          onClose={handleModalClose}
          trip={selectedTrip}
          onSuccess={handleModalClose}
        />
      )}
    </div>
  );
}