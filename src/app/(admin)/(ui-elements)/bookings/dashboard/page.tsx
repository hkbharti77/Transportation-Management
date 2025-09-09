'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
}

export default function BookingDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    recentBookings: [] as Booking[],
  });

  // Mock bookings data
  const mockBookings: Booking[] = [
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
      payment_status: 'paid'
    },
    {
      id: 2,
      trip_id: 102,
      user_id: 202,
      customer_name: "Bob Smith",
      seat_number: "B05",
      status: 'pending',
      booking_time: '2024-01-15T11:15:00Z',
      trip_route: "Delhi → Gurgaon",
      departure_time: '2024-01-16T14:30:00Z',
      fare: 280.00,
      payment_status: 'pending'
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
      payment_status: 'paid'
    },
    {
      id: 4,
      trip_id: 104,
      user_id: 204,
      customer_name: "David Brown",
      seat_number: "D03",
      status: 'completed',
      booking_time: '2024-01-13T14:20:00Z',
      trip_route: "Kolkata → Howrah",
      departure_time: '2024-01-14T12:00:00Z',
      fare: 180.00,
      payment_status: 'paid'
    },
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
      payment_status: 'refunded'
    }
  ];

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      setTimeout(() => {
        const totalBookings = mockBookings.length;
        const confirmedBookings = mockBookings.filter(b => b.status === 'confirmed').length;
        const pendingBookings = mockBookings.filter(b => b.status === 'pending').length;
        const cancelledBookings = mockBookings.filter(b => b.status === 'cancelled').length;
        const completedBookings = mockBookings.filter(b => b.status === 'completed').length;
        
        const totalRevenue = mockBookings
          .filter(b => b.payment_status === 'paid')
          .reduce((sum, b) => sum + b.fare, 0);
        
        const pendingPayments = mockBookings
          .filter(b => b.payment_status === 'pending')
          .reduce((sum, b) => sum + b.fare, 0);
        
        const recentBookings = mockBookings
          .sort((a, b) => new Date(b.booking_time).getTime() - new Date(a.booking_time).getTime())
          .slice(0, 10);

        setDashboardData({
          totalBookings,
          confirmedBookings,
          pendingBookings,
          cancelledBookings,
          completedBookings,
          totalRevenue,
          pendingPayments,
          recentBookings,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
  };

  const getPaymentBadge = (status: string) => {
    const statusStyles = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
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
      <PageBreadCrumb pageTitle="Booking Management Dashboard" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎫 Booking Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive overview of all passenger bookings and reservations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/bookings/new')}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🎫</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.totalBookings}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">{dashboardData.confirmedBookings}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{dashboardData.pendingBookings}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🚌</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600">{dashboardData.completedBookings}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{dashboardData.cancelledBookings}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
            <p className="text-2xl font-bold text-green-600">${dashboardData.totalRevenue.toFixed(2)}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">⏰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
            <p className="text-2xl font-bold text-orange-600">${dashboardData.pendingPayments.toFixed(2)}</p>
          </div>
        </ComponentCard>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <ComponentCard title="Recent Bookings">
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">🎫</div>
                  <p className="text-gray-500 dark:text-gray-400">No recent bookings found</p>
                </div>
              ) : (
                dashboardData.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Booking #{booking.id}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.customer_name} • Seat {booking.seat_number}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.trip_route} • ${booking.fare.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStatusBadge(booking.status)}>
                        {booking.status.toUpperCase()}
                      </Badge>
                      <Badge className={getPaymentBadge(booking.payment_status)}>
                        {booking.payment_status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ComponentCard>

        {/* Quick Actions */}
        <ComponentCard title="Quick Actions">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => router.push('/bookings/new')}
                className="flex flex-col items-center gap-3 p-6 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/40 rounded-lg border-2 border-purple-200 dark:border-purple-800 hover:scale-105 transition-all duration-200"
              >
                <div className="text-3xl">➕</div>
                <span className="text-purple-700 dark:text-purple-400 font-medium">New Booking</span>
              </Button>

              <Button
                onClick={() => router.push('/bookings/confirmed')}
                className="flex flex-col items-center gap-3 p-6 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/40 rounded-lg border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-all duration-200"
              >
                <div className="text-3xl">✅</div>
                <span className="text-blue-700 dark:text-blue-400 font-medium">Confirmed</span>
              </Button>

              <Button
                onClick={() => router.push('/bookings/payments')}
                className="flex flex-col items-center gap-3 p-6 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/40 rounded-lg border-2 border-green-200 dark:border-green-800 hover:scale-105 transition-all duration-200"
              >
                <div className="text-3xl">💳</div>
                <span className="text-green-700 dark:text-green-400 font-medium">Payments</span>
              </Button>

              <Button
                onClick={() => router.push('/bookings/analytics')}
                className="flex flex-col items-center gap-3 p-6 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-800/40 rounded-lg border-2 border-orange-200 dark:border-orange-800 hover:scale-105 transition-all duration-200"
              >
                <div className="text-3xl">📊</div>
                <span className="text-orange-700 dark:text-orange-400 font-medium">Analytics</span>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Management Links</h4>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/bookings/cancelled')}
                  className="w-full justify-start text-left text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  variant="ghost"
                >
                  ❌ Cancelled Bookings
                </Button>
                <Button
                  onClick={() => router.push('/tickets')}
                  className="w-full justify-start text-left text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                  variant="ghost"
                >
                  🎫 Ticket Management
                </Button>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Payment Status Overview */}
      <ComponentCard title="Payment Status Overview">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">💰</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Paid Bookings</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {mockBookings.filter(b => b.payment_status === 'paid').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ${mockBookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + b.fare, 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">⏳</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Pending Payments</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {mockBookings.filter(b => b.payment_status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ${mockBookings.filter(b => b.payment_status === 'pending').reduce((sum, b) => sum + b.fare, 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">↩️</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Refunded</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {mockBookings.filter(b => b.payment_status === 'refunded').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ${mockBookings.filter(b => b.payment_status === 'refunded').reduce((sum, b) => sum + b.fare, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Today's Schedule */}
      <ComponentCard title="Today's Departure Schedule">
        <div className="p-6">
          <div className="space-y-3">
            {dashboardData.recentBookings
              .filter(booking => {
                const departureDate = new Date(booking.departure_time);
                const today = new Date();
                return departureDate.toDateString() === today.toDateString();
              })
              .slice(0, 5)
              .map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600 font-mono text-sm">
                      {new Date(booking.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{booking.trip_route}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {booking.customer_name} • Seat {booking.seat_number}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            
            {dashboardData.recentBookings.filter(booking => {
              const departureDate = new Date(booking.departure_time);
              const today = new Date();
              return departureDate.toDateString() === today.toDateString();
            }).length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📅</div>
                <p className="text-gray-500 dark:text-gray-400">No departures scheduled for today</p>
              </div>
            )}
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}