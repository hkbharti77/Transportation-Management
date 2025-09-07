"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import VehicleForm from "./VehicleForm";
import { Vehicle, CreateVehicleRequest, UpdateVehicleRequest, vehicleService } from "@/services/vehicleService";
import { CheckCircleIcon, AlertIcon } from "@/icons";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleUpdated: (vehicle: Vehicle) => void;
  vehicle?: Vehicle | null;
  mode: "create" | "edit" | "view";
}

export default function VehicleModal({
  isOpen,
  onClose,
  onVehicleUpdated,
  vehicle,
  mode
}: VehicleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (vehicleData: CreateVehicleRequest | UpdateVehicleRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let result: Vehicle;

      if (mode === "create") {
        result = await vehicleService.createVehicle(vehicleData as CreateVehicleRequest);
        setSuccess("Vehicle created successfully!");
      } else if (mode === "edit" && vehicle?.id) {
        result = await vehicleService.updateVehicle(vehicle.id, vehicleData as UpdateVehicleRequest);
        setSuccess("Vehicle updated successfully!");
      } else {
        throw new Error("Invalid operation");
      }

      onVehicleUpdated(result);
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save vehicle';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Add New Vehicle";
      case "edit":
        return "Edit Vehicle";
      case "view":
        return "Vehicle Details";
      default:
        return "Vehicle";
    }
  };

  const formatCapacity = (capacity: number) => {
    if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(1)}t`;
    }
    return `${capacity}kg`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {getModalTitle()}
          </h2>
          {mode !== "view" && (
            <p className="text-gray-600 dark:text-gray-400">
              {mode === "create" 
                ? "Add a new vehicle to your fleet management system."
                : "Update vehicle information and settings."
              }
            </p>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
            <span className="text-green-800 dark:text-green-200">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <AlertIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        )}

        {/* View Mode - Display Vehicle Details */}
        {mode === "view" && vehicle ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle ID
                  </label>
                  <p className="text-gray-900 dark:text-white">#{vehicle.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <p className="text-gray-900 dark:text-white capitalize">{vehicle.type}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    License Plate
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono font-semibold bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
                    {vehicle.license_plate}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model
                  </label>
                  <p className="text-gray-900 dark:text-white">{vehicle.model}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <p className="text-gray-900 dark:text-white">{vehicle.year}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity
                  </label>
                  <p className="text-gray-900 dark:text-white">{formatCapacity(vehicle.capacity)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    vehicle.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                    vehicle.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' :
                    vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                    {vehicle.status === 'out_of_service' ? 'Out of Service' : 
                     vehicle.status ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : 'Unknown'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assigned Driver
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {vehicle.assigned_driver_id ? `Driver #${vehicle.assigned_driver_id}` : 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Timestamps */}
            {(vehicle.created_at || vehicle.updated_at) && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {vehicle.created_at && (
                    <div>
                      <span className="font-medium">Created:</span> {new Date(vehicle.created_at).toLocaleString()}
                    </div>
                  )}
                  {vehicle.updated_at && (
                    <div>
                      <span className="font-medium">Last Updated:</span> {new Date(vehicle.updated_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Close Button for View Mode */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Form Mode - Create/Edit Vehicle */
          mode !== "view" && (
            <VehicleForm
              vehicle={vehicle}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              isLoading={isLoading}
              mode={mode as "create" | "edit"}
            />
          )
        )}
      </div>
    </Modal>
  );
}