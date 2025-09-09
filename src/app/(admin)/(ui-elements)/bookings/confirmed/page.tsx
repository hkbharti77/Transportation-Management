'use client';

import React, { useState, useEffect } from 'react';
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
  contact_phone?: string;
  contact_email?: string;
  special_requests?: string;
}

export default function ConfirmedBookingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Mock confirmed bookings data
  const mockConfirmedBookings: Booking[] = [
    {
      id: 1,
      trip_id: 101,
      user_id: 201,
      customer_name: "Alice Johnson",
      seat_number: "A12",
      status: 'confirmed',
      booking_time: '2024-01-15T09:30:00Z',
      trip_route: "Mumbai → Pune",
      departure_time: '2024-01-16T08:00:00Z',
      fare: 450.00,
      payment_status: 'paid',
      contact_phone: "+91-9876543210",
      contact_email: "alice.johnson@email.com",
      special_requests: "Window seat preferred"
    },
    {
      id: 3,
      trip_id: 103,
      user_id: 203,
      customer_name: "Carol Williams",
      seat_number: "C08",
      status: 'confirmed',
      booking_time: '2024-01-14T16:45:00Z',
      trip_route: "Chennai → Bangalore",
      departure_time: '2024-01-17T10:15:00Z',
      fare: 650.00,
      payment_status: 'paid',
      contact_phone: "+91-9876543212",
      contact_email: "carol.williams@email.com"
    },
    {
      id: 6,
      trip_id: 106,
      user_id: 206,
      customer_name: "Michael Brown",
      seat_number: "B14",
      status: 'confirmed',
      booking_time: '2024-01-13T11:20:00Z',
      trip_route: "Delhi → Jaipur",
      departure_time: '2024-01-18T06:30:00Z',
      fare: 380.00,
      payment_status: 'paid',
      contact_phone: "+91-9876543213",
      contact_email: "michael.brown@email.com",
      special_requests: "Vegetarian meal preferred"
    },
    {
      id: 7,
      trip_id: 107,
      user_id: 207,
      customer_name: "Sarah Davis",
      seat_number: "D05",
      status: 'confirmed',
      booking_time: '2024-01-12T14:15:00Z',
      trip_route: "Kolkata → Bhubaneswar",
      departure_time: '2024-01-19T12:00:00Z',
      fare: 520.00,
      payment_status: 'paid',
      contact_phone: "+91-9876543214",
      contact_email: "sarah.davis@email.com"
    }
  ];

  const loadConfirmedBookings = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setBookings(mockConfirmedBookings);
        setTotalBookings(mockConfirmedBookings.length);
        setTotalRevenue(mockConfirmedBookings.reduce((sum, booking) => sum + booking.fare, 0));
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading confirmed bookings:', error);
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
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' as const, payment_status: 'refunded' as const } 
        : booking
    ));
  };

  const getPaymentBadge = (status: string) => {
    const statusStyles = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
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
        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed Bookings</p>
            <p className="text-2xl font-bold text-blue-600">{totalBookings}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Fare</p>
            <p className="text-2xl font-bold text-purple-600">${(totalRevenue / totalBookings).toFixed(2)}</p>
          </div>
        </ComponentCard>
      </div>

      {/* Status Info */}
      <ComponentCard>
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
          <ComponentCard>
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Confirmed Bookings</h3>
              <p className="text-gray-600 dark:text-gray-400">No bookings have been confirmed yet.</p>
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
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      ✅ CONFIRMED
                    </Badge>
                    <Badge className={getPaymentBadge(booking.payment_status)}>
                      {booking.payment_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Trip Route</p>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.trip_route}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Departure</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDateTime(booking.departure_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fare</p>
                    <p className="font-medium text-green-600">${booking.fare.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Booked On</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(booking.booking_time).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contact Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.contact_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.contact_email}</p>
                  </div>
                </div>

                {booking.special_requests && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Special Requests</p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                      <p className="text-blue-800 dark:text-blue-200">{booking.special_requests}</p>
                    </div>
                  </div>
                )}

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
                      📧 Contact Customer
                    </Button>
                    <Button
                      className="px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/40 border border-purple-200 dark:border-purple-800 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      🎫 Generate Ticket
                    </Button>
                    <Button
                      onClick={() => handleCancelBooking(booking.id)}
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