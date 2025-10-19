'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import { fleetService } from '@/services/fleetService';
import { driverService, Driver } from '@/services/driverService';
import { Truck } from '@/services/fleetService';
import { CheckCircleIcon, AlertIcon } from '@/icons';

interface DriverAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  truck?: Truck | null;
  onAssignmentComplete: () => void;
}

export default function DriverAssignmentModal({
  isOpen,
  onClose,
  truck,
  onAssignmentComplete
}: DriverAssignmentModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch available drivers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableDrivers();
    }
  }, [isOpen]);

  const fetchAvailableDrivers = async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      
      // Fetch all drivers
      const allDrivers = await driverService.getDrivers();
      
      // Filter for available drivers (not assigned to any truck)
      const availableDrivers = allDrivers.filter(driver => 
        driver.status === 'active' && 
        !driver.assigned_truck_id
      );
      
      console.log('Available drivers:', availableDrivers);
      setDrivers(availableDrivers);
      
      if (availableDrivers.length === 0) {
        setError('No available drivers found. All drivers are already assigned to trucks.');
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
      setError('Failed to load available drivers. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId || !truck) {
      setError('Please select a driver to assign.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await fleetService.assignDriverToTruck(
        parseInt(selectedDriverId),
        truck.id!
      );
      
      setSuccess('Driver assigned successfully!');
      
      // Clear form
      setSelectedDriverId('');
      
      // Notify parent component
      onAssignmentComplete();
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign driver';
      setError(errorMessage);
      console.error('Error assigning driver:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassignDriver = async () => {
    if (!truck) {
      setError('No truck selected for unassignment.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await fleetService.unassignDriver(truck.assigned_driver_id!);
      
      setSuccess('Driver unassigned successfully!');
      
      // Notify parent component
      onAssignmentComplete();
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unassign driver';
      setError(errorMessage);
      console.error('Error unassigning driver:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedDriverId('');
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  const driverOptions = drivers.map(driver => ({
    value: driver.id!.toString(),
    label: `${driver.employee_id} - ${driver.license_number}`
  }));

  const isDriverAssigned = truck && truck.assigned_driver_id;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isDriverAssigned ? 'Unassign Driver' : 'Assign Driver to Truck'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isDriverAssigned 
              ? `Unassign driver from truck ${truck.truck_number}`
              : `Assign a driver to truck ${truck?.truck_number}`
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertIcon className="h-5 w-5 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {truck && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Truck Details</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Number:</strong> {truck.truck_number}</p>
              <p><strong>Plate:</strong> {truck.number_plate}</p>
              <p><strong>Type:</strong> {truck.truck_type}</p>
              <p><strong>Status:</strong> {truck.status}</p>
              {isDriverAssigned && (
                <p><strong>Current Driver:</strong> ID {truck.assigned_driver_id}</p>
              )}
            </div>
          </div>
        )}

        {!isDriverAssigned && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Driver *
            </label>
            <Select
              options={driverOptions}
              placeholder={isLoadingData ? "Loading drivers..." : "Select a driver"}
              onChange={(value) => setSelectedDriverId(value)}
              value={selectedDriverId}
              disabled={isLoadingData || isLoading}
            />
            {driverOptions.length === 0 && !isLoadingData && (
              <p className="mt-2 text-sm text-gray-500">
                No available drivers found. All drivers are already assigned.
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={isDriverAssigned ? handleUnassignDriver : handleAssignDriver}
            disabled={isLoading || (!isDriverAssigned && !selectedDriverId)}
            className="flex-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isDriverAssigned ? 'Unassigning...' : 'Assigning...'}
              </div>
            ) : (
              isDriverAssigned ? 'Unassign Driver' : 'Assign Driver'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
