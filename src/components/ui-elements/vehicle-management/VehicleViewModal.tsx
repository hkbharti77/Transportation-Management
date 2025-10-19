"use client";

import React from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Badge from "../../ui/badge/Badge";
import { Vehicle } from "@/services/vehicleService";
import { CloseIcon, UserIcon, CalenderIcon, InfoIcon } from "@/icons";

interface VehicleViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export default function VehicleViewModal({
  isOpen,
  onClose,
  vehicle
}: VehicleViewModalProps) {
  if (!vehicle) return null;

  const getStatusColor = (status: string): "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "active":
        return "success";
      case "maintenance":
        return "warning";
      case "inactive":
      case "out_of_service":
        return "error";
      default:
        return "info";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "truck":
        return "🚛";
      case "bus":
        return "🚌";
      case "van":
        return "🚐";
      case "pickup":
        return "🛻";
      case "motorcycle":
        return "🏍️";
      default:
        return "🚗";
    }
  };

  const formatCapacity = (capacity: number) => {
    if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(1)} tons`;
    }
    return `${capacity} kg`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{getTypeIcon(vehicle.type)}</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {vehicle.model}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vehicle #{vehicle.id} • {vehicle.license_plate}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
            <InfoIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Vehicle Type
              </label>
              <p className="text-sm font-semibold text-gray-800 dark:text-white capitalize">
                {vehicle.type}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Model
              </label>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {vehicle.model}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                License Plate
              </label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                {vehicle.license_plate}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Year
              </label>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {vehicle.year}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Capacity
              </label>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {formatCapacity(vehicle.capacity)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Status
              </label>
              <Badge color={getStatusColor(vehicle.status)} variant="light">
                {vehicle.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Assignment Information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
            Driver Assignment
          </h3>
          {vehicle.assigned_driver_id ? (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <UserIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Assigned to Driver #{vehicle.assigned_driver_id}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  This vehicle is currently assigned to a driver
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800">
              <InfoIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  No Driver Assigned
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  This vehicle is available for assignment
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
            <CalenderIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
            Record Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Created
              </label>
              <p className="text-sm text-gray-800 dark:text-white">
                {formatDate(vehicle.created_at)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Last Updated
              </label>
              <p className="text-sm text-gray-800 dark:text-white">
                {formatDate(vehicle.updated_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <CloseIcon className="h-4 w-4" />
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}