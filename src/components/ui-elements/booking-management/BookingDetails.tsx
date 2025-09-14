'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bookingService, Booking } from '@/services/bookingService';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

interface BookingDetailsProps {
  bookingId: number;
  onClose?: () => void;
  onRefresh?: () => void;
}

export default function BookingDetails({ bookingId, onClose, onRefresh }: BookingDetailsProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getBookingById(bookingId);
      setBooking(data);
    } catch (err) {
      console.error('Failed to load booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const handleStatusUpdate = async (status: Booking['booking_status']) => {
    if (!booking) return;

    try {
      await bookingService.updateBookingStatus(booking.booking_id, status);
      await loadBooking(); // Refresh booking data
      onRefresh?.(); // Refresh parent list
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
      <ComponentCard title="Booking Details">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading booking details...</span>
        </div>
      </ComponentCard>
    );
  }

  if (error) {
    return (
      <ComponentCard title="Booking Details">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">⚠️ Error Loading Booking</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={loadBooking}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Try Again
            </Button>
            {onClose && (
              <Button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </ComponentCard>
    );
  }

  if (!booking) {
    return (
      <ComponentCard title="Booking Details">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Booking Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400">The requested booking could not be found.</p>
          {onClose && (
            <Button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Close
            </Button>
          )}
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title={`Booking #${booking.booking_id}`}>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{getServiceTypeIcon(booking.service_type)}</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Booking #{booking.booking_id}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {booking.service_type} transport service
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge size="md" color={getStatusBadgeColor(booking.booking_status)}>
              {booking.booking_status.toUpperCase()}
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ₹{booking.price.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total amount</div>
            </div>
          </div>
        </div>

        {/* Route Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
            🗺️ Route Information
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">FROM</div>
              <div className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                {booking.source}
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="border-t-2 border-dashed border-blue-300 dark:border-blue-700 relative">
                <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-blue-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">TO</div>
              <div className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                {booking.destination}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">📋 Booking Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                <span className="font-medium text-gray-900 dark:text-white">#{booking.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Truck ID:</span>
                <span className="font-medium text-blue-600">#{booking.truck_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service Type:</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {booking.service_type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <Badge size="sm" color={getStatusBadgeColor(booking.booking_status)}>
                  {booking.booking_status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">⏰ Timeline</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDateTime(booking.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDateTime(booking.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">⚡ Actions</h3>
          <div className="flex flex-wrap gap-2">
            {booking.booking_status === 'pending' && (
              <Button
                onClick={() => handleStatusUpdate('confirmed')}
                className="px-4 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded text-sm"
              >
                ✅ Confirm Booking
              </Button>
            )}
            {booking.booking_status === 'confirmed' && (
              <Button
                onClick={() => handleStatusUpdate('in_progress')}
                className="px-4 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded text-sm"
              >
                🚛 Start Journey
              </Button>
            )}
            {booking.booking_status === 'in_progress' && (
              <Button
                onClick={() => handleStatusUpdate('completed')}
                className="px-4 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded text-sm"
              >
                ✨ Complete
              </Button>
            )}
            {['pending', 'confirmed'].includes(booking.booking_status) && (
              <Button
                onClick={() => handleStatusUpdate('cancelled')}
                className="px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded text-sm"
              >
                ❌ Cancel
              </Button>
            )}
            <Button
              onClick={() => router.push(`/bookings/payments/booking/${booking.booking_id}`)}
              className="px-4 py-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded text-sm"
            >
              💳 View Payments
            </Button>
            <Button
              onClick={loadBooking}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}