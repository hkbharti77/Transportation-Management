'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tripService, Trip, TripFilterOptions } from '@/services/tripService';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import TripTable from '@/components/ui-elements/trip-management/TripTable';
import Badge from '@/components/ui/badge/Badge';

export default function ActiveTripsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // State management
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);
  const [limit] = useState(10);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filter for active trips only
  const [filters] = useState<TripFilterOptions>({
    page: 1,
    limit: limit,
    status: 'in_progress' // Pre-filter for active trips only
  });

  // Load active trips
  const loadActiveTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripService.getAllTrips({
        ...filters,
        status: 'in_progress' // Always filter for active trips
      });
      
      setTrips(response.data);
      setTotalTrips(response.total || response.data.length);
    } catch (error: any) {
      console.error('Error loading active trips:', error);
      setError(error.response?.data?.message || 'Failed to load active trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadActiveTrips();
    }
  }, [isAuthenticated, user]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && isAuthenticated && user?.role === 'admin') {
      interval = setInterval(() => {
        loadActiveTrips();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, isAuthenticated, user]);

  // Event handlers
  const handleDelete = async (tripId: number) => {
    try {
      await tripService.deleteTrip(tripId);
      await loadActiveTrips(); // Reload the list
    } catch (error: any) {
      console.error('Error deleting trip:', error);
      setError(error.response?.data?.message || 'Failed to delete trip');
    }
  };

  const handleRefresh = () => {
    loadActiveTrips();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleString();
  };

  const calculateProgress = (trip: Trip) => {
    if (!trip.departure_time || !trip.arrival_time) return 0;
    
    const now = new Date().getTime();
    const departure = new Date(trip.departure_time).getTime();
    const arrival = new Date(trip.arrival_time).getTime();
    
    if (now <= departure) return 0;
    if (now >= arrival) return 100;
    
    const progress = ((now - departure) / (arrival - departure)) * 100;
    return Math.round(progress);
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
      <PageBreadCrumb pageTitle="Active Trips" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚌 Active Trips Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time monitoring of trips currently in progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleAutoRefresh}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </Button>
          <Button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={loading}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Status Info */}
      <ComponentCard>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <p className="text-green-800 dark:text-green-200">
                  <strong>{totalTrips}</strong> trips currently active and in progress
                  {autoRefresh && <span className="ml-2 text-sm">(Auto-refreshing every 30 seconds)</span>}
                </p>
              </div>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Last updated: {new Date().toLocaleTimeString()}
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

      {/* Active Trips Overview Cards */}
      {trips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.slice(0, 6).map((trip) => {
            const progress = calculateProgress(trip);
            return (
              <ComponentCard key={trip.id}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Trip #{trip.id}</h3>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      IN PROGRESS
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Route:</span>
                      <span className="text-gray-900 dark:text-white">{trip.route_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Vehicle:</span>
                      <span className="text-gray-900 dark:text-white">{trip.vehicle_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Driver:</span>
                      <span className="text-gray-900 dark:text-white">{trip.driver_id}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Departed: {formatTime(trip.actual_departure_time || trip.departure_time)}
                    </div>
                  </div>
                </div>
              </ComponentCard>
            );
          })}
        </div>
      )}

      {/* Active Trips Table */}
      <ComponentCard title="Active Trips Details">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🚌 Live Trip Monitoring ({totalTrips})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Real-time status of all trips currently in progress
                {totalTrips > 0 && ` | Showing ${startIndex}-${endIndex} of ${totalTrips} active trips`}
              </p>
            </div>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚌</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Trips</h3>
              <p className="text-gray-600 dark:text-gray-400">All trips are either scheduled or completed.</p>
            </div>
          ) : (
            <TripTable
              trips={trips}
              onEdit={() => {}} // Disable editing for active trips
              onDelete={handleDelete}
              currentUserRole={user?.role}
              loading={loading}
              showEditButton={false} // Hide edit for active trips
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