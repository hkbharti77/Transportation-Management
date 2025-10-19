"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Select from "../../form/Select";
import { Vehicle } from "@/services/vehicleService";
import { Driver, driverService } from "@/services/driverService";
import { UserIcon, AlertIcon } from "@/icons";

interface DriverAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onDriverAssigned: (vehicle: Vehicle, driverId: number) => void;
}

export default function DriverAssignmentModal({
  isOpen,
  onClose,
  vehicle,
  onDriverAssigned
}: DriverAssignmentModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available drivers when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableDrivers();
      setSelectedDriverId("");
      setError(null);
    }
  }, [isOpen]);

  const loadAvailableDrivers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all active drivers
      const allDrivers = await driverService.getDrivers({
        status: "active",
        limit: 100
      });
      
      // Filter to only available drivers (not assigned to any vehicle)
      const availableDrivers = allDrivers.filter(driver => 
        driver.is_available && !driver.assigned_truck_id
      );
      
      setDrivers(availableDrivers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load drivers';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle?.id || !selectedDriverId) {
      setError("Please select a driver to assign");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const driverId = parseInt(selectedDriverId);
      await onDriverAssigned(vehicle, driverId);
      
      // Close modal on success
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign driver';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const driverOptions = drivers.map(driver => ({
    value: driver.id?.toString() || "",
    label: `${driver.employee_id} - Driver #${driver.id} (${driver.license_type})`
  }));

  if (!vehicle) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Assign Driver
          </h2>
        </div>
      </div>

        {/* Content */}
        <div>
          {/* Vehicle Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Details
            </h3>
            <div className="space-y-1">
              <div className="text-sm text-gray-800 dark:text-white">
                <span className="font-semibold">{vehicle.model}</span> - {vehicle.license_plate}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Type: {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)} | 
                Capacity: {vehicle.capacity >= 1000 ? `${(vehicle.capacity / 1000).toFixed(1)}t` : `${vehicle.capacity}kg`}
              </div>
              {vehicle.assigned_driver_id && (
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  Currently assigned to Driver #{vehicle.assigned_driver_id}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <AlertIcon className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
            </div>
          )}

          {/* Driver Selection Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Driver
              </label>
              
              {isLoading ? (
                <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="animate-spin inline-block w-5 h-5 border-[2px] border-current border-t-transparent text-blue-600 rounded-full">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading drivers...</span>
                </div>
              ) : drivers.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    No available drivers found. All drivers are either assigned to other vehicles or inactive.
                  </p>
                </div>
              ) : (
                <Select
                  options={driverOptions}
                  placeholder="Choose a driver to assign"
                  value={selectedDriverId}
                  onChange={setSelectedDriverId}
                  disabled={isSubmitting}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedDriverId || drivers.length === 0}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent rounded-full mr-2">
                      <span className="sr-only">Loading...</span>
                    </div>
                    Assigning...
                  </div>
                ) : (
                  "Assign Driver"
                )}
              </Button>
            </div>
          </form>
        </div>
    </Modal>
  );
}