'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import { fleetService } from '@/services/fleetService';
import { Truck } from '@/services/fleetService';
import { CheckCircleIcon, AlertIcon, LocationIcon } from '@/icons';

interface TruckLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  truck?: Truck | null;
  onLocationUpdated: () => void;
}

export default function TruckLocationModal({
  isOpen,
  onClose,
  truck,
  onLocationUpdated
}: TruckLocationModalProps) {
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    altitude: '',
    speed_kmh: '',
    heading_degrees: '',
    accuracy_meters: '',
    source: 'GPS'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && truck) {
      setLocationData({
        latitude: '',
        longitude: '',
        altitude: '',
        speed_kmh: '',
        heading_degrees: '',
        accuracy_meters: '',
        source: 'GPS'
      });
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, truck]);

  // Get current location from browser GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
          accuracy_meters: position.coords.accuracy?.toString() || '5',
          source: 'GPS'
        }));
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred while getting location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setLocationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!locationData.latitude || !locationData.longitude) {
      setError('Latitude and longitude are required.');
      return false;
    }

    const lat = parseFloat(locationData.latitude);
    const lng = parseFloat(locationData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90 degrees.');
      return false;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180 degrees.');
      return false;
    }

    if (locationData.speed_kmh && (parseFloat(locationData.speed_kmh) < 0 || parseFloat(locationData.speed_kmh) > 200)) {
      setError('Speed must be between 0 and 200 km/h.');
      return false;
    }

    if (locationData.heading_degrees && (parseFloat(locationData.heading_degrees) < 0 || parseFloat(locationData.heading_degrees) > 360)) {
      setError('Heading must be between 0 and 360 degrees.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!truck) {
      setError('No truck selected.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const locationPayload = {
        latitude: parseFloat(locationData.latitude),
        longitude: parseFloat(locationData.longitude),
        altitude: locationData.altitude ? parseFloat(locationData.altitude) : undefined,
        speed_kmh: locationData.speed_kmh ? parseFloat(locationData.speed_kmh) : undefined,
        heading_degrees: locationData.heading_degrees ? parseFloat(locationData.heading_degrees) : undefined,
        accuracy_meters: locationData.accuracy_meters ? parseFloat(locationData.accuracy_meters) : undefined,
        source: locationData.source
      };

      console.log('Updating truck location:', locationPayload);

      const result = await fleetService.updateTruckLocation(truck.id!, locationPayload);
      
      console.log('Location update result:', result);
      
      setSuccess('Truck location updated successfully!');
      
      // Notify parent component
      onLocationUpdated();
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update truck location';
      setError(errorMessage);
      console.error('Error updating truck location:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const sourceOptions = [
    { value: 'GPS', label: 'GPS' },
    { value: 'MANUAL', label: 'Manual Entry' },
    { value: 'MOBILE_APP', label: 'Mobile App' },
    { value: 'TRACKING_DEVICE', label: 'Tracking Device' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Update Truck Location
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Update location for truck {truck?.truck_number} ({truck?.number_plate})
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
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Latitude *
              </label>
              <Input
                type="number"
                step="any"
                placeholder="e.g., 28.6139"
                value={locationData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Longitude *
              </label>
              <Input
                type="number"
                step="any"
                placeholder="e.g., 77.2090"
                value={locationData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Altitude (m)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="e.g., 216"
                value={locationData.altitude}
                onChange={(e) => handleInputChange('altitude', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speed (km/h)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="e.g., 45"
                value={locationData.speed_kmh}
                onChange={(e) => handleInputChange('speed_kmh', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Heading (degrees)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="e.g., 90"
                value={locationData.heading_degrees}
                onChange={(e) => handleInputChange('heading_degrees', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Accuracy (meters)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="e.g., 5"
                value={locationData.accuracy_meters}
                onChange={(e) => handleInputChange('accuracy_meters', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source
              </label>
              <Select
                options={sourceOptions}
                value={locationData.source}
                onChange={(value) => handleInputChange('source', value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <LocationIcon className="h-4 w-4" />
              Get Current Location
            </Button>
          </div>

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
              type="submit"
              disabled={isLoading || !locationData.latitude || !locationData.longitude}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </div>
              ) : (
                'Update Location'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
