'use client';

import React, { useState, useEffect } from 'react';
import { bookingService, Booking } from '@/services/bookingService';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import Input from '@/components/form/input/InputField';
import Badge from '@/components/ui/badge/Badge';

interface BookingStatusManagementProps {
  defaultStatus?: Booking['booking_status'];
}

export default function BookingStatusManagement({ defaultStatus }: BookingStatusManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<Booking['booking_status']>(defaultStatus || 'confirmed');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const loadBookingsByStatus = async (status: Booking['booking_status']) => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getBookingsByStatus(status, skip, limit);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings by status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookingsByStatus(selectedStatus);
  }, [selectedStatus, skip, limit, refreshTrigger, loadBookingsByStatus]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status as Booking['booking_status']);
    setSkip(0); // Reset pagination
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      await bookingService.confirmBooking(bookingId);
      handleRefresh(); // Refresh the list
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      alert('Failed to confirm booking: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleCompleteBooking = async (bookingId: number) => {
    try {
      await bookingService.completeBooking(bookingId);
      handleRefresh(); // Refresh the list
    } catch (error) {
      console.error('Failed to complete booking:', error);
      alert('Failed to complete booking: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getStatusBadgeColor = (status: string): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'light';
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'cargo':
        return '🚛';
      case 'passenger':
        return '👥';
      case 'public':
        return '🚌';
      default:
        return '🚐';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <ComponentCard title="Booking Status Filter">
        <div className="p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={handleStatusChange}
                placeholder="Select status"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skip
              </label>
              <Input
                type="number"
                defaultValue={skip.toString()}
                onChange={(e) => setSkip(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Limit
              </label>
              <Input
                type="number"
                defaultValue={limit.toString()}
                onChange={(e) => setLimit(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                min="1"
                max="100"
                className="w-24"
              />
            </div>
            <Button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              disabled={loading}
            >
              🔄 Refresh
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            API Endpoint: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
              GET /api/v1/bookings/status/{selectedStatus}?skip={skip}&limit={limit}
            </code>
          </p>
        </div>
      </ComponentCard>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Bookings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {skip + 1} to {skip + bookings.length} 
            {bookings.length === limit && ' (may have more)'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0 || loading}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
          >
            ← Previous
          </Button>
          <Button
            onClick={() => setSkip(skip + limit)}
            disabled={bookings.length < limit || loading}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
          >
            Next →
          </Button>
        </div>
      </div>

      {/* Results */}
      <ComponentCard title={`${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Bookings`}>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading {selectedStatus} bookings...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-2">⚠️ Error Loading Bookings</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button
                onClick={() => loadBookingsByStatus(selectedStatus)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Try Again
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No {selectedStatus} Bookings Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                There are no bookings with status &quot;{selectedStatus}&quot;.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Truck
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {bookings.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">
                          #{booking.booking_id}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {booking.source} → {booking.destination}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getServiceTypeIcon(booking.service_type)}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {booking.service_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          ₹{booking.price.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{booking.user_id}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          #{booking.truck_id}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Badge size="sm" color={getStatusBadgeColor(booking.booking_status)}>
                          {booking.booking_status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(booking.created_at)}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {booking.booking_status === 'pending' && (
                            <Button
                              onClick={() => handleConfirmBooking(booking.booking_id)}
                              className="px-3 py-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded"
                              disabled={loading}
                            >
                              ✅ Confirm
                            </Button>
                          )}
                          {['confirmed', 'in_progress'].includes(booking.booking_status) && (
                            <Button
                              onClick={() => handleCompleteBooking(booking.booking_id)}
                              className="px-3 py-1 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 rounded"
                              disabled={loading}
                            >
                              ✨ Complete
                            </Button>
                          )}
                          <Button
                            onClick={() => window.open(`/bookings/${booking.booking_id}`, '_blank')}
                            className="px-3 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                          >
                            👁️ View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ComponentCard>

      {/* API Endpoints Info */}
      <ComponentCard title="Status Management API Endpoints">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📋 Get by Status
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">
                  GET /bookings/status/{`{status}`}
                </code>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Retrieve all bookings with a specific status using pagination
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                ✅ Confirm Booking
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                <code className="bg-green-100 dark:bg-green-800 px-1 rounded text-xs">
                  PUT /bookings/{`{id}`}/confirm
                </code>
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Dedicated endpoint to confirm a pending booking
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                ✨ Complete Booking
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                <code className="bg-purple-100 dark:bg-purple-800 px-1 rounded text-xs">
                  PUT /bookings/{`{id}`}/complete
                </code>
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Dedicated endpoint to mark a booking as completed
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}