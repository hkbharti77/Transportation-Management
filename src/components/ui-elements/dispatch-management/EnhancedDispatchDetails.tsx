'use client';

import React, { useState, useEffect } from 'react';
import { dispatchService, DispatchWithDetails, UpdateDispatchStatusRequest } from '@/services/dispatchService';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

interface EnhancedDispatchDetailsProps {
  dispatchId: number;
  onClose?: () => void;
  onRefresh?: () => void;
}

export default function EnhancedDispatchDetails({ dispatchId, onClose, onRefresh }: EnhancedDispatchDetailsProps) {
  const [dispatchData, setDispatchData] = useState<DispatchWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDispatchWithDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dispatchService.getDispatchWithDetails(dispatchId);
      setDispatchData(data);
    } catch (err) {
      console.error('Failed to load dispatch with details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dispatch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatchWithDetails();
  }, [dispatchId]);

  const handleStatusUpdate = async (status: UpdateDispatchStatusRequest['status']) => {
    if (!dispatchData) return;

    try {
      const statusUpdate: UpdateDispatchStatusRequest = {
        status,
        dispatch_time: status === 'dispatched' && !dispatchData.dispatch.dispatch_time ? new Date().toISOString() : undefined,
        arrival_time: status === 'arrived' && !dispatchData.dispatch.arrival_time ? new Date().toISOString() : undefined,
      };

      await dispatchService.updateDispatchStatusAdvanced(dispatchData.dispatch.dispatch_id, statusUpdate);
      await loadDispatchWithDetails();
      onRefresh?.();
      alert(`Dispatch status updated to "${status}" successfully!`);
    } catch (error) {
      console.error('Failed to update dispatch status:', error);
      alert('Failed to update dispatch status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleCancelDispatch = async () => {
    if (!dispatchData) return;

    if (!confirm('Are you sure you want to cancel this dispatch? This action cannot be undone.')) {
      return;
    }

    try {
      await dispatchService.cancelDispatch(dispatchData.dispatch.dispatch_id);
      await loadDispatchWithDetails();
      onRefresh?.();
      alert('Dispatch has been cancelled successfully.');
    } catch (error) {
      console.error('Failed to cancel dispatch:', error);
      alert('Failed to cancel dispatch: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <ComponentCard title="Enhanced Dispatch Details">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading detailed dispatch information...</span>
        </div>
      </ComponentCard>
    );
  }

  if (error) {
    return (
      <ComponentCard title="Enhanced Dispatch Details">
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
                onClick={loadDispatchWithDetails}
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

  if (!dispatchData) {
    return (
      <ComponentCard title="Enhanced Dispatch Details">
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

  const { dispatch, booking, driver } = dispatchData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚚 Enhanced Dispatch #{dispatch.dispatch_id}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete dispatch information with booking and driver details
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
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
              <Badge size="sm" color={getStatusBadgeColor(dispatch.status)}>
                {dispatch.status.replace('_', ' ')}
              </Badge>
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
        </div>
      </ComponentCard>

      {/* Booking Details */}
      <ComponentCard title="Booking Details">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Route</h3>
              <p className="text-sm text-gray-900 dark:text-white">
                {booking.source} → {booking.destination}
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
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Booking Status</h3>
              <Badge size="sm" color={getStatusBadgeColor(booking.booking_status)}>
                {booking.booking_status.replace('_', ' ')}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Truck ID</h3>
              <p className="text-sm text-gray-900 dark:text-white">#{booking.truck_id}</p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Driver Details */}
      <ComponentCard title="Driver Information">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee ID</h3>
              <p className="text-sm text-gray-900 dark:text-white">{driver.employee_id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">License Number</h3>
              <p className="text-sm text-gray-900 dark:text-white">{driver.license_number}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience</h3>
              <p className="text-sm text-gray-900 dark:text-white">{driver.experience_years} years</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability</h3>
              <Badge size="sm" color={driver.is_available ? 'success' : 'error'}>
                {driver.is_available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Trips</h3>
              <p className="text-sm text-gray-900 dark:text-white">{driver.total_trips}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emergency Contact</h3>
              <p className="text-sm text-gray-900 dark:text-white">{driver.phone_emergency}</p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Quick Actions */}
      <ComponentCard title="Dispatch Actions">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Update Actions */}
            {dispatch.status === 'pending' && (
              <Button
                onClick={() => handleStatusUpdate('dispatched')}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                ✓ Dispatch Order
              </Button>
            )}
            
            {dispatch.status === 'dispatched' && (
              <Button
                onClick={() => handleStatusUpdate('in_transit')}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                🚚 Start Transit
              </Button>
            )}
            
            {dispatch.status === 'in_transit' && (
              <Button
                onClick={() => handleStatusUpdate('arrived')}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
              >
                📍 Mark Arrived
              </Button>
            )}
            
            {dispatch.status === 'arrived' && (
              <Button
                onClick={() => handleStatusUpdate('completed')}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                ✅ Complete
              </Button>
            )}

            {/* Cancel Action */}
            {dispatch.status !== 'completed' && dispatch.status !== 'cancelled' && (
              <Button
                onClick={handleCancelDispatch}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
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