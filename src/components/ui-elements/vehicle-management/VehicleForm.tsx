"use client";

import React, { useState, useEffect } from "react";
import { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from "@/services/vehicleService";
import { driverService } from "@/services/driverService";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSubmit: (vehicleData: CreateVehicleRequest | UpdateVehicleRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export default function VehicleForm({
  vehicle,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}: VehicleFormProps) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [formData, setFormData] = useState<CreateVehicleRequest>({
    type: "truck",
    capacity: 0,
    license_plate: "",
    model: "",
    year: new Date().getFullYear(),
    status: "active",
    assigned_driver_id: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch drivers on component mount
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoadingData(true);
        const driversData = await driverService.getDrivers({ limit: 100 });
        setDrivers(driversData);
      } catch (error) {
        console.error('Failed to fetch drivers:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDrivers();
  }, []);

  // Pre-populate form with vehicle data if editing
  useEffect(() => {
    if (mode === "edit" && vehicle) {
      setFormData({
        type: vehicle.type,
        capacity: vehicle.capacity,
        license_plate: vehicle.license_plate,
        model: vehicle.model,
        year: vehicle.year,
        status: vehicle.status,
        assigned_driver_id: vehicle.assigned_driver_id || null
      });
    }
  }, [vehicle, mode]);

  const handleInputChange = (field: keyof CreateVehicleRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = "Vehicle type is required";
    }

    if (!formData.license_plate.trim()) {
      newErrors.license_plate = "License plate is required";
    }

    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = "Capacity must be greater than 0";
    }

    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "Please enter a valid year";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const typeOptions = [
    { value: "truck", label: "Truck" },
    { value: "bus", label: "Bus" },
    { value: "van", label: "Van" },
    { value: "pickup", label: "Pickup" },
    { value: "motorcycle", label: "Motorcycle" }
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Under Maintenance" },
    { value: "out_of_service", label: "Out of Service" }
  ];

  const driverOptions = [
    { value: "", label: "No Driver Assigned" },
    ...drivers.map(driver => ({
      value: driver.id?.toString() || "",
      label: `${driver.user_id} - ${driver.license_number || 'N/A'}`
    }))
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1990 + 2 }, (_, i) => {
    const year = currentYear + 1 - i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Type */}
        <div>
          <Label htmlFor="type">Vehicle Type *</Label>
          <Select
            options={typeOptions}
            value={formData.type}
            onChange={(value) => handleInputChange("type", value)}
          />
          {errors.type && (
            <p className="mt-1 text-xs text-red-500">{errors.type}</p>
          )}
        </div>

        {/* License Plate */}
        <div>
          <Label htmlFor="license_plate">License Plate *</Label>
          <Input
            id="license_plate"
            type="text"
            defaultValue={formData.license_plate}
            onChange={(e) => handleInputChange("license_plate", e.target.value)}
            placeholder="Enter license plate number"
            error={!!errors.license_plate}
            className="uppercase"
          />
          {errors.license_plate && (
            <p className="mt-1 text-xs text-red-500">{errors.license_plate}</p>
          )}
        </div>

        {/* Model */}
        <div>
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            type="text"
            defaultValue={formData.model}
            onChange={(e) => handleInputChange("model", e.target.value)}
            placeholder="Enter vehicle model"
            error={!!errors.model}
          />
          {errors.model && (
            <p className="mt-1 text-xs text-red-500">{errors.model}</p>
          )}
        </div>

        {/* Year */}
        <div>
          <Label htmlFor="year">Year *</Label>
          <Select
            options={yearOptions}
            value={formData.year.toString()}
            onChange={(value) => handleInputChange("year", parseInt(value || currentYear.toString()))}
          />
          {errors.year && (
            <p className="mt-1 text-xs text-red-500">{errors.year}</p>
          )}
        </div>

        {/* Capacity */}
        <div>
          <Label htmlFor="capacity">Capacity (kg) *</Label>
          <Input
            id="capacity"
            type="number"
            defaultValue={formData.capacity}
            onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
            placeholder="Enter capacity in kg"
            min="1"
            error={!!errors.capacity}
          />
          {errors.capacity && (
            <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select
            options={statusOptions}
            value={formData.status}
            onChange={(value) => handleInputChange("status", value)}
          />
          {errors.status && (
            <p className="mt-1 text-xs text-red-500">{errors.status}</p>
          )}
        </div>

        {/* Assigned Driver */}
        <div className="md:col-span-2">
          <Label htmlFor="assigned_driver">Assigned Driver</Label>
          {isLoadingData ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
              Loading drivers...
            </div>
          ) : (
            <Select
              options={driverOptions}
              value={formData.assigned_driver_id?.toString() || ""}
              onChange={(value) => handleInputChange("assigned_driver_id", value ? parseInt(value) : null)}
              placeholder="Select a driver (optional)"
            />
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Optional: Assign a driver to this vehicle
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : mode === "create" ? "Create Vehicle" : "Update Vehicle"}
        </Button>
      </div>
    </form>
  );
}