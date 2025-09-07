'use client';

import React, { useState } from 'react';
import { Trip, tripService } from '@/services/tripService';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import { Modal } from '@/components/ui/modal';
import { 
  ClockIcon,
  LocationIcon
} from '@/icons';

interface TripTableProps {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
  onDelete: (tripId: number) => void;
  currentUserRole?: string;
  loading?: boolean;
}

export default function TripTable({ 
  trips, 
  onEdit, 
  onDelete,
  currentUserRole = 'admin',
  loading = false 
}: TripTableProps) {
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [tripToView, setTripToView] = useState<Trip | null>(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [tripForStatusUpdate, setTripForStatusUpdate] = useState<Trip | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Booking states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [tripToBook, setTripToBook] = useState<Trip | null>(null);
  const [seatNumber, setSeatNumber] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  
  // Trip bookings states (admin only)
  const [tripBookingsModalOpen, setTripBookingsModalOpen] = useState(false);
  const [selectedTripForBookings, setSelectedTripForBookings] = useState<Trip | null>(null);
  const [tripBookings, setTripBookings] = useState<import('@/services/tripService').Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Time';
    }
  };

  const getStatusBadgeColor = (status: string): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
    switch (status) {
      case 'scheduled':
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

  const handleDeleteClick = (trip: Trip) => {
    setTripToDelete(trip);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete?.id) return;

    setIsDeleting(true);
    try {
      await tripService.deleteTrip(tripToDelete.id);
      onDelete(tripToDelete.id);
      setDeleteModalOpen(false);
      setTripToDelete(null);
    } catch (error) {
      console.error('Failed to delete trip:', error);
      alert('Failed to delete trip. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewClick = (trip: Trip) => {
    setTripToView(trip);
    setViewModalOpen(true);
  };

  const handleStatusUpdateClick = (trip: Trip) => {
    setTripForStatusUpdate(trip);
    setStatusUpdateModal(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!tripForStatusUpdate?.id) return;

    setIsUpdatingStatus(true);
    try {
      await tripService.updateTripStatus(tripForStatusUpdate.id, newStatus);
      // Refresh the trips list
      window.location.reload();
      setStatusUpdateModal(false);
      setTripForStatusUpdate(null);
    } catch (error) {
      console.error('Failed to update trip status:', error);
      alert('Failed to update trip status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getAvailableStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'scheduled':
        return ['in_progress', 'cancelled'];
      case 'in_progress':
        return ['completed', 'cancelled'];
      case 'completed':
        return [];
      case 'cancelled':
        return ['scheduled'];
      default:
        return [];
    }
  };

  const handleBookClick = (trip: Trip) => {
    setTripToBook(trip);
    setSeatNumber('');
    setBookingModalOpen(true);
  };

  const handleBookingConfirm = async () => {
    if (!tripToBook?.id || !seatNumber.trim()) {
      alert('Please enter a seat number');
      return;
    }

    setIsBooking(true);
    try {
      await tripService.bookTrip(tripToBook.id, seatNumber.trim());
      alert(`Successfully booked seat ${seatNumber} on Trip #${tripToBook.id}`);
      setBookingModalOpen(false);
      setTripToBook(null);
      setSeatNumber('');
      // Refresh the page to update seat availability
      window.location.reload();
    } catch (error) {
      console.error('Failed to book trip:', error);
      alert('Failed to book seat. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleViewTripBookings = async (trip: Trip) => {
    if (!trip.id) return;
    
    setSelectedTripForBookings(trip);
    setIsLoadingBookings(true);
    setTripBookingsModalOpen(true);
    
    try {
      const bookings = await tripService.getTripBookings(trip.id);
      setTripBookings(bookings);
    } catch (error) {
      console.error('Failed to load trip bookings:', error);
      setTripBookings([]);
      alert('Failed to load bookings for this trip.');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Trip ID
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
                    Vehicle
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Driver
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Schedule
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Seats
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Fare
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
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {trips.length === 0 ? (
              <TableRow>
                <td colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <LocationIcon className="h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">No trips found</p>
                  </div>
                </td>
              </TableRow>
            ) : (
              trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      #{trip.id}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="font-medium text-gray-800 dark:text-white/90">
                      Route {trip.route_id}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="font-medium text-gray-800 dark:text-white/90">
                      Vehicle #{trip.vehicle_id}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="font-medium text-gray-800 dark:text-white/90">
                      Driver #{trip.driver_id}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3 text-gray-400" />
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {formatTime(trip.departure_time)}
                        </span>
                      </div>
                      <div className="text-theme-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(trip.departure_time).split(',')[0]}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white/90">
                        {trip.available_seats}/{trip.total_seats}
                      </div>
                      <div className="text-theme-xs text-gray-500 dark:text-gray-400">
                        available
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="font-medium text-gray-800 dark:text-white/90">
                      ₹{trip.fare.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={getStatusBadgeColor(trip.status || 'scheduled')}>
                      {trip.status || 'scheduled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewClick(trip)}
                        className="!p-3 !min-w-[40px] !min-h-[40px] flex items-center justify-center text-blue-700 bg-blue-50 hover:text-blue-900 hover:bg-blue-200 hover:scale-110 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 rounded-lg border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow-lg transition-all duration-200"
                      >
                        <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Button>

                      {/* Book Seat Button - Available to all users for scheduled trips with available seats */}
                      {trip.status === 'scheduled' && trip.available_seats > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleBookClick(trip)}
                          className="!p-3 !min-w-[40px] !min-h-[40px] flex items-center justify-center text-purple-700 bg-purple-50 hover:text-purple-900 hover:bg-purple-200 hover:scale-110 dark:text-purple-400 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 rounded-lg border border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-sm hover:shadow-lg transition-all duration-200"
                        >
                          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        </Button>
                      )}

                      {/* Status Update Button - Available to both drivers and admins */}
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdateClick(trip)}
                        className="!p-3 !min-w-[40px] !min-h-[40px] flex items-center justify-center text-orange-700 bg-orange-50 hover:text-orange-900 hover:bg-orange-200 hover:scale-110 dark:text-orange-400 dark:bg-orange-900/30 dark:hover:bg-orange-800/50 rounded-lg border border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 shadow-sm hover:shadow-lg transition-all duration-200"
                      >
                        <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Button>

                      {currentUserRole === 'admin' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleViewTripBookings(trip)}
                            className="!p-3 !min-w-[40px] !min-h-[40px] flex items-center justify-center text-cyan-700 bg-cyan-50 hover:text-cyan-900 hover:bg-cyan-200 hover:scale-110 dark:text-cyan-400 dark:bg-cyan-900/30 dark:hover:bg-cyan-800/50 rounded-lg border border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-sm hover:shadow-lg transition-all duration-200"
                          >
                            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => onEdit(trip)}
                            className="!p-3 !min-w-[40px] !min-h-[40px] flex items-center justify-center text-green-700 bg-green-50 hover:text-green-900 hover:bg-green-200 hover:scale-110 dark:text-green-400 dark:bg-green-900/30 dark:hover:bg-green-800/50 rounded-lg border border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 shadow-sm hover:shadow-lg transition-all duration-200"
                          >
                            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleDeleteClick(trip)}
                            className="!p-3 !min-w-[40px] !min-h-[40px] flex items-center justify-center text-red-700 bg-red-50 hover:text-red-900 hover:bg-red-200 hover:scale-110 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-800/50 rounded-lg border border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 shadow-sm hover:shadow-lg transition-all duration-200"
                          >
                            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Mobile Card View - Shown on mobile and tablet */}
      <div className="lg:hidden space-y-4">
        {trips.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center justify-center space-y-3">
              <LocationIcon className="h-12 w-12 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">No trips found</p>
            </div>
          </div>
        ) : (
          trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 space-y-4"
            >
              {/* Trip Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    Trip #{trip.id}
                  </div>
                  <Badge color={getStatusBadgeColor(trip.status || 'scheduled')}>
                    {trip.status || 'scheduled'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => handleViewClick(trip)}
                    className="!px-4 !py-3 flex items-center justify-center gap-2 text-blue-700 bg-blue-50 hover:text-blue-900 hover:bg-blue-200 hover:scale-105 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 rounded-lg text-sm font-semibold border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View</span>
                  </Button>
                  
                  {/* Book Seat Button - Mobile */}
                  {trip.status === 'scheduled' && trip.available_seats > 0 && (
                    <Button
                      size="sm"
                      onClick={() => handleBookClick(trip)}
                      className="!px-4 !py-3 flex items-center justify-center gap-2 text-purple-700 bg-purple-50 hover:text-purple-900 hover:bg-purple-200 hover:scale-105 dark:text-purple-400 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 rounded-lg text-sm font-semibold border border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-sm hover:shadow-lg transition-all duration-200"
                    >
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <span>Book</span>
                    </Button>
                  )}
                  
                  {/* Status Update Button - Available to both drivers and admins */}
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdateClick(trip)}
                    className="!px-4 !py-3 flex items-center justify-center gap-2 text-orange-700 bg-orange-50 hover:text-orange-900 hover:bg-orange-200 hover:scale-105 dark:text-orange-400 dark:bg-orange-900/30 dark:hover:bg-orange-800/50 rounded-lg text-sm font-semibold border border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Status</span>
                  </Button>
                  {currentUserRole === 'admin' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleViewTripBookings(trip)}
                        className="!px-4 !py-3 flex items-center justify-center gap-2 text-cyan-700 bg-cyan-50 hover:text-cyan-900 hover:bg-cyan-200 hover:scale-105 dark:text-cyan-400 dark:bg-cyan-900/30 dark:hover:bg-cyan-800/50 rounded-lg text-sm font-semibold border border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-sm hover:shadow-lg transition-all duration-200"
                      >
                        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>Bookings</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onEdit(trip)}
                        className="!px-4 !py-3 flex items-center justify-center gap-2 text-green-700 bg-green-50 hover:text-green-900 hover:bg-green-200 hover:scale-105 dark:text-green-400 dark:bg-green-900/30 dark:hover:bg-green-800/50 rounded-lg text-sm font-semibold border border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 shadow-sm hover:shadow-lg transition-all duration-200"
                      >
                        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Trip Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Route
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Route {trip.route_id}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Vehicle
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Vehicle #{trip.vehicle_id}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Driver
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Driver #{trip.driver_id}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Departure
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTime(trip.departure_time)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(trip.departure_time).split(',')[0]}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Seats
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {trip.available_seats}/{trip.total_seats}
                  </div>
                  <div className="text-xs text-gray-500">
                    available
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Fare
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    ₹{trip.fare.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Delete Action - Admin Only */}
              {currentUserRole === 'admin' && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    size="sm"
                    onClick={() => handleDeleteClick(trip)}
                    className="!px-4 !py-3 flex items-center justify-center gap-2 text-red-700 bg-red-50 hover:text-red-900 hover:bg-red-200 hover:scale-105 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-800/50 rounded-lg text-sm font-semibold w-full sm:w-auto border border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Trip</span>
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* View Trip Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        className="max-w-4xl mx-auto"
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Trip Details
            </h2>
          </div>
          {tripToView && (
            <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Basic Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Trip ID:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">#{tripToView.id}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Route:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">Route {tripToView.route_id}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Vehicle:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">Vehicle #{tripToView.vehicle_id}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Driver:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">Driver #{tripToView.driver_id}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className="ml-2">
                      <Badge color={getStatusBadgeColor(tripToView.status || 'scheduled')}>
                        {tripToView.status || 'scheduled'}
                      </Badge>
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Schedule & Capacity
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Departure:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">
                      {formatDateTime(tripToView.departure_time)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Arrival:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">
                      {formatDateTime(tripToView.arrival_time)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Total Seats:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{tripToView.total_seats}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Available Seats:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{tripToView.available_seats}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fare:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">₹{tripToView.fare.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {(tripToView.actual_departure_time || tripToView.actual_arrival_time) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Actual Times
                </h3>
                <div className="space-y-2">
                  {tripToView.actual_departure_time && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Actual Departure:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {formatDateTime(tripToView.actual_departure_time)}
                      </span>
                    </div>
                  )}
                  {tripToView.actual_arrival_time && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Actual Arrival:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {formatDateTime(tripToView.actual_arrival_time)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        className="max-w-lg mx-auto"
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Confirm Delete
            </h2>
          </div>
          <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete Trip #{tripToDelete?.id}? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end space-x-3">
            <Button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusUpdateModal}
        onClose={() => setStatusUpdateModal(false)}
        className="max-w-lg mx-auto"
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Update Trip Status
            </h2>
          </div>
          <div className="space-y-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Current Status: <Badge color={getStatusBadgeColor(tripForStatusUpdate?.status || 'scheduled')}>
                {tripForStatusUpdate?.status || 'scheduled'}
              </Badge>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Select a new status for Trip #{tripForStatusUpdate?.id}:
            </p>
          </div>

          <div className="space-y-2">
            {getAvailableStatusOptions(tripForStatusUpdate?.status || 'scheduled').map((status) => (
              <Button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={isUpdatingStatus}
                className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
              >
                <Badge color={getStatusBadgeColor(status)}>
                  {status}
                </Badge>
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setStatusUpdateModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
            >
              Cancel
            </Button>
          </div>
        </div>
        </div>
      </Modal>

      {/* Book Seat Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        className="max-w-lg mx-auto"
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Book Seat
            </h2>
          </div>
          <div className="space-y-4">
            {tripToBook && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Trip:</span>
                  <span className="text-gray-900 dark:text-white">#{tripToBook.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Route:</span>
                  <span className="text-gray-900 dark:text-white">Route {tripToBook.route_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Departure:</span>
                  <span className="text-gray-900 dark:text-white">{formatDateTime(tripToBook.departure_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Available Seats:</span>
                  <span className="text-gray-900 dark:text-white">{tripToBook.available_seats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Fare:</span>
                  <span className="text-gray-900 dark:text-white">₹{tripToBook.fare.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seat Number *
              </label>
              <Input
                type="text"
                placeholder="e.g., 1A, 15B, 42"
                defaultValue={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the seat number you'd like to book
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setBookingModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBookingConfirm}
                disabled={isBooking || !seatNumber.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
              >
                {isBooking ? 'Booking...' : 'Book Seat'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Trip Bookings Modal (Admin Only) */}
      <Modal
        isOpen={tripBookingsModalOpen}
        onClose={() => setTripBookingsModalOpen(false)}
        className="max-w-4xl mx-auto"
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Trip Bookings
            </h2>
            {selectedTripForBookings && (
              <p className="text-gray-600 dark:text-gray-400">
                Showing all bookings for Trip #{selectedTripForBookings.id}
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            {selectedTripForBookings && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Route:</span>
                    <div className="text-gray-900 dark:text-white">Route {selectedTripForBookings.route_id}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Departure:</span>
                    <div className="text-gray-900 dark:text-white">{formatDateTime(selectedTripForBookings.departure_time)}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Seats:</span>
                    <div className="text-gray-900 dark:text-white">{selectedTripForBookings.total_seats}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Available:</span>
                    <div className="text-gray-900 dark:text-white">{selectedTripForBookings.available_seats}</div>
                  </div>
                </div>
              </div>
            )}

            {isLoadingBookings ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading bookings...</span>
              </div>
            ) : tripBookings.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
                  No Bookings Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  This trip has no bookings yet.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Booking ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          User ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Seat Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Booking Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {tripBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            #{booking.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            User #{booking.user_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                            {booking.seat_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge size="sm" color={booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'error' : 'warning'}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDateTime(booking.booking_time)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total bookings: {tripBookings.length}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setTripBookingsModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}