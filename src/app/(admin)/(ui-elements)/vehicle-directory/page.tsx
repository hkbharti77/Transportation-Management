"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import VehicleViewTable from "@/components/ui-elements/vehicle-management/VehicleViewTable";
import VehicleSearchFilter from "@/components/ui-elements/vehicle-management/VehicleSearchFilter";
import VehicleViewModal from "@/components/ui-elements/vehicle-management/VehicleViewModal";
import VehicleStatsSummary from "@/components/ecommerce/VehicleStatsSummary";
import Pagination from "@/components/tables/Pagination";
import { 
  Vehicle, 
  VehicleFilterOptions, 
  vehicleService 
} from "@/services/vehicleService";
import { AlertIcon, TruckIcon } from "@/icons";

export default function VehicleDirectoryPage() {
  const { user, isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Filter and pagination states
  const [filters, setFilters] = useState<VehicleFilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const itemsPerPage = 15;

  // Load vehicles data
  const loadVehicles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filterOptions: VehicleFilterOptions = {
        ...filters,
        page: currentPage,
        limit: itemsPerPage
      };
      
      const vehiclesData = await vehicleService.getVehicles(filterOptions);
      setVehicles(vehiclesData);
      
      // Estimate total count based on returned data
      // For pagination purposes - this is an approximation
      setTotalVehicles(vehiclesData.length >= itemsPerPage ? currentPage * itemsPerPage + 1 : (currentPage - 1) * itemsPerPage + vehiclesData.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vehicles';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      loadVehicles();
    }
  }, [loadVehicles, isAuthenticated]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: VehicleFilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Modal handlers
  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewModalOpen(true);
  };

  const handleModalClose = () => {
    setIsViewModalOpen(false);
    setSelectedVehicle(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalVehicles / itemsPerPage);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <ComponentCard title="Authentication Required">
          <div className="text-center py-12">
            <AlertIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please log in to view vehicle information.
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-title-md2 font-bold text-black dark:text-white">
                Vehicle Directory
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Browse and search the fleet vehicle catalog. View vehicle details, specifications, and current status.
            </p>
          </div>
        </div>

        {/* Vehicle Statistics Summary - Show for all authenticated users */}
        {user?.role === 'admin' && (
          <div className="mb-6">
            <VehicleStatsSummary userRole={user?.role} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <AlertIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6">
          <VehicleSearchFilter
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
            initialFilters={filters}
            readOnlyMode={true}
          />
        </div>

        {/* Vehicles Table */}
        <ComponentCard title="Fleet Vehicles">
          <div className="space-y-6">
            {/* Stats Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Showing: {vehicles.length} vehicles</span>
                <span>•</span>
                <span>Page {currentPage}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Displaying {(currentPage - 1) * itemsPerPage + 1} - {(currentPage - 1) * itemsPerPage + vehicles.length} records
              </div>
            </div>

            {/* Table */}
            <VehicleViewTable
              vehicles={vehicles}
              onView={handleViewVehicle}
              isLoading={isLoading}
              userRole={user?.role}
            />

            {/* Pagination */}
            {vehicles.length >= itemsPerPage && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </ComponentCard>

        {/* Vehicle View Modal */}
        <VehicleViewModal
          isOpen={isViewModalOpen}
          onClose={handleModalClose}
          vehicle={selectedVehicle}
        />
      </div>
    </div>
  );
}