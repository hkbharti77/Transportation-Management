'use client';

import React, { useState, useEffect } from 'react';
import { dispatchService, AvailableDriver } from '@/services/dispatchService';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

interface AvailableDriversProps {
  onDriverSelect?: (driver: AvailableDriver) => void;
  onRefresh?: () => void;
  refreshTrigger?: number;
  selectedDriverId?: number | null;
}

export default function AvailableDrivers({ 
  onDriverSelect, 
  onRefresh,
  refreshTrigger = 0,
  selectedDriverId = null
}: AvailableDriversProps) {
  const [drivers, setDrivers] = useState<AvailableDriver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('AvailableDrivers - Loading available drivers');
      const data = await dispatchService.getAvailableDrivers();
      console.log('AvailableDrivers - Loaded drivers:', data.length);
      setDrivers(data);
    } catch (err) {
      console.error('Failed to load available drivers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load available drivers');
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableDrivers();
  }, [refreshTrigger]);

  const getDriverStatusColor = (status: string): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'busy':
        return 'warning';
      default:
        return 'light';
    }
  };

  const getAvailabilityColor = (isAvailable: boolean): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
    return isAvailable ? 'success' : 'error';
  };

  const formatShiftTime = (time: string) => {
    if (!time) return 'Not set';
    // Convert from 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatLicenseExpiry = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading available drivers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading available drivers</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-3">
          <Button
            onClick={loadAvailableDrivers}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">👤</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No available drivers</h3>
        <p className="text-gray-500 dark:text-gray-400">
          All drivers are currently assigned or unavailable. Check back later.
        </p>
        <Button
          onClick={loadAvailableDrivers}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
        >
          Refresh List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              {drivers.length} Available Driver{drivers.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Drivers ready for dispatch assignment
            </p>
          </div>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
              selectedDriverId === driver.id 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            {/* Driver Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {driver.employee_id}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Driver ID: {driver.id}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge size="sm" color={getDriverStatusColor(driver.status)}>
                  {driver.status}
                </Badge>
                <Badge size="sm" color={getAvailabilityColor(driver.is_available)}>
                  {driver.is_available ? 'Available' : 'Busy'}
                </Badge>
              </div>
            </div>

            {/* Driver Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">License:</span>
                <span className="text-gray-900 dark:text-white">{driver.license_number}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="text-gray-900 dark:text-white">{driver.license_type}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                <span className="text-gray-900 dark:text-white">{driver.experience_years} years</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shift:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatShiftTime(driver.shift_start)} - {formatShiftTime(driver.shift_end)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                <span className="text-gray-900 dark:text-white">
                  {driver.rating > 0 ? `⭐ ${driver.rating}/5` : 'No rating'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Trips:</span>
                <span className="text-gray-900 dark:text-white">{driver.total_trips}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-4">
              <Button
                onClick={() => onDriverSelect?.(driver)}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedDriverId === driver.id
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}
              >
                {selectedDriverId === driver.id ? '✓ Selected' : 'Select Driver'}
              </Button>
            </div>

            {/* Additional Info (Collapsible) */}
            <details className="mt-3">
              <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                More details
              </summary>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Blood Group:</span>
                  <span className="text-gray-900 dark:text-white">{driver.blood_group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">License Expiry:</span>
                  <span className="text-gray-900 dark:text-white">{formatLicenseExpiry(driver.license_expiry)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Emergency:</span>
                  <span className="text-gray-900 dark:text-white">{driver.phone_emergency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Address:</span>
                  <span className="text-gray-900 dark:text-white text-right ml-2">{driver.address}</span>
                </div>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}