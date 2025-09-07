"use client";

import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { VehicleFilterOptions } from "@/services/vehicleService";
import { SearchIcon, FilterIcon, ClearIcon } from "@/icons";

interface VehicleSearchFilterProps {
  onFiltersChange: (filters: VehicleFilterOptions) => void;
  isLoading?: boolean;
  initialFilters?: VehicleFilterOptions;
  readOnlyMode?: boolean;
}

export default function VehicleSearchFilter({
  onFiltersChange,
  isLoading = false,
  initialFilters = {},
  readOnlyMode = false
}: VehicleSearchFilterProps) {
  const [filters, setFilters] = useState<VehicleFilterOptions>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Apply filters when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(filters);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof VehicleFilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    const clearedFilters: VehicleFilterOptions = {};
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ""
  );

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "truck", label: "Truck" },
    { value: "bus", label: "Bus" },
    { value: "van", label: "Van" },
    { value: "pickup", label: "Pickup" },
    { value: "motorcycle", label: "Motorcycle" }
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Under Maintenance" },
    { value: "out_of_service", label: "Out of Service" }
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: "", label: "All Years" },
    ...Array.from({ length: currentYear - 1990 + 1 }, (_, i) => {
      const year = currentYear - i;
      return { value: year.toString(), label: year.toString() };
    })
  ];

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by license plate, model, or vehicle ID..."
            defaultValue={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="!px-3 !py-2 gap-2"
          disabled={isLoading}
        >
          <FilterIcon className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-2 h-2 bg-blue-600 rounded-full"></span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="!px-3 !py-2 gap-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            disabled={isLoading}
          >
            <ClearIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Clear</span>
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Vehicle Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Type
            </label>
            <Select
              options={typeOptions}
              value={filters.type || ""}
              onChange={(value) => handleFilterChange("type", value)}
              disabled={isLoading}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              options={statusOptions}
              value={filters.status || ""}
              onChange={(value) => handleFilterChange("status", value)}
              disabled={isLoading}
            />
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year
            </label>
            <Select
              options={yearOptions}
              value={filters.year?.toString() || ""}
              onChange={(value) => handleFilterChange("year", value ? parseInt(value) : undefined)}
              disabled={isLoading}
            />
          </div>

          {/* Driver Assignment Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Driver Assignment
            </label>
            <Select
              options={[
                { value: "", label: "All Vehicles" },
                { value: "assigned", label: "With Driver" },
                { value: "unassigned", label: "Without Driver" }
              ]}
              value={
                filters.assigned_driver_id === null ? "unassigned" :
                filters.assigned_driver_id !== undefined ? "assigned" : ""
              }
              onChange={(value) => {
                if (value === "assigned") {
                  handleFilterChange("assigned_driver_id", 1); // Any driver ID indicates assigned
                } else if (value === "unassigned") {
                  handleFilterChange("assigned_driver_id", null);
                } else {
                  handleFilterChange("assigned_driver_id", undefined);
                }
              }}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              Search: "{filters.search}"
            </span>
          )}
          
          {filters.type && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
              Type: {filters.type}
            </span>
          )}
          
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
              Status: {filters.status}
            </span>
          )}
          
          {filters.year && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
              Year: {filters.year}
            </span>
          )}
          
          {filters.assigned_driver_id === null && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
              Unassigned
            </span>
          )}
          
          {filters.assigned_driver_id && filters.assigned_driver_id > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
              With Driver
            </span>
          )}
        </div>
      )}
    </div>
  );
}