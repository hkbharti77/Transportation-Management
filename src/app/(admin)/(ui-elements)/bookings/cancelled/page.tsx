'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Removed unused useRouter import
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { bookingService, Booking } from '@/services/bookingService';

// We'll use the imported Booking interface directly instead of defining our own

export default function CancelledBookingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);
  const [, setLoading] = useState(false);

  const loadCancelledBookings = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch cancelled bookings from API instead of using mock data
      const cancelledBookings = await bookingService.getBookings({ booking_status: 'cancelled' });
      setBookings(cancelledBookings.data);
      setTotalBookings(cancelledBookings.data.length);
      setTotalLoss(cancelledBookings.data.reduce((sum, booking) => sum + booking.price, 0));
    } catch (error) {
      console.error('Error loading cancelled bookings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadCancelledBookings();
    }
  }, [isAuthenticated, user, loadCancelledBookings]);

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
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

  // Calculate total refunded (this would need to come from actual refund data)
  const totalRefunded = bookings.reduce((sum, booking) => sum + booking.price, 0);
  const refundRate = totalLoss > 0 ? (totalRefunded / totalLoss * 100) : 0;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Cancelled Bookings" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ❌ Cancelled Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review cancelled bookings and manage refund processes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadCancelledBookings}
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComponentCard title="Total Cancelled">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{totalBookings}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Revenue Loss">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💸</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Loss</p>
            <p className="text-2xl font-bold text-red-600">${totalLoss.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Refunded">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Refunded</p>
            <p className="text-2xl font-bold text-orange-600">${totalRefunded.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Refund Rate">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Refund Rate</p>
            <p className="text-2xl font-bold text-purple-600">{refundRate.toFixed(1)}%</p>
          </div>
        </ComponentCard>
      </div>

      {/* Cancellation Analysis */}
      <ComponentCard title="Cancellation Analysis">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-2 border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Customer Changes</h3>
              <p className="text-2xl font-bold text-red-600">
                {/* We'll need to filter based on actual data when available */}
                0
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plan changes</p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Emergency Cases</h3>
              <p className="text-2xl font-bold text-orange-600">
                {/* We'll need to filter based on actual data when available */}
                0
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Family emergencies</p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Late Cancellations</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {/* We'll need to filter based on actual data when available */}
                0
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Within 2 hours</p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Cancelled Bookings List */}
      <div className="grid grid-cols-1 gap-6">
        {bookings.length === 0 ? (
          <ComponentCard title="No Cancelled Bookings">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Cancelled Bookings</h3>
              <p className="text-gray-600 dark:text-gray-400">All bookings are proceeding successfully.</p>
            </div>
          </ComponentCard>
        ) : (
          bookings.map((booking) => (
            <ComponentCard key={booking.booking_id} title={`Booking #${booking.booking_id}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🎫</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Booking #{booking.booking_id}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        User ID: {booking.user_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge color="error" variant="light">
                      ❌ CANCELLED
                    </Badge>
                    <Badge color="warning" variant="light">
                      PENDING REFUND
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Route</p>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.source} → {booking.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Service Type</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{booking.service_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Original Fare</p>
                    <p className="font-medium text-red-600">${booking.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(booking.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Cancellation Reason</p>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-l-4 border-red-500">
                    <p className="text-red-800 dark:text-red-200">Cancellation reason not specified</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Created On:</p>
                    <p className="text-gray-900 dark:text-white">{formatDateTime(booking.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Last Updated:</p>
                    <p className="text-gray-900 dark:text-white">{formatDateTime(booking.updated_at)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Truck ID: {booking.truck_id}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      User ID: {booking.user_id}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/40 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      📄 View Details
                    </Button>
                    <Button
                      className="px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/40 border border-green-200 dark:border-green-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      💰 Process Refund
                    </Button>
                    <Button
                      className="px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/40 border border-purple-200 dark:border-purple-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      📊 Refund Report
                    </Button>
                  </div>
                </div>
              </div>
            </ComponentCard>
          ))
        )}
      </div>
    </div>
  );
}