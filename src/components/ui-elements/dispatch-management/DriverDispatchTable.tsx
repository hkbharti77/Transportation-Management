'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { dispatchService, Dispatch } from '@/services/dispatchService';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';

interface DriverDispatchTableProps {
  driverId: number;
  onDispatchSelect?: (dispatch: Dispatch) => void;
  onRefresh?: () => void;
  refreshTrigger?: number;
  showDriverInfo?: boolean;
}

export default function DriverDispatchTable({ 
  driverId,
  onDispatchSelect, 
  onRefresh,
  refreshTrigger = 0,
  showDriverInfo = true
}: DriverDispatchTableProps) {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ skip: 0, limit: 10 });

  const loadDriverDispatches = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('DriverDispatchTable - Loading dispatches for driver:', driverId);
      const data = await dispatchService.getDispatchesByDriver(driverId, pagination.skip, pagination.limit);
      console.log('DriverDispatchTable - Loaded dispatches:', data.length);
      setDispatches(data);
    } catch (err) {
      console.error('Failed to load driver dispatches:', err);
      setError(err instanceof Error ? err.message : 'Failed to load driver dispatches');
      setDispatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Memoize pagination to prevent unnecessary re-renders
  const memoizedPagination = useMemo(() => pagination, [pagination.skip, pagination.limit]);

  useEffect(() => {
    if (driverId) {
      loadDriverDispatches();
    }
  }, [refreshTrigger, driverId, memoizedPagination]);

  const handleStatusUpdate = async (dispatchId: number, status: Dispatch['status']) => {
    try {
      await dispatchService.updateDispatchStatus(dispatchId, status);
      await loadDriverDispatches(); // Refresh the list
      onRefresh?.(); // Notify parent
    } catch (error) {
      console.error('Failed to update dispatch status:', error);
      alert('Failed to update dispatch status: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  const getStatusCounts = () => {
    const counts = {
      pending: dispatches.filter(d => d.status === 'pending').length,
      dispatched: dispatches.filter(d => d.status === 'dispatched').length,
      in_transit: dispatches.filter(d => d.status === 'in_transit').length,
      arrived: dispatches.filter(d => d.status === 'arrived').length,
      completed: dispatches.filter(d => d.status === 'completed').length,
      cancelled: dispatches.filter(d => d.status === 'cancelled').length,
    };
    return counts;
  };

  if (!driverId) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">👤</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No driver selected</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Please select a driver to view their dispatches.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading driver dispatches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading driver dispatches</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-3">
          <Button
            onClick={loadDriverDispatches}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (dispatches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No dispatches found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Driver #{driverId} has no dispatches assigned.
        </p>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-4">
      {/* Driver Info and Statistics */}
      {showDriverInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                👤 Driver #{driverId}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Total dispatches: {dispatches.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statusCounts.in_transit + statusCounts.dispatched}</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatches Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Dispatch ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Dispatch Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Arrival Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {dispatches.map((dispatch) => (
              <tr key={dispatch.dispatch_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  #{dispatch.dispatch_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => onDispatchSelect?.(dispatch)}
                    className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                  >
                    #{dispatch.booking_id}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge size="sm" color={getStatusBadgeColor(dispatch.status)}>
                    {dispatch.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(dispatch.dispatch_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(dispatch.arrival_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {/* Status Update Buttons */}
                    {dispatch.status === 'pending' && (
                      <Button
                        onClick={() => handleStatusUpdate(dispatch.dispatch_id, 'dispatched')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                      >
                        ✓ Dispatch
                      </Button>
                    )}
                    
                    {dispatch.status === 'dispatched' && (
                      <Button
                        onClick={() => handleStatusUpdate(dispatch.dispatch_id, 'in_transit')}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                      >
                        🚚 In Transit
                      </Button>
                    )}
                    
                    {dispatch.status === 'in_transit' && (
                      <Button
                        onClick={() => handleStatusUpdate(dispatch.dispatch_id, 'arrived')}
                        className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs"
                      >
                        📍 Arrived
                      </Button>
                    )}
                    
                    {dispatch.status === 'arrived' && (
                      <Button
                        onClick={() => handleStatusUpdate(dispatch.dispatch_id, 'completed')}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
                      >
                        ✅ Complete
                      </Button>
                    )}

                    {/* View Details Button */}
                    <Button
                      onClick={() => onDispatchSelect?.(dispatch)}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                    >
                      👁️ View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.limit, dispatches.length)} of {dispatches.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
            disabled={pagination.skip === 0}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-sm"
          >
            Previous
          </Button>
          <Button
            onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
            disabled={dispatches.length < pagination.limit}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}