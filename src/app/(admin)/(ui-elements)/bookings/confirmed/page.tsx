'use client';

import React, { useState, useEffect } from 'react';
// Removed unused useRouter import
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { bookingService, Booking } from '@/services/bookingService';

// We'll use the imported Booking interface directly instead of defining our own

export default function ConfirmedBookingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [, setLoading] = useState(false);

  const loadConfirmedBookings = async () => {
    try {
      setLoading(true);
      // Fetch confirmed bookings from API instead of using mock data
      const confirmedBookings = await bookingService.getBookings({ booking_status: 'confirmed' });
      setBookings(confirmedBookings.data);
      setTotalBookings(confirmedBookings.data.length);
      setTotalRevenue(confirmedBookings.data.reduce((sum, booking) => sum + booking.price, 0));
    } catch (error) {
      console.error('Error loading confirmed bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadConfirmedBookings();
    }
  }, [isAuthenticated, user]);

  const handleCancelBooking = (bookingId: number) => {
    setBookings(prev => prev.map(booking => 
      booking.booking_id === bookingId 
        ? { ...booking, booking_status: 'cancelled' } 
        : booking
    ));
  };

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

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Confirmed Bookings" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ✅ Confirmed Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage confirmed passenger bookings and reservations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadConfirmedBookings}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComponentCard title="Confirmed Bookings">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed Bookings</p>
            <p className="text-2xl font-bold text-blue-600">{totalBookings}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Revenue">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="Average Fare">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Fare</p>
            <p className="text-2xl font-bold text-purple-600">${totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : '0.00'}</p>
          </div>
        </ComponentCard>
      </div>

      {/* Status Info */}
      <ComponentCard title="Booking Status Information">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>{totalBookings}</strong> confirmed bookings with total revenue of <strong>${totalRevenue.toFixed(2)}</strong>
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Confirmed Bookings List */}
      <div className="grid grid-cols-1 gap-6">
        {bookings.length === 0 ? (
          <ComponentCard title="No Confirmed Bookings">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Confirmed Bookings</h3>
              <p className="text-gray-600 dark:text-gray-400">No bookings have been confirmed yet.</p>
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
                    <Badge color="success" variant="light">
                      ✅ CONFIRMED
                    </Badge>
                    <Badge color="info" variant="light">
                      {booking.service_type.toUpperCase()}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fare</p>
                    <p className="font-medium text-green-600">${booking.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Booked On</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>
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
                      className="px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/40 border border-purple-200 dark:border-purple-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      🎫 Generate Ticket
                    </Button>
                    <Button
                      onClick={() => handleCancelBooking(booking.booking_id)}
                      className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-800/40 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      ❌ Cancel Booking
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