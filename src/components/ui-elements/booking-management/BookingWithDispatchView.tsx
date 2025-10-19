'use client';

import React, { useState, useEffect } from 'react';
import { bookingService, BookingWithDispatch } from '@/services/bookingService';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';

interface BookingWithDispatchViewProps {
  bookingId?: number;
  showBookingInput?: boolean;
}

export default function BookingWithDispatchView({ 
  bookingId, 
  showBookingInput = true 
}: BookingWithDispatchViewProps) {
  const [currentBookingId, setCurrentBookingId] = useState<number>(bookingId || 0);
  const [bookingIdInput, setBookingIdInput] = useState<string>(bookingId?.toString() || '');
  const [bookingWithDispatch, setBookingWithDispatch] = useState<BookingWithDispatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookingWithDispatch = async (targetBookingId: number) => {
    if (!targetBookingId || targetBookingId <= 0) {
      setBookingWithDispatch(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getBookingWithDispatch(targetBookingId);
      setBookingWithDispatch(data);
    } catch (err) {
      console.error('Failed to load booking with dispatch:', err);
      setError(err instanceof Error ? err.message : 'Failed to load booking with dispatch');
      setBookingWithDispatch(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentBookingId > 0) {
      loadBookingWithDispatch(currentBookingId);
    }
  }, [currentBookingId]);

  const handleSearch = () => {
    const parsedBookingId = parseInt(bookingIdInput);
    if (parsedBookingId && parsedBookingId > 0) {
      setCurrentBookingId(parsedBookingId);
    } else {
      setError('Please enter a valid booking ID');
    }
  };

  const handleRefresh = () => {
    if (currentBookingId > 0) {
      loadBookingWithDispatch(currentBookingId);
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {showBookingInput && (
        <ComponentCard title="Search Booking with Dispatch">
          <div className="p-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Booking ID
                </label>
                <Input
                  type="number"
                  placeholder="Enter booking ID (e.g., 16)"
                  value={bookingIdInput}
                  onChange={(e) => setBookingIdInput(e.target.value)}
                  min="1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  disabled={loading}
                >
                  🔍 Search
                </Button>
                <Button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  disabled={loading || !currentBookingId}
                >
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </div>
        </ComponentCard>
      )}

      <ComponentCard title={currentBookingId > 0 ? `Booking #${currentBookingId} with Dispatch` : 'Booking with Dispatch Information'}>
        <div className="p-6">
          {!currentBookingId || currentBookingId <= 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚚</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Search Booking with Dispatch
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter a booking ID above to view booking and dispatch details
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading booking and dispatch details...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-2">⚠️ Error Loading Data</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button
                onClick={() => loadBookingWithDispatch(currentBookingId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Try Again
              </Button>
            </div>
          ) : bookingWithDispatch ? (
            <div className="space-y-8">
              {/* Booking Information */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{getServiceTypeIcon(bookingWithDispatch.booking.service_type)}</div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Booking #{bookingWithDispatch.booking.booking_id}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 capitalize">
                      {bookingWithDispatch.booking.service_type} transport service
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <Badge size="md" color={getStatusBadgeColor(bookingWithDispatch.booking.booking_status)}>
                      {bookingWithDispatch.booking.booking_status.toUpperCase()}
                    </Badge>
                    <div className="text-2xl font-bold text-green-600 mt-2">
                      ₹{bookingWithDispatch.booking.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
                    🗺️ Route Information
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">FROM</div>
                      <div className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                        {bookingWithDispatch.booking.source}
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
                        {bookingWithDispatch.booking.destination}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">📋 Booking Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                        <span className="font-medium text-gray-900 dark:text-white">#{bookingWithDispatch.booking.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Truck ID:</span>
                        <span className="font-medium text-blue-600">#{bookingWithDispatch.booking.truck_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Service Type:</span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {bookingWithDispatch.booking.service_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDateTime(bookingWithDispatch.booking.created_at)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDateTime(bookingWithDispatch.booking.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">🚚 Dispatch Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Dispatch ID:</span>
                        <span className="font-medium text-purple-600">
                          {bookingWithDispatch.dispatch ? `#${bookingWithDispatch.dispatch.dispatch_id}` : 'Not assigned'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        {bookingWithDispatch.dispatch ? (
                          <Badge size="sm" color={getStatusBadgeColor(bookingWithDispatch.dispatch.status)}>
                            {bookingWithDispatch.dispatch.status}
                          </Badge>
                        ) : (
                          <span className="text-gray-500">Not assigned</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Assigned Driver:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {bookingWithDispatch.dispatch?.assigned_driver ? `#${bookingWithDispatch.dispatch.assigned_driver}` : 'Not assigned'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Dispatch Time:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {bookingWithDispatch.dispatch ? formatDateTime(bookingWithDispatch.dispatch.dispatch_time) : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Arrival Time:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {bookingWithDispatch.dispatch ? formatDateTime(bookingWithDispatch.dispatch.arrival_time) : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Dispatch Created:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {bookingWithDispatch.dispatch ? formatDateTime(bookingWithDispatch.dispatch.created_at) : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Dispatch Updated:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {bookingWithDispatch.dispatch ? formatDateTime(bookingWithDispatch.dispatch.updated_at) : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Data Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Booking #{currentBookingId} not found or has no dispatch information.
              </p>
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}