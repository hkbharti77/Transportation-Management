'use client';

import React, { useState, useEffect } from 'react';
import { dispatchService, CreateDispatchRequest } from '@/services/dispatchService';
import { bookingService, Booking } from '@/services/bookingService';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';

interface DispatchFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  defaultBookingId?: number;
}

interface ValidationErrors {
  booking_id?: string;
  general?: string;
}

export default function DispatchForm({ onSuccess, onCancel, defaultBookingId }: DispatchFormProps) {
  // Form state
  const [formData, setFormData] = useState<CreateDispatchRequest>({
    booking_id: defaultBookingId || 0,
  });

  // UI states
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);

  // Load booking details when booking_id changes
  useEffect(() => {
    if (formData.booking_id > 0) {
      loadBookingDetails(formData.booking_id);
    } else {
      setBooking(null);
    }
  }, [formData.booking_id]);

  const loadBookingDetails = async (bookingId: number) => {
    try {
      setLoadingBooking(true);
      const bookingData = await bookingService.getBookingById(bookingId);
      setBooking(bookingData);
    } catch (error) {
      console.error('Failed to load booking details:', error);
      setBooking(null);
    } finally {
      setLoadingBooking(false);
    }
  };

  const handleInputChange = (field: keyof CreateDispatchRequest, value: string | number) => {
    const numericValue = field === 'booking_id' ? (typeof value === 'string' ? parseInt(value) || 0 : value) : value;
    
    setFormData(prev => {
      if (field === 'booking_id') {
        return {
          ...prev,
          booking_id: typeof numericValue === 'number' ? numericValue : 0
        };
      }
      return prev;
    });

    // Clear validation error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Booking ID validation
    if (!formData.booking_id || formData.booking_id <= 0) {
      newErrors.booking_id = 'Booking ID is required and must be greater than 0';
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
      await dispatchService.createDispatch(formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create dispatch:', error);
      setErrors({
        ...errors,
        general: error instanceof Error ? error.message : 'Failed to create dispatch'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'cargo':
        return '🚛';
      case 'passenger':
        return '👥';
      case 'public':
        return '🚌';
      default:
        return '🚐';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Create New Dispatch
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Information Panel */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Automatic Dispatch Processing
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  The system will automatically check if the booking exists, assign a driver if the booking has a truck,
                  and set the initial dispatch status to "pending".
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking ID Input */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dispatch Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Booking ID *
            </label>
            <Input
              type="number"
              placeholder="Enter booking ID"
              defaultValue={formData.booking_id || ''}
              onChange={(e) => handleInputChange("booking_id", parseInt(e.target.value) || 0)}
              className="w-full"
              min="1"
            />
            {errors.booking_id && (
              <p className="mt-1 text-xs text-red-500">{errors.booking_id}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter the ID of the booking you want to create a dispatch for
            </p>
          </div>
        </div>

        {/* Booking Details Display */}
        {formData.booking_id > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Booking Information
            </h4>
            
            {loadingBooking ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm text-gray-500">Loading booking details...</span>
              </div>
            ) : booking ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Route:</span>
                    <p className="text-gray-900 dark:text-white">
                      {getServiceTypeIcon(booking.service_type)} {booking.source} → {booking.destination}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Price:</span>
                    <p className="text-gray-900 dark:text-white">₹{booking.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Service Type:</span>
                    <p className="text-gray-900 dark:text-white capitalize">{booking.service_type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.booking_status)}`}>
                      {booking.booking_status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">User ID:</span>
                    <p className="text-gray-900 dark:text-white">{booking.user_id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Truck ID:</span>
                    <p className="text-gray-900 dark:text-white">{booking.truck_id}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created: {new Date(booking.created_at).toLocaleString()}</span>
                    <span>Updated: {new Date(booking.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Booking not found or invalid booking ID</span>
                </div>
              </div>
            )}
          </div>
        )}

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
            disabled={isSubmitting || !booking}
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
              '🚚 Create Dispatch'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}