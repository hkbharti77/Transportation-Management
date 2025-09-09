'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

interface Booking {
  id: number;
  trip_id: number;
  user_id: number;
  customer_name: string;
  seat_number: string;
  status: 'confirmed' | 'cancelled' | 'pending' | 'completed';
  booking_time: string;
  trip_route: string;
  departure_time: string;
  fare: number;
  payment_status: 'paid' | 'pending' | 'refunded';
  cancellation_date: string;
  cancellation_reason: string;
  refund_amount?: number;
  refund_status: 'pending' | 'processed' | 'denied';
}

export default function CancelledBookingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);

  // Mock cancelled bookings data
  const mockCancelledBookings: Booking[] = [
    {
      id: 5,
      trip_id: 105,
      user_id: 205,
      customer_name: "Eva Davis",
      seat_number: "E15",
      status: 'cancelled',
      booking_time: '2024-01-12T10:30:00Z',
      trip_route: "Hyderabad → Secunderabad",
      departure_time: '2024-01-15T18:45:00Z',
      fare: 120.00,
      payment_status: 'refunded',
      cancellation_date: '2024-01-13T09:15:00Z',
      cancellation_reason: "Customer changed travel plans",
      refund_amount: 96.00, // 80% refund due to cancellation policy
      refund_status: 'processed'
    },
    {
      id: 8,
      trip_id: 108,
      user_id: 208,
      customer_name: "Robert Johnson",
      seat_number: "F03",
      status: 'cancelled',
      booking_time: '2024-01-11T14:20:00Z',
      trip_route: "Mumbai → Goa",
      departure_time: '2024-01-14T07:30:00Z',
      fare: 850.00,
      payment_status: 'refunded',
      cancellation_date: '2024-01-11T20:45:00Z',
      cancellation_reason: "Late cancellation - within 2 hours of departure",
      refund_amount: 0, // No refund due to policy
      refund_status: 'denied'
    },
    {
      id: 9,
      trip_id: 109,
      user_id: 209,
      customer_name: "Jennifer Wilson",
      seat_number: "B22",
      status: 'cancelled',
      booking_time: '2024-01-10T16:45:00Z',
      trip_route: "Chennai → Coimbatore",
      departure_time: '2024-01-13T11:00:00Z',
      fare: 420.00,
      payment_status: 'pending',
      cancellation_date: '2024-01-12T08:30:00Z',
      cancellation_reason: "Emergency - family illness",
      refund_amount: 420.00, // Full refund due to emergency
      refund_status: 'pending'
    }
  ];

  const loadCancelledBookings = useCallback(async () => {
    try {
      setTimeout(() => {
        setBookings(mockCancelledBookings);
        setTotalBookings(mockCancelledBookings.length);
        setTotalLoss(mockCancelledBookings.reduce((sum, booking) => sum + booking.fare, 0));
      }, 1000);
    } catch (error) {
      console.error('Error loading cancelled bookings:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadCancelledBookings();
    }
  }, [isAuthenticated, user, loadCancelledBookings]);

  const handleProcessRefund = (bookingId: number) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, refund_status: 'processed' as const, payment_status: 'refunded' as const } 
        : booking
    ));
  };

  const getRefundStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      processed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      denied: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return styles[status as keyof typeof styles] || styles.pending;
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

  const totalRefunded = bookings.reduce((sum, booking) => sum + (booking.refund_amount || 0), 0);
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
        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{totalBookings}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💸</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Loss</p>
            <p className="text-2xl font-bold text-red-600">${totalLoss.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Refunded</p>
            <p className="text-2xl font-bold text-orange-600">${totalRefunded.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
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
                {bookings.filter(b => b.cancellation_reason.includes('changed')).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plan changes</p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Emergency Cases</h3>
              <p className="text-2xl font-bold text-orange-600">
                {bookings.filter(b => b.cancellation_reason.includes('Emergency')).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Family emergencies</p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Late Cancellations</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.cancellation_reason.includes('Late')).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Within 2 hours</p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Cancelled Bookings List */}
      <div className="grid grid-cols-1 gap-6">
        {bookings.length === 0 ? (
          <ComponentCard>
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Cancelled Bookings</h3>
              <p className="text-gray-600 dark:text-gray-400">All bookings are proceeding successfully.</p>
            </div>
          </ComponentCard>
        ) : (
          bookings.map((booking) => (
            <ComponentCard key={booking.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🎫</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Booking #{booking.id}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {booking.customer_name} • Seat {booking.seat_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      ❌ CANCELLED
                    </Badge>
                    <Badge className={getRefundStatusBadge(booking.refund_status)}>
                      {booking.refund_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Trip Route</p>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.trip_route}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Original Fare</p>
                    <p className="font-medium text-red-600">${booking.fare.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(booking.cancellation_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Refund Amount</p>
                    <p className="font-medium text-green-600">
                      {booking.refund_amount ? `$${booking.refund_amount.toFixed(2)}` : '$0.00'}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Cancellation Reason</p>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-l-4 border-red-500">
                    <p className="text-red-800 dark:text-red-200">{booking.cancellation_reason}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Original Departure:</p>
                    <p className="text-gray-900 dark:text-white">{formatDateTime(booking.departure_time)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Booked On:</p>
                    <p className="text-gray-900 dark:text-white">{formatDateTime(booking.booking_time)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Trip ID: {booking.trip_id}
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
                    {booking.refund_status === 'pending' && (
                      <Button
                        onClick={() => handleProcessRefund(booking.id)}
                        className="px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/40 border border-green-200 dark:border-green-800 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        💰 Process Refund
                      </Button>
                    )}
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