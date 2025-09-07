'use client';

import React, { useState, useEffect } from 'react';
import { tripService, CreateTripRequest, UpdateTripRequest, Trip } from '@/services/tripService';
import { vehicleService } from '@/services/vehicleService';
import { driverService } from '@/services/driverService';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';

interface TripFormProps {
  trip?: Trip | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ValidationErrors {
  route_id?: string;
  vehicle_id?: string;
  driver_id?: string;
  departure_time?: string;
  arrival_time?: string;
  fare?: string;
  available_seats?: string;
  total_seats?: string;
  general?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export default function TripForm({ trip, onSuccess, onCancel }: TripFormProps) {
  // Form state
  const [formData, setFormData] = useState<CreateTripRequest>({
    route_id: 1,
    vehicle_id: 0,
    driver_id: 0,
    departure_time: '',
    arrival_time: '',
    fare: 0,
    available_seats: 0,
    total_seats: 0,
  });

  // UI states
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Options for dropdowns
  const [vehicleOptions, setVehicleOptions] = useState<SelectOption[]>([]);
  const [driverOptions, setDriverOptions] = useState<SelectOption[]>([]);

  // Load form data when editing
  useEffect(() => {
    if (trip) {
      setFormData({
        route_id: trip.route_id,
        vehicle_id: trip.vehicle_id,
        driver_id: trip.driver_id,
        departure_time: trip.departure_time.slice(0, 16), // Format for datetime-local input
        arrival_time: trip.arrival_time.slice(0, 16),
        fare: trip.fare,
        available_seats: trip.available_seats,
        total_seats: trip.total_seats,
      });
    }
  }, [trip]);

  // Load vehicles and drivers
  useEffect(() => {
    const loadFormData = async () => {
      setIsLoadingData(true);
      try {
        // Load vehicles
        const vehicles = await vehicleService.getVehicles({ status: 'active' });
        const vehicleOpts = vehicles.map(vehicle => ({
          value: vehicle.id!.toString(),
          label: `${vehicle.license_plate} - ${vehicle.type} (${vehicle.model})`
        }));
        setVehicleOptions(vehicleOpts);

        // Load drivers
        const drivers = await driverService.getDrivers({ status: 'active', is_available: true });
        const driverOpts = drivers.map(driver => ({
          value: driver.id!.toString(),
          label: `${driver.employee_id} - ${driver.license_type} License`
        }));
        setDriverOptions(driverOpts);

      } catch (error) {
        console.error('Failed to load form data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadFormData();
  }, []);

  const handleInputChange = (field: keyof CreateTripRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSelectChange = (field: keyof CreateTripRequest, value: string) => {
    let parsedValue: string | number = value;
    
    // Parse numeric fields
    if (['route_id', 'vehicle_id', 'driver_id'].includes(field)) {
      parsedValue = parseInt(value);
    }
    
    handleInputChange(field, parsedValue);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Route ID validation
    if (!formData.route_id || formData.route_id <= 0) {
      newErrors.route_id = 'Route ID is required';
    }

    // Vehicle validation
    if (!formData.vehicle_id || formData.vehicle_id <= 0) {
      newErrors.vehicle_id = 'Please select a vehicle';
    }

    // Driver validation
    if (!formData.driver_id || formData.driver_id <= 0) {
      newErrors.driver_id = 'Please select a driver';
    }

    // Departure time validation
    if (!formData.departure_time) {
      newErrors.departure_time = 'Departure time is required';
    }

    // Arrival time validation
    if (!formData.arrival_time) {
      newErrors.arrival_time = 'Arrival time is required';
    }

    // Check if arrival time is after departure time
    if (formData.departure_time && formData.arrival_time) {
      const departureDate = new Date(formData.departure_time);
      const arrivalDate = new Date(formData.arrival_time);
      if (arrivalDate <= departureDate) {
        newErrors.arrival_time = 'Arrival time must be after departure time';
      }
    }

    // Fare validation
    if (!formData.fare || formData.fare <= 0) {
      newErrors.fare = 'Fare must be greater than 0';
    }

    // Seats validation
    if (!formData.total_seats || formData.total_seats <= 0) {
      newErrors.total_seats = 'Total seats must be greater than 0';
    }

    if (!formData.available_seats || formData.available_seats < 0) {
      newErrors.available_seats = 'Available seats cannot be negative';
    }

    if (formData.available_seats > formData.total_seats) {
      newErrors.available_seats = 'Available seats cannot exceed total seats';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert datetime-local format to ISO string
      const submitData = {
        ...formData,
        departure_time: new Date(formData.departure_time).toISOString(),
        arrival_time: new Date(formData.arrival_time).toISOString(),
      };

      if (trip?.id) {
        // Update existing trip
        await tripService.updateTrip(trip.id, submitData as UpdateTripRequest);
      } else {
        // Create new trip
        await tripService.createTrip(submitData);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save trip:', error);
      setErrors({
        ...errors,
        general: error instanceof Error ? error.message : 'Failed to save trip'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const routeOptions: SelectOption[] = [
    { value: '1', label: 'Route 1 - Mumbai to Pune' },
    { value: '2', label: 'Route 2 - Delhi to Gurgaon' },
    { value: '3', label: 'Route 3 - Chennai to Bangalore' },
    { value: '4', label: 'Route 4 - Kolkata to Howrah' },
    { value: '5', label: 'Route 5 - Hyderabad to Secunderabad' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {trip ? 'Edit Trip' : 'Create New Trip'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}

        {/* Trip Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Trip Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Route *
              </label>
              <Select
                options={routeOptions}
                placeholder="Select a route"
                onChange={(value) => handleSelectChange("route_id", value)}
                defaultValue={formData.route_id.toString()}
              />
              {errors.route_id && (
                <p className="mt-1 text-xs text-red-500">{errors.route_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle *
              </label>
              <Select
                options={vehicleOptions}
                placeholder={isLoadingData ? "Loading vehicles..." : "Select a vehicle"}
                onChange={(value) => handleSelectChange("vehicle_id", value)}
                defaultValue={formData.vehicle_id.toString()}
                disabled={isLoadingData}
              />
              {errors.vehicle_id && (
                <p className="mt-1 text-xs text-red-500">{errors.vehicle_id}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Driver *
              </label>
              <Select
                options={driverOptions}
                placeholder={isLoadingData ? "Loading drivers..." : "Select a driver"}
                onChange={(value) => handleSelectChange("driver_id", value)}
                defaultValue={formData.driver_id.toString()}
                disabled={isLoadingData}
              />
              {errors.driver_id && (
                <p className="mt-1 text-xs text-red-500">{errors.driver_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fare (₹) *
              </label>
              <Input
                type="number"
                min="0"
                placeholder="e.g., 150.00"
                defaultValue={formData.fare.toString()}
                onChange={(e) => handleInputChange("fare", parseFloat(e.target.value) || 0)}
                className="w-full"
              />
              {errors.fare && (
                <p className="mt-1 text-xs text-red-500">{errors.fare}</p>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Schedule</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Departure Time *
              </label>
              <Input
                type="datetime-local"
                defaultValue={formData.departure_time}
                onChange={(e) => handleInputChange("departure_time", e.target.value)}
                className="w-full"
              />
              {errors.departure_time && (
                <p className="mt-1 text-xs text-red-500">{errors.departure_time}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Arrival Time *
              </label>
              <Input
                type="datetime-local"
                defaultValue={formData.arrival_time}
                onChange={(e) => handleInputChange("arrival_time", e.target.value)}
                className="w-full"
              />
              {errors.arrival_time && (
                <p className="mt-1 text-xs text-red-500">{errors.arrival_time}</p>
              )}
            </div>
          </div>
        </div>

        {/* Capacity Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Capacity</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Seats *
              </label>
              <Input
                type="number"
                min="1"
                placeholder="e.g., 50"
                defaultValue={formData.total_seats.toString()}
                onChange={(e) => handleInputChange("total_seats", parseInt(e.target.value) || 0)}
                className="w-full"
              />
              {errors.total_seats && (
                <p className="mt-1 text-xs text-red-500">{errors.total_seats}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available Seats *
              </label>
              <Input
                type="number"
                min="0"
                placeholder="e.g., 45"
                defaultValue={formData.available_seats.toString()}
                onChange={(e) => handleInputChange("available_seats", parseInt(e.target.value) || 0)}
                className="w-full"
              />
              {errors.available_seats && (
                <p className="mt-1 text-xs text-red-500">{errors.available_seats}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : trip ? 'Update Trip' : 'Create Trip'}
          </Button>
        </div>
      </form>
    </div>
  );
}