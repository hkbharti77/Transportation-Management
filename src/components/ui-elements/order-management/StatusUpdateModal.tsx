'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import Badge from '@/components/ui/badge/Badge';
import { orderService, Order } from '@/services/orderService';
import { CheckCircleIcon, AlertIcon } from '@/icons';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdated: (order: Order) => void;
  userRole?: string;
}

export default function StatusUpdateModal({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
  userRole = 'user'
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Define available status options based on user role and current status
  const getAvailableStatuses = (): { value: string; label: string; description: string }[] => {
    const currentStatus = order?.status;
    
    // Admin can change to any status
    if (userRole === 'admin') {
      return [
        { value: 'pending', label: 'Pending', description: 'Order is waiting for processing' },
        { value: 'confirmed', label: 'Confirmed', description: 'Order has been confirmed' },
        { value: 'assigned', label: 'Assigned', description: 'Vehicle and driver assigned' },
        { value: 'in_progress', label: 'In Progress', description: 'Order is being executed' },
        { value: 'completed', label: 'Completed', description: 'Order has been completed' },
        { value: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' },
      ];
    }

    // Driver can only update specific statuses based on current state
    const driverStatuses: { value: string; label: string; description: string }[] = [];
    
    switch (currentStatus) {
      case 'assigned':
        driverStatuses.push(
          { value: 'in_progress', label: 'Start Trip', description: 'Begin the delivery journey' }
        );
        break;
      case 'in_progress':
        driverStatuses.push(
          { value: 'completed', label: 'Complete Delivery', description: 'Mark order as completed' }
        );
        break;
      default:
        // Driver cannot change other statuses
        break;
    }
    
    return driverStatuses;
  };

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'assigned':
        return 'primary';
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

  const handleSubmit = async () => {
    if (!order?.id || !selectedStatus) {
      setError('Please select a status to update');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedOrder = await orderService.updateOrderStatus(order.id, selectedStatus as Order['status']);
      setSuccess(`Order status updated to ${selectedStatus} successfully!`);
      
      onOrderUpdated(updatedOrder);
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
        setSelectedStatus('');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(null);
      setSelectedStatus('');
      onClose();
    }
  };

  const availableStatuses = getAvailableStatuses();
  const statusOptions = availableStatuses.map(status => ({
    value: status.value,
    label: status.label
  }));

  const selectedStatusInfo = availableStatuses.find(s => s.value === selectedStatus);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Update Order Status
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Order #{order?.id} - Update the status of this transport order
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {success}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center">
              <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Current Order Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Pickup:</span>
                <p className="font-medium text-gray-900 dark:text-white">{order?.pickup_location}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Drop:</span>
                <p className="font-medium text-gray-900 dark:text-white">{order?.drop_location}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Current Status:</span>
                <div className="mt-1">
                  <Badge
                    size="sm"
                    color={getStatusBadgeColor(order?.status)}
                  >
                    {order?.status === 'in_progress' ? 'In Progress' : 
                     order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Cargo:</span>
                <p className="font-medium text-gray-900 dark:text-white">{order?.cargo_type} ({order?.cargo_weight} kg)</p>
              </div>
            </div>
          </div>

          {/* Status Update Section */}
          {availableStatuses.length > 0 ? (
            <>
              <div>
                <Label htmlFor="status_select">Select New Status</Label>
                <Select
                  options={statusOptions}
                  placeholder="Choose a new status"
                  onChange={(value) => setSelectedStatus(value as Order['status'] || '')}
                  defaultValue={selectedStatus}
                />
                {selectedStatusInfo && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {selectedStatusInfo.description}
                  </p>
                )}
              </div>

              {/* Available Status Options */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  {userRole === 'admin' ? 'Available Status Options (Admin)' : 'Available Actions (Driver)'}
                </h4>
                <div className="space-y-2">
                  {availableStatuses.map((status) => (
                    <div key={status.value} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge size="sm" color={getStatusBadgeColor(status.value as Order['status'])}>
                          {status.label}
                        </Badge>
                        <span className="text-blue-800 dark:text-blue-300">{status.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedStatus}
                >
                  {isLoading ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Status Updates Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mx-auto">
                {userRole === 'driver' 
                  ? 'You cannot update the status of this order at this time. Contact your admin if needed.'
                  : 'This order status cannot be updated at this time.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}