'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { dispatchService, Dispatch, DispatchFilterOptions } from '@/services/dispatchService';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';

interface DispatchTableProps {
  filters?: DispatchFilterOptions;
  statusFilter?: string;
  onDispatchSelect?: (dispatch: Dispatch) => void;
  onRefresh?: () => void;
  refreshTrigger?: number;
  showCompletedActions?: boolean;
}

export default function DispatchTable({ 
  filters = {}, 
  statusFilter,
  onDispatchSelect, 
  onRefresh,
  refreshTrigger = 0,
  showCompletedActions = false
}: DispatchTableProps) {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDispatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use statusFilter if provided, otherwise use filters
      const searchFilters = statusFilter 
        ? { ...filters, status: statusFilter as Dispatch['status'] }
        : filters;
        
      console.log('DispatchTable - Loading dispatches with filters:', searchFilters);
      
      let data: Dispatch[];
      if (statusFilter) {
        // Use dedicated status endpoint for better performance
        data = await dispatchService.getDispatchesByStatusDedicated(statusFilter as Dispatch['status']);
      } else {
        data = await dispatchService.getDispatches(searchFilters);
      }
      
      console.log('DispatchTable - Loaded dispatches:', data.length);
      setDispatches(data);
    } catch (err) {
      console.error('Failed to load dispatches:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dispatches');
      setDispatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);
  const memoizedStatusFilter = useMemo(() => statusFilter, [statusFilter]);

  useEffect(() => {
    loadDispatches();
  }, [refreshTrigger, memoizedFilters, memoizedStatusFilter]);

  const handleStatusUpdate = async (dispatchId: number, status: Dispatch['status']) => {
    try {
      await dispatchService.updateDispatchStatus(dispatchId, status);
      await loadDispatches(); // Refresh the list
      onRefresh?.(); // Notify parent
    } catch (error) {
      console.error('Failed to update dispatch status:', error);
      alert('Failed to update dispatch status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteDispatch = async (dispatchId: number) => {
    if (!confirm('Are you sure you want to permanently delete this dispatch? This action cannot be undone.')) {
      return;
    }

    try {
      await dispatchService.deleteDispatch(dispatchId);
      await loadDispatches(); // Refresh the list
      onRefresh?.(); // Notify parent
    } catch (error) {
      console.error('Failed to delete dispatch:', error);
      alert('Failed to delete dispatch: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dispatches...</span>
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
            <h3 className="text-sm font-medium text-red-800">Error loading dispatches</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-3">
          <Button
            onClick={loadDispatches}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (dispatches.length === 0) {
    const filterStatus = statusFilter || filters?.status;
    const statusMessage = filterStatus 
      ? `No ${filterStatus} dispatches found`
      : 'No dispatches found';
    const statusEmoji = filterStatus === 'completed' ? '✅' : '📋';
    
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">{statusEmoji}</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{statusMessage}</h3>
        <p className="text-gray-500 dark:text-gray-400">
          {filterStatus === 'completed' 
            ? 'No dispatches have been completed yet. Completed dispatches will appear here once deliveries are finished.'
            : 'No dispatches match the current filters. Try adjusting your search criteria.'}
        </p>
      </div>
    );
  }

  return (
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
              Driver
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
              Created At
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {dispatch.assigned_driver ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    Driver #{dispatch.assigned_driver}
                  </span>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatDateTime(dispatch.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  {/* View Details Button - Always available */}
                  <Button
                    onClick={() => onDispatchSelect?.(dispatch)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                  >
                    👁️ View
                  </Button>

                  {/* Status Update Buttons - Only for non-completed dispatches */}
                  {!showCompletedActions && (
                    <>
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

                      {/* Cancel/Delete Button - Only for non-completed */}
                      {dispatch.status !== 'completed' && (
                        <Button
                          onClick={() => {
                            if (dispatch.status === 'pending') {
                              handleDeleteDispatch(dispatch.dispatch_id);
                            } else {
                              handleStatusUpdate(dispatch.dispatch_id, 'cancelled');
                            }
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                        >
                          {dispatch.status === 'pending' ? '🗑️ Delete' : '❌ Cancel'}
                        </Button>
                      )}
                    </>
                  )}

                  {/* Completed Actions - Only show for completed dispatches */}
                  {showCompletedActions && dispatch.status === 'completed' && (
                    <>
                      <Button
                        onClick={() => {
                          // Download or print delivery receipt
                          alert('Download receipt functionality would be implemented here');
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                      >
                        📎 Receipt
                      </Button>
                      <Button
                        onClick={() => {
                          // Provide feedback or rating
                          alert('Feedback functionality would be implemented here');
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                      >
                        ⭐ Feedback
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}