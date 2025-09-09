'use client';

import React, { useState, useEffect } from 'react';
import { bookingService, CreateBookingRequest } from '@/services/bookingService';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';

interface BookingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ValidationErrors {
  source?: string;
  destination?: string;
  service_type?: string;
  price?: string;
  user_id?: string;
  general?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export default function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  // Form state
  const [formData, setFormData] = useState<CreateBookingRequest>({
    source: '',
    destination: '',
    service_type: 'cargo',
    price: 0,
    user_id: 0,
  });

  // UI states
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load current user
  useEffect(() => {
    const currentUserStr = localStorage.getItem('current_user');
    if (currentUserStr) {
      try {
        const user = JSON.parse(currentUserStr);
        setCurrentUser(user);
        setFormData(prev => ({
          ...prev,
          user_id: user.id
        }));
      } catch (error) {
        console.error('Error parsing current user:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof CreateBookingRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSelectChange = (field: keyof CreateBookingRequest, value: string) => {
    let parsedValue: string | number = value;
    
    // Parse numeric fields
    if (['price', 'user_id'].includes(field)) {
      parsedValue = parseFloat(value);
    }
    
    handleInputChange(field, parsedValue);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Source validation
    if (!formData.source.trim()) {
      newErrors.source = 'Source location is required';
    }

    // Destination validation
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination location is required';
    }

    // Service type validation
    if (!formData.service_type) {
      newErrors.service_type = 'Service type is required';
    }

    // Price validation
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    // User ID validation
    if (!formData.user_id || formData.user_id <= 0) {
      newErrors.user_id = 'User ID is required';
    }

    // Check if source and destination are different
    if (formData.source.trim() && formData.destination.trim() && 
        formData.source.trim().toLowerCase() === formData.destination.trim().toLowerCase()) {
      newErrors.destination = 'Destination must be different from source';
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
      await bookingService.createBooking(formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create booking:', error);
      setErrors({
        ...errors,
        general: error instanceof Error ? error.message : 'Failed to create booking'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTypeOptions: SelectOption[] = [
    { value: 'cargo', label: 'Cargo Transport' },
    { value: 'passenger', label: 'Passenger Service' },
    { value: 'public', label: 'Public Service' },
  ];

  // Common locations for quick selection
  const locationOptions: SelectOption[] = [
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Chennai', label: 'Chennai' },
    { value: 'Kolkata', label: 'Kolkata' },
    { value: 'Hyderabad', label: 'Hyderabad' },
    { value: 'Pune', label: 'Pune' },
    { value: 'Ahmedabad', label: 'Ahmedabad' },
    { value: 'Jaipur', label: 'Jaipur' },
    { value: 'Surat', label: 'Surat' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Create New Booking
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}

        {/* Current User Info */}
        {currentUser && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Booking for:
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              {currentUser.name || currentUser.username} (ID: {currentUser.id})
            </p>
          </div>
        )}

        {/* Booking Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Trip Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source Location *
              </label>
              <Input
                type="text"
                placeholder="Enter pickup location"
                defaultValue={formData.source}
                onChange={(e) => handleInputChange("source", e.target.value)}
                className="w-full"
              />
              <datalist id="source-locations">
                {locationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </datalist>
              {errors.source && (
                <p className="mt-1 text-xs text-red-500">{errors.source}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destination Location *
              </label>
              <Input
                type="text"
                placeholder="Enter destination location"
                defaultValue={formData.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                className="w-full"
              />
              <datalist id="destination-locations">
                {locationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </datalist>
              {errors.destination && (
                <p className="mt-1 text-xs text-red-500">{errors.destination}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Type *
              </label>
              <Select
                options={serviceTypeOptions}
                placeholder="Select service type"
                onChange={(value) => handleSelectChange("service_type", value)}
                value={formData.service_type}
              />
              {errors.service_type && (
                <p className="mt-1 text-xs text-red-500">{errors.service_type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price (₹) *
              </label>
              <Input
                type="number"
                min="0"
                step={0.01}
                placeholder="e.g., 15000"
                defaultValue={formData.price.toString()}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                className="w-full"
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">{errors.price}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the total service price
              </p>
            </div>
          </div>

          {/* Service Type Information */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Service Information
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formData.service_type === 'cargo' && (
                <p>🚛 <strong>Cargo Transport:</strong> Heavy goods and freight transportation with truck assignment</p>
              )}
              {formData.service_type === 'passenger' && (
                <p>👥 <strong>Passenger Service:</strong> People transportation with vehicle and driver assignment</p>
              )}
              {formData.service_type === 'public' && (
                <p>🚌 <strong>Public Service:</strong> Scheduled public transportation service</p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
            📋 Booking Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">Route:</span>
              <p className="text-blue-800 dark:text-blue-200">
                {formData.source || 'Not set'} → {formData.destination || 'Not set'}
              </p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">Service:</span>
              <p className="text-blue-800 dark:text-blue-200 capitalize">
                {formData.service_type} transport
              </p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">Price:</span>
              <p className="text-blue-800 dark:text-blue-200">
                ₹{formData.price.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">Status:</span>
              <p className="text-blue-800 dark:text-blue-200">
                Will be automatically assigned truck and driver
              </p>
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
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              '🚛 Create Booking'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}