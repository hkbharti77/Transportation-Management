'use client';

import React, { useState, useEffect } from 'react';
import { bookingService, Booking } from '@/services/bookingService';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import BookingTable from './BookingTable';

interface UserBookingsProps {
  defaultUserId?: number;
  showUserInput?: boolean;
}

export default function UserBookings({ defaultUserId, showUserInput = true }: UserBookingsProps) {
  const [userId, setUserId] = useState<number>(defaultUserId || 0);
  const [userIdInput, setUserIdInput] = useState<string>(defaultUserId?.toString() || '');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);

  const loadUserBookings = async (targetUserId: number) => {
    if (!targetUserId || targetUserId <= 0) {
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getBookingsByUserId(targetUserId, skip, limit);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load user bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId > 0) {
      loadUserBookings(userId);
    }
  }, [userId, refreshTrigger, skip, limit]);

  const handleSearch = () => {
    const parsedUserId = parseInt(userIdInput);
    if (parsedUserId && parsedUserId > 0) {
      setUserId(parsedUserId);
      setSkip(0); // Reset pagination
    } else {
      setError('Please enter a valid user ID');
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePaginationChange = (newSkip: number, newLimit: number) => {
    setSkip(newSkip);
    setLimit(newLimit);
  };

  return (
    <div className="space-y-6">
      {showUserInput && (
        <ComponentCard title="Search User Bookings">
          <div className="p-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID
                </label>
                <Input
                  type="number"
                  placeholder="Enter user ID (e.g., 3)"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
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
                  disabled={loading}
                >
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </div>
        </ComponentCard>
      )}

      {/* Pagination Controls */}
      {userId > 0 && (
        <ComponentCard title="Pagination Settings">
          <div className="p-6">
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skip
                </label>
                <Input
                  type="number"
                  value={skip.toString()}
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
                  value={limit.toString()}
                  onChange={(e) => setLimit(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="100"
                  className="w-24"
                />
              </div>
              <Button
                onClick={() => handlePaginationChange(skip, limit)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Apply
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Showing bookings {skip + 1} to {skip + Math.min(limit, bookings.length)} 
              {bookings.length === limit && ' (may have more)'}
            </p>
          </div>
        </ComponentCard>
      )}

      {/* Results */}
      <ComponentCard title={userId > 0 ? `Bookings for User #${userId}` : 'User Bookings'}>
        <div className="p-6">
          {!userId || userId <= 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👤</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Search User Bookings
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter a user ID above to view their bookings
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading user bookings...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-2">⚠️ Error Loading Bookings</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button
                onClick={() => loadUserBookings(userId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Try Again
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Bookings Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                User #{userId} has no bookings.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Found {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing results {skip + 1} to {skip + bookings.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSkip(Math.max(0, skip - limit))}
                    disabled={skip === 0}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                  >
                    ← Previous
                  </Button>
                  <Button
                    onClick={() => setSkip(skip + limit)}
                    disabled={bookings.length < limit}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                  >
                    Next →
                  </Button>
                </div>
              </div>
              
              {/* Custom table display for user bookings */}
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
                        Truck
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
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
                            <span className="text-lg">
                              {booking.service_type === 'cargo' ? '🚛' : 
                               booking.service_type === 'passenger' ? '👥' : '🚌'}
                            </span>
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
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            #{booking.truck_id}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.booking_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            booking.booking_status === 'completed' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.booking_status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(booking.created_at).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}