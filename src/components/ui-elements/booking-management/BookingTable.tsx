'use client';

import React, { useState, useEffect } from 'react';
import { bookingService, Booking, BookingFilterOptions } from '@/services/bookingService';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface BookingTableProps {
  refreshTrigger?: number;
  onEdit?: (booking: Booking) => void;
  onViewDetails?: (booking: Booking) => void;
  showUserColumn?: boolean;
  filters?: BookingFilterOptions;
}

export default function BookingTable({ 
  refreshTrigger, 
  onEdit,
  onViewDetails, 
  showUserColumn = true,
  filters = {} 
}: BookingTableProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingService.getBookings(filters);
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [refreshTrigger, filters]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);
      await loadBookings(); // Refresh the list
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteBooking = async (bookingId: number, status: string) => {
    // Check if booking can be deleted based on API rules
    if (!['pending', 'cancelled'].includes(status)) {
      alert('Only pending or cancelled bookings can be deleted.');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      await bookingService.deleteBooking(bookingId);
      await loadBookings(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete booking:', error);
      alert('Failed to delete booking: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };
  const handleUpdateStatus = async (bookingId: number, status: Booking['booking_status']) => {
    try {
      // Use dedicated endpoints for specific actions
      if (status === 'confirmed') {
        await bookingService.confirmBooking(bookingId);
      } else if (status === 'completed') {
        await bookingService.completeBooking(bookingId);
      } else {
        // Use general status update for other statuses
        await bookingService.updateBookingStatus(bookingId, status);
      }
      await loadBookings(); // Refresh the list
    } catch (error) {
      console.error('Failed to update booking status:', error);
      alert('Failed to update booking status: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-2">⚠️ Error Loading Bookings</div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button
          onClick={loadBookings}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Bookings Found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {Object.keys(filters).length > 0 
            ? 'No bookings match your current filters.' 
            : 'No bookings have been created yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <Table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Booking ID
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Route
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Service Type
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Price
            </TableCell>
            {showUserColumn && (
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                User ID
              </TableCell>
            )}
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Truck ID
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Status
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Created
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {bookings.map((booking) => (
            <TableRow key={booking.booking_id}>
              <TableCell className="px-5 py-4 sm:px-6 text-start">
                <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  #{booking.booking_id}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                <div className="font-medium text-gray-800 dark:text-white/90">
                  {booking.source} → {booking.destination}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getServiceTypeIcon(booking.service_type)}</span>
                  <span className="font-medium text-gray-800 dark:text-white/90 capitalize">
                    {booking.service_type}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                <div className="font-medium text-green-600 dark:text-green-400">
                  ₹{booking.price.toLocaleString()}
                </div>
              </TableCell>
              {showUserColumn && (
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="font-medium text-gray-800 dark:text-white/90">
                    {booking.user_id}
                  </div>
                </TableCell>
              )}
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                <div className="font-medium text-blue-600 dark:text-blue-400">
                  #{booking.truck_id}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                <Badge size="sm" color={getStatusBadgeColor(booking.booking_status)}>
                  {booking.booking_status}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(booking.created_at)}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                <div className="flex items-center gap-2">
                  {onViewDetails && (
                    <Button
                      size="sm"
                      onClick={() => onViewDetails(booking)}
                      className="px-3 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded text-xs"
                    >
                      View
                    </Button>
                  )}
                  {booking.booking_status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(booking.booking_id, 'confirmed')}
                      className="px-3 py-1 text-green-700 bg-green-50 hover:bg-green-100 rounded text-xs"
                    >
                      Confirm
                    </Button>
                  )}
                  {booking.booking_status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(booking.booking_id, 'in_progress')}
                      className="px-3 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded text-xs"
                    >
                      Start
                    </Button>
                  )}
                  {booking.booking_status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(booking.booking_id, 'completed')}
                      className="px-3 py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded text-xs"
                    >
                      Complete
                    </Button>
                  )}
                  {['pending', 'confirmed'].includes(booking.booking_status) && (
                    <Button
                      size="sm"
                      onClick={() => handleCancelBooking(booking.booking_id)}
                      className="px-3 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      onClick={() => onEdit(booking)}
                      className="px-3 py-1 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded text-xs"
                    >
                      Edit
                    </Button>
                  )}
                  {/* Delete button for pending or cancelled bookings */}
                  {['pending', 'cancelled'].includes(booking.booking_status) && (
                    <Button
                      size="sm"
                      onClick={() => handleDeleteBooking(booking.booking_id, booking.booking_status)}
                      className="px-3 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded text-xs"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}