"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import VehicleTable from "@/components/ui-elements/vehicle-management/VehicleTable";
import VehicleModal from "@/components/ui-elements/vehicle-management/VehicleModal";
import VehicleSearchFilter from "@/components/ui-elements/vehicle-management/VehicleSearchFilter";
import DriverAssignmentModal from "@/components/ui-elements/vehicle-management/DriverAssignmentModal";
import UnassignDriverModal from "@/components/ui-elements/vehicle-management/UnassignDriverModal";
import Pagination from "@/components/tables/Pagination";
import { 
  Vehicle, 
  VehicleFilterOptions, 
  vehicleService,
  UpdateVehicleStatusResponse,
  AssignDriverResponse,
  UnassignDriverResponse
} from "@/services/vehicleService";
import { PlusIcon, AlertIcon, CheckCircleIcon } from "@/icons";

export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Driver assignment modal states
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [vehicleForDriverAssignment, setVehicleForDriverAssignment] = useState<Vehicle | null>(null);
  
  // Driver unassignment modal states
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
  const [vehicleForDriverUnassignment, setVehicleForDriverUnassignment] = useState<Vehicle | null>(null);
  
  // Filter and pagination states
  const [filters, setFilters] = useState<VehicleFilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const itemsPerPage = 10;

  // Check user permissions
  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';
  const hasReadAccess = isAdmin || isDriver;

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
      
      // Get total count for pagination
      const count = await vehicleService.getVehiclesCount(filters);
      setTotalVehicles(count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vehicles';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    if (hasReadAccess) {
      loadVehicles();
    }
  }, [loadVehicles, hasReadAccess]);

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
  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAssignDriver = (vehicle: Vehicle) => {
    setVehicleForDriverAssignment(vehicle);
    setIsDriverModalOpen(true);
  };

  const handleDriverAssigned = async (vehicle: Vehicle, driverId: number) => {
    try {
      const response: AssignDriverResponse = await vehicleService.assignDriverToVehicle(vehicle.id!, driverId);
      
      // Show success message with details from API response
      setSuccess(response.message || `Driver #${driverId} assigned to vehicle ${vehicle.license_plate}`);
      
      // Reload vehicles to get updated data
      loadVehicles();
      
      // Clear success message after delay
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign driver';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUnassignDriver = (vehicle: Vehicle) => {
    setVehicleForDriverUnassignment(vehicle);
    setIsUnassignModalOpen(true);
  };

  const handleDriverUnassigned = async (vehicleId: number) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const licensePlate = vehicle?.license_plate || `Vehicle #${vehicleId}`;
      
      const response: UnassignDriverResponse = await vehicleService.unassignDriverFromVehicle(vehicleId);
      
      // Show success message with details from API response
      setSuccess(response.message || `Driver unassigned from vehicle ${licensePlate} successfully`);
      
      // Reload vehicles to get updated data
      loadVehicles();
      
      // Clear success message after delay
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unassign driver';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUnassignModalClose = () => {
    setIsUnassignModalOpen(false);
    setVehicleForDriverUnassignment(null);
  };

  const handleDriverModalClose = () => {
    setIsDriverModalOpen(false);
    setVehicleForDriverAssignment(null);
  };

  const handleVehicleStatusChange = async (vehicleId: number, newStatus: Vehicle['status']) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const licensePlate = vehicle?.license_plate || `Vehicle #${vehicleId}`;
      
      const response: UpdateVehicleStatusResponse = await vehicleService.updateVehicleStatus(vehicleId, newStatus);
      
      // Show success message with details from API response
      setSuccess(response.message || `Vehicle ${licensePlate} status updated to ${newStatus}`);
      
      // Reload vehicles to get updated data
      loadVehicles();
      
      // Clear success message after delay
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vehicle status';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    // Find the vehicle to show license plate in confirmation
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const licensePlate = vehicle?.license_plate || `Vehicle #${vehicleId}`;
    
    if (!confirm(`Are you sure you want to retire ${licensePlate}? This will remove it from active fleet operations.`)) {
      return;
    }

    try {
      const response = await vehicleService.deleteVehicle(vehicleId);
      // Show the exact message from the API response
      setSuccess(response.message || 'Vehicle retired successfully!');
      loadVehicles(); // Reload the list
      
      // Clear success message after delay
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retire vehicle';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleVehicleUpdated = () => {
    loadVehicles(); // Reload the list to get updated data
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalVehicles / itemsPerPage);

  // Redirect if no access
  if (!hasReadAccess) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <ComponentCard title="Access Denied">
          <div className="text-center py-12">
            <AlertIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              You don&apos;t have permission to access vehicle information.
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
            <h2 className="text-title-md2 font-bold text-black dark:text-white">
              {isAdmin ? "Vehicles Management" : "Vehicle Directory"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isAdmin 
                ? "Manage your fleet vehicles, assign drivers, and track vehicle status."
                : "Browse and search the fleet vehicle catalog. View vehicle details and specifications."
              }
            </p>
          </div>
          {isAdmin && (
            <Button 
              onClick={handleAddVehicle}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add New Vehicle
            </Button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
            <span className="text-green-800 dark:text-green-200">{success}</span>
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
          />
        </div>

        {/* Vehicles Table */}
        <ComponentCard title={isAdmin ? "Vehicles" : "Fleet Vehicles"}>
          <div className="space-y-6">
            {/* Stats Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Total Vehicles: {totalVehicles}</span>
                <span>•</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalVehicles)} - {Math.min(currentPage * itemsPerPage, totalVehicles)} of {totalVehicles}
              </div>
            </div>

            {/* Table */}
            <VehicleTable
              vehicles={vehicles}
              onEdit={isAdmin ? handleEditVehicle : undefined}
              onDelete={isAdmin ? handleDeleteVehicle : undefined}
              onView={handleViewVehicle}
              onAssignDriver={isAdmin ? handleAssignDriver : undefined}
              onUnassignDriver={isAdmin ? handleUnassignDriver : undefined}
              onStatusChange={isAdmin ? handleVehicleStatusChange : undefined}
              isLoading={isLoading}
              userRole={user?.role}
              readOnlyMode={!isAdmin}
            />

            {/* Pagination */}
            {totalPages > 1 && (
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

        {/* Vehicle Modal */}
        <VehicleModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onVehicleUpdated={handleVehicleUpdated}
          vehicle={selectedVehicle}
          mode={modalMode}
        />

        {/* Driver Assignment Modal */}
        <DriverAssignmentModal
          isOpen={isDriverModalOpen}
          onClose={handleDriverModalClose}
          vehicle={vehicleForDriverAssignment}
          onDriverAssigned={handleDriverAssigned}
        />

        {/* Driver Unassignment Modal */}
        <UnassignDriverModal
          isOpen={isUnassignModalOpen}
          onClose={handleUnassignModalClose}
          vehicle={vehicleForDriverUnassignment}
          onDriverUnassigned={handleDriverUnassigned}
        />
      </div>
    </div>
  );
}
