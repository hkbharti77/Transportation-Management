'use client';

import React, { useState, useEffect } from 'react';
import { TripFilterOptions } from '@/services/tripService';
import { vehicleService } from '@/services/vehicleService';
import { driverService } from '@/services/driverService';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
// Removed unused CloseIcon import

interface TripSearchFilterProps {
  filters: TripFilterOptions;
  onFiltersChange: (filters: TripFilterOptions) => void;
  onSearch: (filters?: TripFilterOptions) => void;
  onReset: () => void;
  loading?: boolean;
  hideStatusFilter?: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

export default function TripSearchFilter({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  loading = false,
  hideStatusFilter = false
}: TripSearchFilterProps) {
  
  const [localFilters, setLocalFilters] = useState<TripFilterOptions>(filters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Options for dropdowns
  const [vehicleOptions, setVehicleOptions] = useState<SelectOption[]>([]);
  const [driverOptions, setDriverOptions] = useState<SelectOption[]>([]);

  // Load vehicles and drivers for filter options
  useEffect(() => {
    const loadFilterData = async () => {
      setIsLoadingData(true);
      try {
        // Load vehicles
        const vehicles = await vehicleService.getVehicles();
        const vehicleOpts = vehicles.map(vehicle => ({
          value: vehicle.id!.toString(),
          label: `${vehicle.license_plate} - ${vehicle.type} (${vehicle.model})`
        }));
        setVehicleOptions(vehicleOpts);

        // Load drivers
        const drivers = await driverService.getDrivers();
        const driverOpts = drivers.map(driver => ({
          value: driver.id!.toString(),
          label: `${driver.employee_id} - ${driver.license_type} License`
        }));
        setDriverOptions(driverOpts);

      } catch (error) {
        console.error('Failed to load filter data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadFilterData();
  }, []);

  // Sync local filters with parent filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field: keyof TripFilterOptions, value: string | number | undefined) => {
    const updatedFilters = {
      ...localFilters,
      [field]: value || undefined
    };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleSearch = () => {
    onSearch(localFilters);
  };

  const handleReset = () => {
    const resetFilters: TripFilterOptions = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
    setShowAdvancedFilters(false);
  };

  const statusOptions: SelectOption[] = [
    { value: '', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const routeOptions: SelectOption[] = [
    { value: '', label: 'All Routes' },
    { value: '1', label: 'Route 1 - Mumbai to Pune' },
    { value: '2', label: 'Route 2 - Delhi to Gurgaon' },
    { value: '3', label: 'Route 3 - Chennai to Bangalore' },
    { value: '4', label: 'Route 4 - Kolkata to Howrah' },
    { value: '5', label: 'Route 5 - Hyderabad to Secunderabad' },
  ];

  const vehicleOptionsWithAll = [
    { value: '', label: 'All Vehicles' },
    ...vehicleOptions
  ];

  const driverOptionsWithAll = [
    { value: '', label: 'All Drivers' },
    ...driverOptions
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-lg">
      {/* Basic Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Search trips..."
            defaultValue={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-12 w-full h-12 text-base border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
          />
        </div>

        {/* Status Filter */}
        {!hideStatusFilter && (
          <div className="min-w-[180px]">
            <Select
              options={statusOptions}
              placeholder="Select Status"
              onChange={(value) => handleFilterChange('status', value)}
              defaultValue={localFilters.status || ''}
              className="h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        )}

        {/* Route Filter */}
        <div className="min-w-[220px]">
          <Select
            options={routeOptions}
            placeholder="Select Route"
            onChange={(value) => handleFilterChange('route_id', value ? parseInt(value) : undefined)}
            defaultValue={localFilters.route_id?.toString() || ''}
            className="h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 font-bold border-2 border-blue-600 hover:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </Button>

          <Button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-8 py-4 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-600 dark:hover:border-gray-300 hover:scale-105 rounded-lg flex items-center gap-2 font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            <span>{showAdvancedFilters ? 'Less Filters' : 'More Filters'}</span>
            {showAdvancedFilters && (
              <span className="inline-flex items-center justify-center w-2 h-2 bg-blue-600 rounded-full ml-1"></span>
            )}
          </Button>

          <Button
            onClick={handleReset}
            className="px-8 py-4 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800/40 hover:border-red-500 dark:hover:border-red-500 hover:scale-105 rounded-lg flex items-center gap-2 font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Advanced Filters</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Use these filters to narrow down your search results</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Vehicle Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Vehicle
              </label>
              <Select
                options={vehicleOptionsWithAll}
                placeholder={isLoadingData ? "Loading..." : "Select vehicle"}
                onChange={(value) => handleFilterChange('vehicle_id', value ? parseInt(value) : undefined)}
                defaultValue={localFilters.vehicle_id?.toString() || ''}
                disabled={isLoadingData}
                className="h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>

            {/* Driver Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Driver
              </label>
              <Select
                options={driverOptionsWithAll}
                placeholder={isLoadingData ? "Loading..." : "Select driver"}
                onChange={(value) => handleFilterChange('driver_id', value ? parseInt(value) : undefined)}
                defaultValue={localFilters.driver_id?.toString() || ''}
                disabled={isLoadingData}
                className="h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Date From
              </label>
              <Input
                type="date"
                defaultValue={localFilters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full h-12 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Date To
              </label>
              <Input
                type="date"
                defaultValue={localFilters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full h-12 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
              />
            </div>
          </div>

          {/* Advanced Search Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              💡 Advanced filters are applied automatically
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 font-semibold border border-blue-600 shadow-sm transition-all duration-200"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {(localFilters.search || localFilters.status || localFilters.route_id || localFilters.vehicle_id || localFilters.driver_id || localFilters.date_from || localFilters.date_to) && (
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Active filters:
          </span>
          
          {localFilters.search && (
            <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
              🔍 Search: &quot;{localFilters.search}&quot;
            </span>
          )}
          
          {localFilters.status && (
            <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200 dark:border-green-800">
              🟢 Status: {localFilters.status}
            </span>
          )}
          
          {localFilters.route_id && (
            <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
              🗯️ Route: {localFilters.route_id}
            </span>
          )}

          {localFilters.vehicle_id && (
            <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
              🚚 Vehicle: {localFilters.vehicle_id}
            </span>
          )}

          {localFilters.driver_id && (
            <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
              👨‍✈️ Driver: {localFilters.driver_id}
            </span>
          )}

          {(localFilters.date_from || localFilters.date_to) && (
            <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
              📅 Date: {localFilters.date_from || '...'} to {localFilters.date_to || '...'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}