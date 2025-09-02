"use client";

import React, { useState } from "react";
import { TruckFilterOptions } from "@/services/fleetService";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { PlusIcon, FileIcon, CloseIcon } from "@/icons";

interface TruckSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Omit<TruckFilterOptions, 'page' | 'limit'>) => void;
  onReset: () => void;
  onCreateTruck: () => void;
  isLoading?: boolean;
}

export default function TruckSearchFilter({
  onSearch,
  onFilter,
  onReset,
  onCreateTruck,
  isLoading = false
}: TruckSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Omit<TruckFilterOptions, 'page' | 'limit'>>({
    truck_type: "",
    status: "",
    fuel_type: "",
    is_active: undefined
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (field: string, value: string | boolean | undefined) => {
    const newFilters = {
      ...filters,
      [field]: value
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilters({
      truck_type: "",
      status: "",
      fuel_type: "",
      is_active: undefined
    });
    onSearch("");
    onFilter({});
    onReset();
  };

  const truckTypeOptions = [
    { value: "", label: "All Types" },
    { value: "small_truck", label: "Small Truck" },
    { value: "medium_truck", label: "Medium Truck" },
    { value: "large_truck", label: "Large Truck" },
    { value: "container_truck", label: "Container Truck" }
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "available", label: "Available" },
    { value: "in_use", label: "In Use" },
    { value: "maintenance", label: "Maintenance" },
    { value: "out_of_service", label: "Out of Service" }
  ];

  const fuelTypeOptions = [
    { value: "", label: "All Fuel Types" },
    { value: "Diesel", label: "Diesel" },
    { value: "Petrol", label: "Petrol" },
    { value: "Electric", label: "Electric" },
    { value: "Hybrid", label: "Hybrid" }
  ];

  const activeOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" }
  ];

  return (
    <div className="bg-white dark:bg-boxdark rounded-sm border border-stroke dark:border-strokedark p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1">
                     <div className="relative">
             <FileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
             <Input
               type="text"
               placeholder="Search trucks by number, plate, manufacturer, model..."
               defaultValue={searchQuery}
               onChange={handleSearchChange}
               className="pl-10"
               disabled={isLoading}
             />
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
                     <Button
             variant="outline"
             onClick={() => setShowFilters(!showFilters)}
             disabled={isLoading}
             className="flex items-center gap-2"
           >
             <FileIcon className="h-4 w-4" />
             Filters
             {showFilters && <span className="text-xs">▼</span>}
             {!showFilters && <span className="text-xs">▶</span>}
           </Button>

           <Button
             variant="outline"
             onClick={handleReset}
             disabled={isLoading}
             className="flex items-center gap-2"
           >
             <CloseIcon className="h-4 w-4" />
             Reset
           </Button>

          <Button
            onClick={onCreateTruck}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            Add New Truck
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Truck Type
               </label>
               <Select
                 options={truckTypeOptions}
                 placeholder="All Types"
                 onChange={(value) => handleFilterChange("truck_type", value || undefined)}
                 defaultValue={filters.truck_type || ""}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Status
               </label>
               <Select
                 options={statusOptions}
                 placeholder="All Status"
                 onChange={(value) => handleFilterChange("status", value || undefined)}
                 defaultValue={filters.status || ""}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Fuel Type
               </label>
               <Select
                 options={fuelTypeOptions}
                 placeholder="All Fuel Types"
                 onChange={(value) => handleFilterChange("fuel_type", value || undefined)}
                 defaultValue={filters.fuel_type || ""}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Active Status
               </label>
               <Select
                 options={activeOptions}
                 placeholder="All"
                 onChange={(value) => {
                   handleFilterChange("is_active", value === "" ? undefined : value === "true");
                 }}
                 defaultValue={filters.is_active?.toString() || ""}
               />
             </div>
          </div>

          {/* Active Filters Display */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.truck_type && (
              <Badge variant="primary" className="flex items-center gap-1">
                Type: {truckTypeOptions.find(opt => opt.value === filters.truck_type)?.label}
                                 <button
                   onClick={() => handleFilterChange("truck_type", undefined)}
                   className="ml-1 hover:text-white"
                 >
                   <CloseIcon className="h-3 w-3" />
                 </button>
              </Badge>
            )}

            {filters.status && (
              <Badge variant="warning" className="flex items-center gap-1">
                Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
                                 <button
                   onClick={() => handleFilterChange("status", undefined)}
                   className="ml-1 hover:text-white"
                 >
                   <CloseIcon className="h-3 w-3" />
                 </button>
              </Badge>
            )}

            {filters.fuel_type && (
              <Badge variant="info" className="flex items-center gap-1">
                Fuel: {fuelTypeOptions.find(opt => opt.value === filters.fuel_type)?.label}
                                 <button
                   onClick={() => handleFilterChange("fuel_type", undefined)}
                   className="ml-1 hover:text-white"
                 >
                   <CloseIcon className="h-3 w-3" />
                 </button>
              </Badge>
            )}

            {filters.is_active !== undefined && (
              <Badge variant="success" className="flex items-center gap-1">
                Active: {filters.is_active ? "Yes" : "No"}
                                 <button
                   onClick={() => handleFilterChange("is_active", undefined)}
                   className="ml-1 hover:text-white"
                 >
                   <CloseIcon className="h-3 w-3" />
                 </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Badge component for active filters
function Badge({ 
  children, 
  variant = "primary", 
  className = "" 
}: { 
  children: React.ReactNode; 
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info"; 
  className?: string; 
}) {
  const variantClasses = {
    primary: "bg-primary text-white",
    secondary: "bg-gray-500 text-white",
    success: "bg-success text-white",
    warning: "bg-warning text-white",
    danger: "bg-danger text-white",
    info: "bg-info text-white"
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
