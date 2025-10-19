'use client';

import React, { useState, useEffect } from 'react';
import { dispatchService, Dispatch } from '@/services/dispatchService';
import { bookingService, Booking } from '@/services/bookingService';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

interface DispatchDetailsProps {
  dispatchId: number;
  onClose?: () => void;
  onRefresh?: () => void;
}

export default function DispatchDetails({ dispatchId, onClose, onRefresh }: DispatchDetailsProps) {
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDispatchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load dispatch details
      const dispatchData = await dispatchService.getDispatchById(dispatchId);
      setDispatch(dispatchData);

      // Load associated booking details
      if (dispatchData.booking_id) {
        try {
          const bookingData = await bookingService.getBookingById(dispatchData.booking_id);
          setBooking(bookingData);
        } catch (bookingError) {
          console.error('Failed to load booking details:', bookingError);
          // Don't fail the whole component if booking load fails
        }
      }
    } catch (err) {
      console.error('Failed to load dispatch details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dispatch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatchDetails();
  }, [dispatchId]);

  const handleStatusUpdate = async (status: Dispatch['status']) => {
    if (!dispatch) return;

    try {
      await dispatchService.updateDispatchStatus(dispatch.dispatch_id, status);
      await loadDispatchDetails(); // Refresh dispatch data
      onRefresh?.(); // Refresh parent list
    } catch (error) {
      console.error('Failed to update dispatch status:', error);
      alert('Failed to update dispatch status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleAssignDriver = async () => {
    if (!dispatch) return;

    const driverIdStr = prompt('Enter Driver ID to assign:');
    if (!driverIdStr) return;

    const driverId = parseInt(driverIdStr);
    if (isNaN(driverId) || driverId <= 0) {
      alert('Please enter a valid driver ID');
      return;
    }

    try {
      // Use the dedicated assign-driver endpoint
      await dispatchService.assignDriver(dispatch.dispatch_id, driverId);
      await loadDispatchDetails(); // Refresh dispatch data
      onRefresh?.(); // Refresh parent list
      alert(`Driver #${driverId} has been successfully assigned to this dispatch.`);
    } catch (error) {
      console.error('Failed to assign driver:', error);
      alert('Failed to assign driver: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSetDispatchTime = async () => {
    if (!dispatch) return;

    const dispatchTime = new Date().toISOString();
    
    try {
      await dispatchService.setDispatchTime(dispatch.dispatch_id, dispatchTime);
      await loadDispatchDetails(); // Refresh dispatch data
      onRefresh?.(); // Refresh parent list
    } catch (error) {
      console.error('Failed to set dispatch time:', error);
      alert('Failed to set dispatch time: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSetArrivalTime = async () => {
    if (!dispatch) return;

    const arrivalTime = new Date().toISOString();
    
    try {
      await dispatchService.setArrivalTime(dispatch.dispatch_id, arrivalTime);
      await loadDispatchDetails(); // Refresh dispatch data
      onRefresh?.(); // Refresh parent list
    } catch (error) {
      console.error('Failed to set arrival time:', error);
      alert('Failed to set arrival time: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getStatusBadgeColor = (status: string): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
    switch (status) {
      case 'dispatched':
        return 'info';
      case 'in_transit':
        return 'primary';
      case 'arrived':
        return 'warning';
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
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

  if (loading) {
    return (
      <ComponentCard title="Dispatch Details">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dispatch details...</span>
        </div>
      </ComponentCard>
    );
  }

  if (error) {
    return (
      <ComponentCard title="Dispatch Details">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading dispatch details</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-3 flex space-x-3">
              <Button
                onClick={loadDispatchDetails}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
              >
                Try Again
              </Button>
              {onClose && (
                <Button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </ComponentCard>
    );
  }

  if (!dispatch) {
    return (
      <ComponentCard title="Dispatch Details">
        <div className="p-6 text-center">
          <div className="text-4xl mb-4">❓</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Dispatch not found</h3>
          <p className="text-gray-500 dark:text-gray-400">The requested dispatch could not be found.</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚚 Dispatch #{dispatch.dispatch_id}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed information about this dispatch
          </p>
        </div>
        {onClose && (
          <Button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            ← Back
          </Button>
        )}
      </div>

      {/* Dispatch Information */}
      <ComponentCard title="Dispatch Information">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dispatch ID</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">#{dispatch.dispatch_id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Booking ID</h3>
              <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">#{dispatch.booking_id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
              <Badge size="sm" color={getStatusBadgeColor(dispatch.status)}>
                {dispatch.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Driver</h3>
              {dispatch.assigned_driver ? (
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Driver #{dispatch.assigned_driver}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Not assigned</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dispatch Time</h3>
              <p className="text-sm text-gray-900 dark:text-white">{formatDateTime(dispatch.dispatch_time)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Arrival Time</h3>
              <p className="text-sm text-gray-900 dark:text-white">{formatDateTime(dispatch.arrival_time)}</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created At</h3>
                <p className="text-sm text-gray-900 dark:text-white">{formatDateTime(dispatch.created_at)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Updated</h3>
                <p className="text-sm text-gray-900 dark:text-white">{formatDateTime(dispatch.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Associated Booking Information */}
      {booking && (
        <ComponentCard title="Associated Booking Details">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Route</h3>
                <p className="text-sm text-gray-900 dark:text-white">
                  {getServiceTypeIcon(booking.service_type)} {booking.source} → {booking.destination}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Type</h3>
                <p className="text-sm text-gray-900 dark:text-white capitalize">{booking.service_type}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</h3>
                <p className="text-sm text-gray-900 dark:text-white font-semibold">₹{booking.price.toLocaleString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User ID</h3>
                <p className="text-sm text-gray-900 dark:text-white">{booking.user_id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Truck ID</h3>
                <p className="text-sm text-gray-900 dark:text-white">{booking.truck_id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Booking Status</h3>
                <Badge size="sm" color={getStatusBadgeColor(booking.booking_status)}>
                  {booking.booking_status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </ComponentCard>
      )}

      {/* Quick Actions */}
      <ComponentCard title="Quick Actions">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Update Actions */}
            {dispatch.status === 'pending' && (
              <Button
                onClick={() => handleStatusUpdate('dispatched')}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                ✓ Dispatch Order
              </Button>
            )}
            
            {dispatch.status === 'dispatched' && (
              <Button
                onClick={() => handleStatusUpdate('in_transit')}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                🚚 Start Transit
              </Button>
            )}
            
            {dispatch.status === 'in_transit' && (
              <Button
                onClick={() => handleStatusUpdate('arrived')}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                📍 Mark Arrived
              </Button>
            )}
            
            {dispatch.status === 'arrived' && (
              <Button
                onClick={() => handleStatusUpdate('completed')}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                ✅ Complete Dispatch
              </Button>
            )}

            {/* Driver Assignment */}
            {!dispatch.assigned_driver && (
              <Button
                onClick={handleAssignDriver}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                👤 Assign Driver
              </Button>
            )}

            {/* Time Management */}
            {!dispatch.dispatch_time && dispatch.status !== 'pending' && (
              <Button
                onClick={handleSetDispatchTime}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                ⏰ Set Dispatch Time
              </Button>
            )}

            {!dispatch.arrival_time && dispatch.status === 'in_transit' && (
              <Button
                onClick={handleSetArrivalTime}
                className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                🏁 Set Arrival Time
              </Button>
            )}

            {/* Cancel Action */}
            {dispatch.status !== 'completed' && dispatch.status !== 'cancelled' && (
              <Button
                onClick={() => handleStatusUpdate('cancelled')}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                ❌ Cancel Dispatch
              </Button>
            )}
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}