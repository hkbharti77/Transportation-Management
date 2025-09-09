'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import Input from '@/components/form/input/InputField';
import BookingTable from '@/components/ui-elements/booking-management/BookingTable';
import { BookingFilterOptions, Booking } from '@/services/bookingService';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<BookingFilterOptions>({});

  // Authentication check
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Check if user is admin
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFilterChange = (key: keyof BookingFilterOptions, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleViewDetails = (booking: Booking) => {
    router.push(`/bookings/${booking.booking_id}`);
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const serviceTypeOptions = [
    { value: '', label: 'All Service Types' },
    { value: 'cargo', label: 'Cargo Transport' },
    { value: 'passenger', label: 'Passenger Service' },
    { value: 'public', label: 'Public Service' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="All Bookings (Admin)" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚛 All Bookings (Admin)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all truck and service bookings across the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
          <Button
            onClick={() => router.push('/bookings/new')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Booking
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ComponentCard title="Filters">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <Select
                options={statusOptions}
                value={filters.booking_status || ''}
                onChange={(value) => handleFilterChange('booking_status', value || undefined)}
                placeholder="Select status"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Type
              </label>
              <Select
                options={serviceTypeOptions}
                value={filters.service_type || ''}
                onChange={(value) => handleFilterChange('service_type', value || undefined)}
                placeholder="Select service type"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User ID
              </label>
              <Input
                type="number"
                placeholder="Enter user ID"
                defaultValue={filters.user_id?.toString() || ''}
                onChange={(e) => handleFilterChange('user_id', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Truck ID
              </label>
              <Input
                type="number"
                placeholder="Enter truck ID"
                defaultValue={filters.truck_id?.toString() || ''}
                onChange={(e) => handleFilterChange('truck_id', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search bookings..."
                defaultValue={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComponentCard title="Total Bookings">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Confirmed Bookings">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">--</p>
            <p className="text-xs text-gray-500 mt-1">Ready to start</p>
          </div>
        </ComponentCard>

        <ComponentCard title="In Progress">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚛</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">--</p>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Revenue">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-600">--</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>
        </ComponentCard>
      </div>

      {/* Bookings Table */}
      <ComponentCard title="All Bookings">
        <div className="p-6">
          <BookingTable
            refreshTrigger={refreshTrigger}
            showUserColumn={true}
            onViewDetails={handleViewDetails}
            filters={filters}
          />
        </div>
      </ComponentCard>

      {/* Admin Actions Info */}
      <ComponentCard title="Admin Actions">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🔧 Status Management
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Confirm pending bookings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Start confirmed bookings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Mark bookings as completed
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Cancel bookings when needed
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📊 Monitoring
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">ℹ️</span>
                  Real-time booking updates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">ℹ️</span>
                  Truck and driver assignments
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">ℹ️</span>
                  Revenue tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">ℹ️</span>
                  Performance analytics
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ⚡ Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/bookings/analytics')}
                  className="w-full justify-start px-3 py-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded"
                >
                  📊 View Analytics
                </Button>
                <Button
                  onClick={() => router.push('/bookings/revenue')}
                  className="w-full justify-start px-3 py-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded"
                >
                  💰 Revenue Analytics
                </Button>
                <Button
                  onClick={() => router.push('/bookings/peak-hours')}
                  className="w-full justify-start px-3 py-2 text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded"
                >
                  ⏰ Peak Hours Analytics
                </Button>
                <Button
                  onClick={() => router.push('/bookings/dashboard')}
                  className="w-full justify-start px-3 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                >
                  📈 Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/fleet')}
                  className="w-full justify-start px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded"
                >
                  🚛 Fleet Management
                </Button>
                <Button
                  onClick={() => router.push('/dispatches/all')}
                  className="w-full justify-start px-3 py-2 text-sm text-orange-700 bg-orange-50 hover:bg-orange-100 rounded"
                >
                  🚚 Dispatch Management
                </Button>
                <Button
                  onClick={() => router.push('/dispatches/new')}
                  className="w-full justify-start px-3 py-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded"
                >
                  ➕ Create Dispatch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}