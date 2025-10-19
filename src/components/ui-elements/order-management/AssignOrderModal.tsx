'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import { orderService, Order } from '@/services/orderService';
import { CheckCircleIcon, AlertIcon } from '@/icons';

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  status: 'active' | 'inactive' | 'on_trip';
}

interface Vehicle {
  id: number;
  plate_number: string;
  vehicle_type: string;
  capacity: number;
  status: 'available' | 'busy' | 'maintenance';
}

interface AssignOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdated: (order: Order) => void;
}

export default function AssignOrderModal({
  isOpen,
  onClose,
  order,
  onOrderUpdated
}: AssignOrderModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mock data for now - replace with actual API calls
  useEffect(() => {
    if (isOpen) {
      loadDriversAndVehicles();
      
      // Set current assignments if order has them
      if (order?.driver_id) {
        setSelectedDriverId(order.driver_id);
      }
      if (order?.vehicle_id) {
        setSelectedVehicleId(order.vehicle_id);
      }
    }
  }, [isOpen, order]);

  const loadDriversAndVehicles = async () => {
    setIsLoadingData(true);
    try {
      // Mock data - replace with actual API calls to get available drivers and vehicles
      const mockDrivers: Driver[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', license_number: 'DL123456', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', license_number: 'DL123457', status: 'active' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1234567892', license_number: 'DL123458', status: 'active' },
        { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', phone: '+1234567893', license_number: 'DL123459', status: 'active' },
      ];

      const mockVehicles: Vehicle[] = [
        { id: 1, plate_number: 'ABC-123', vehicle_type: 'Truck', capacity: 5000, status: 'available' },
        { id: 2, plate_number: 'XYZ-456', vehicle_type: 'Van', capacity: 2000, status: 'available' },
        { id: 3, plate_number: 'DEF-789', vehicle_type: 'Truck', capacity: 8000, status: 'available' },
        { id: 4, plate_number: 'GHI-012', vehicle_type: 'Pickup', capacity: 1500, status: 'available' },
      ];

      setDrivers(mockDrivers.filter(d => d.status === 'active'));
      setVehicles(mockVehicles.filter(v => v.status === 'available'));
    } catch (err) {
      console.error('Failed to load drivers and vehicles:', err);
      setError('Failed to load drivers and vehicles');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!order?.id || (!selectedDriverId && !selectedVehicleId)) {
      setError('Please select at least a driver or vehicle to assign');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let updatedOrder: Order;

      if (selectedDriverId && selectedVehicleId) {
        // Assign both vehicle and driver
        updatedOrder = await orderService.assignVehicleAndDriver(order.id, selectedVehicleId, selectedDriverId);
        setSuccess('Vehicle and driver assigned successfully!');
      } else if (selectedDriverId) {
        // Assign only driver
        updatedOrder = await orderService.assignDriver(order.id, selectedDriverId);
        setSuccess('Driver assigned successfully!');
      } else if (selectedVehicleId) {
        // Assign only vehicle
        updatedOrder = await orderService.assignVehicle(order.id, selectedVehicleId);
        setSuccess('Vehicle assigned successfully!');
      } else {
        throw new Error('No assignment selected');
      }

      onOrderUpdated(updatedOrder);
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign vehicle/driver';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(null);
      setSelectedDriverId(null);
      setSelectedVehicleId(null);
      onClose();
    }
  };

  const driverOptions = drivers.map(driver => ({
    value: driver.id.toString(),
    label: `${driver.name} (${driver.license_number})`
  }));

  const vehicleOptions = vehicles.map(vehicle => ({
    value: vehicle.id.toString(),
    label: `${vehicle.plate_number} - ${vehicle.vehicle_type} (${vehicle.capacity}kg)`
  }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Assign Vehicle & Driver
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Order #{order?.id} - Assign vehicle and/or driver to this transport order
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

        {isLoadingData ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-white"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading drivers and vehicles...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Details</h3>
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
                  <span className="text-gray-500 dark:text-gray-400">Cargo Weight:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{order?.cargo_weight} kg</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Cargo Type:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{order?.cargo_type}</p>
                </div>
              </div>
            </div>

            {/* Current Assignments */}
            {(order?.driver_id || order?.vehicle_id) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Current Assignments</h3>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  {order?.driver_id && <p>Driver ID: {order.driver_id}</p>}
                  {order?.vehicle_id && <p>Vehicle ID: {order.vehicle_id}</p>}
                </div>
              </div>
            )}

            {/* Driver Selection */}
            <div>
              <Label htmlFor="driver_select">Select Driver</Label>
              <Select
                options={driverOptions}
                placeholder="Choose a driver"
                onChange={(value) => setSelectedDriverId(value ? parseInt(value) : null)}
                defaultValue={selectedDriverId?.toString()}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Only active drivers are shown
              </p>
            </div>

            {/* Vehicle Selection */}
            <div>
              <Label htmlFor="vehicle_select">Select Vehicle</Label>
              <Select
                options={vehicleOptions}
                placeholder="Choose a vehicle"
                onChange={(value) => setSelectedVehicleId(value ? parseInt(value) : null)}
                defaultValue={selectedVehicleId?.toString()}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Only available vehicles are shown
              </p>
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
                disabled={isLoading || (!selectedDriverId && !selectedVehicleId)}
              >
                {isLoading ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}