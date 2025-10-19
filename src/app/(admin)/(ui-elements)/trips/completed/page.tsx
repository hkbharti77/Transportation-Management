'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tripService, Trip, TripFilterOptions } from '@/services/tripService';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import TripTable from '@/components/ui-elements/trip-management/TripTable';
import TripSearchFilter from '@/components/ui-elements/trip-management/TripSearchFilter';
import Badge from '@/components/ui/badge/Badge';

export default function CompletedTripsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // State management
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);
  const [limit] = useState(10);

  // Filter states
  const [filters, setFilters] = useState<TripFilterOptions>({
    page: 1,
    limit: limit,
    status: 'completed' // Pre-filter for completed trips only
  });

  // Load completed trips
  const loadCompletedTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripService.getAllTrips({
        ...filters,
        status: 'completed' // Always filter for completed trips
      });
      
      setTrips(response.data);
      setTotalTrips(response.total || response.data.length);
    } catch (error: unknown) {
      console.error('Error loading completed trips:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load completed trips';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadCompletedTrips();
    }
  }, [isAuthenticated, user, filters, loadCompletedTrips]);

  // Event handlers
  const handleDelete = async (tripId: number) => {
    try {
      await tripService.deleteTrip(tripId);
      await loadCompletedTrips(); // Reload the list
    } catch (error) {
      console.error('Error deleting trip:', error);
      setError((error as Error).message || 'Failed to delete trip');
    }
  };

  const handleFiltersChange = (newFilters: Partial<TripFilterOptions>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      status: 'completed' // Always maintain completed filter
    }));
    setCurrentPage(1);
  };

  const handleSearch = (searchFilters?: TripFilterOptions) => {
    if (searchFilters) {
      setFilters({
        ...searchFilters,
        status: 'completed', // Always maintain completed filter
        page: 1 // Reset to first page
      });
    }
    setCurrentPage(1);
  };

  const handleReset = () => {
    const resetFilters: TripFilterOptions = {
      page: 1,
      limit: limit,
      status: 'completed' // Keep completed filter
    };
    setFilters(resetFilters);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadCompletedTrips();
  };

  // Helper functions
  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleString();
  };

  const calculateDuration = (trip: Trip) => {
    if (!trip.actual_departure_time || !trip.actual_arrival_time) return 'N/A';
    
    const departure = new Date(trip.actual_departure_time).getTime();
    const arrival = new Date(trip.actual_arrival_time).getTime();
    const duration = arrival - departure;
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const calculateTripStats = () => {
    if (trips.length === 0) return { totalRevenue: 0, totalPassengers: 0, avgDuration: 'N/A' };
    
    const totalRevenue = trips.reduce((sum, trip) => {
      const passengers = (trip.total_seats || 0) - (trip.available_seats || 0);
      return sum + (passengers * (trip.fare || 0));
    }, 0);
    
    const totalPassengers = trips.reduce((sum, trip) => {
      return sum + ((trip.total_seats || 0) - (trip.available_seats || 0));
    }, 0);
    
    return { totalRevenue, totalPassengers, avgDuration: 'N/A' };
  };

  const stats = calculateTripStats();

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
      <PageBreadCrumb pageTitle="Completed Trips" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ✅ Completed Trips
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and analyze completed trip history and performance
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComponentCard title="Total Revenue">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Passengers">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Passengers</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalPassengers}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Completed Trips">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed Trips</p>
            <p className="text-2xl font-bold text-purple-600">{totalTrips}</p>
          </div>
        </ComponentCard>
      </div>

      {/* Status Info */}
      <ComponentCard title="Completed Trips Information">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-purple-800 dark:text-purple-200">
                Viewing <strong>completed trips only</strong>. Total: <strong>{totalTrips}</strong> trips successfully finished.
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

      {/* Recent Completed Trips Overview */}
      {trips.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {trips.slice(0, 6).map((trip) => (
            <ComponentCard key={trip.id} title={`Trip #${trip.id}`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Trip #{trip.id}</h3>
                  <Badge variant="light" color="success">
                    COMPLETED
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Route:</span>
                    <span className="text-gray-900 dark:text-white">{trip.route_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="text-gray-900 dark:text-white">{calculateDuration(trip)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Passengers:</span>
                    <span className="text-gray-900 dark:text-white">
                      {(trip.total_seats || 0) - (trip.available_seats || 0)}/{trip.total_seats || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                    <span className="text-green-600 font-semibold">
                      ${(((trip.total_seats || 0) - (trip.available_seats || 0)) * (trip.fare || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Completed: {formatTime(trip.actual_arrival_time || trip.arrival_time)}
                  </div>
                </div>
              </div>
            </ComponentCard>
          ))}
        </div>
      )}

      {/* Completed Trips Table */}
      <ComponentCard title="Completed Trips History">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                ✅ Trip History ({totalTrips})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Complete history of successfully finished trips
                {totalTrips > 0 && ` | Showing ${startIndex}-${endIndex} of ${totalTrips} completed trips`}
              </p>
            </div>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Completed Trips</h3>
              <p className="text-gray-600 dark:text-gray-400">No trips have been completed yet.</p>
            </div>
          ) : (
            <TripTable
              trips={trips}
              onEdit={() => {}} // Disable editing for completed trips
              onDelete={handleDelete}
              currentUserRole={user?.role}
              loading={loading}
              // showEditButton={false} // Hide edit for completed trips
              // showStatusUpdate={false} // Hide status update for completed trips
            />
          )}

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
    </div>
  );
}