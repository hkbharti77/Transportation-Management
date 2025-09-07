"use client";

import React, { useState } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import { Vehicle } from "@/services/vehicleService";
import { UserIcon, CloseIcon, AlertIcon } from "@/icons";

interface UnassignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onDriverUnassigned: (vehicleId: number) => void;
}

export default function UnassignDriverModal({
  isOpen,
  onClose,
  vehicle,
  onDriverUnassigned
}: UnassignDriverModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnassign = async () => {
    if (!vehicle?.id || !vehicle.assigned_driver_id) return;

    try {
      setIsSubmitting(true);
      await onDriverUnassigned(vehicle.id);
      onClose();
    } catch (err) {
      console.error('Failed to unassign driver:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vehicle || !vehicle.assigned_driver_id) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <AlertIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Unassign Driver
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
              <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                Currently assigned to Driver #{vehicle.assigned_driver_id}
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Are you sure you want to remove Driver #{vehicle.assigned_driver_id} from this vehicle? 
              The driver will become available for assignment to other vehicles.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
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
              type="button"
              variant="primary"
              onClick={handleUnassign}
              disabled={isSubmitting}
              className="flex-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent rounded-full mr-2">
                    <span className="sr-only">Loading...</span>
                  </div>
                  Unassigning...
                </div>
              ) : (
                "Unassign Driver"
              )}
            </Button>
          </div>
        </div>
    </Modal>
  );
}