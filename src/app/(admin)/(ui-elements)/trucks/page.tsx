"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fleetService, Truck, TruckFilterOptions } from "@/services/fleetService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import TruckSearchFilter from "@/components/ui-elements/fleet-management/TruckSearchFilter";
import Pagination from "@/components/tables/Pagination";
import ComponentCard from "@/components/common/ComponentCard";


interface FilterOptions {
  truck_type: string;
  status: string;
  fuel_type: string;
  is_active?: boolean;
}

export default function TrucksPage() {
  const router = useRouter();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [filteredTrucks, setFilteredTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    truck_type: "",
    status: "",
    fuel_type: "",
    is_active: undefined
  });
  const [apiError, setApiError] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);
  const [pagination] = useState({
    limit: 10
  });

  // Check authentication on component mount
  useEffect(() => {
    if (!fleetService.isAuthenticated()) {
      router.push('/signin');
      return;
    }

    // Check if user is admin
    if (!fleetService.isCurrentUserAdmin()) {
      // Redirect based on user role
      const currentUserStr = localStorage.getItem('current_user');
      if (currentUserStr) {
        try {
          const currentUser = JSON.parse(currentUserStr);
          if (currentUser?.role === 'customer') {
            router.push('/dashboard');
          } else if (currentUser?.role === 'public_service_manager') {
            router.push('/transporter-dashboard');
          } else {
            router.push('/users');
          }
        } catch {
          router.push('/signin');
        }
      } else {
        router.push('/signin');
      }
      return;
    }
  }, [router]);

  useEffect(() => {
    // Fetch trucks from API
    const fetchTrucks = async () => {
      setIsLoading(true);
      try {
        const response = await fleetService.getTrucks({
          ...filters
        });
        
        setTrucks(response);
        setFilteredTrucks(response);
        setTotalPages(Math.ceil(response.length / pagination.limit));
        setApiError(false);
        setApiSuccess(true);
      } catch (error) {
        console.error("Failed to fetch trucks:", error);
        // Fallback to empty array if API fails
        setTrucks([]);
        setFilteredTrucks([]);
        setTotalPages(1);
        setApiError(true);
        console.log("API not available, using empty data. Please ensure your backend is running on http://localhost:8000");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrucks();
  }, [currentPage, pagination.limit, filters]);

  // Filter trucks based on search and filters
  useEffect(() => {
    let filtered = trucks;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(truck =>
        truck.truck_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        truck.number_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        truck.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        truck.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply truck type filter
    if (filters.truck_type) {
      filtered = filtered.filter(truck => truck.truck_type === filters.truck_type);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(truck => truck.status === filters.status);
    }

    // Apply fuel type filter
    if (filters.fuel_type) {
      filtered = filtered.filter(truck => truck.fuel_type === filters.fuel_type);
    }

    // Apply active status filter
    if (filters.is_active !== undefined) {
      filtered = filtered.filter(truck => truck.is_active === filters.is_active);
    }

    setFilteredTrucks(filtered);
    setTotalPages(Math.ceil(filtered.length / pagination.limit));
    setCurrentPage(1); // Reset to first page when filters change
  }, [trucks, searchQuery, filters, pagination.limit]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: Omit<TruckFilterOptions, 'page' | 'limit'>) => {
    setFilters(newFilters as FilterOptions);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilters({
      truck_type: "",
      status: "",
      fuel_type: "",
      is_active: undefined
    });
  };

  const handleCreateTruck = () => {
    router.push('/trucks/create');
  };

  const handleViewTruck = (truck: Truck) => {
    router.push(`/trucks/${truck.id}`);
  };

  const handleEditTruck = (truck: Truck) => {
    router.push(`/trucks/${truck.id}/edit`);
  };

  const handleDeleteTruck = async (truckId: number) => {
    if (!confirm("Are you sure you want to delete this truck?")) {
      return;
    }

    try {
      await fleetService.deleteTruck(truckId);
      alert("Truck deleted successfully!");
      // Refresh the trucks list
      const updatedTrucks = trucks.filter(truck => truck.id !== truckId);
      setTrucks(updatedTrucks);
    } catch (error) {
      console.error("Failed to delete truck:", error);
      alert("Failed to delete truck. Please try again.");
    }
  };



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Fleet Management - Trucks
          </h2>
          <div className="flex items-center space-x-3">
            {apiError && (
              <div className="text-sm text-red-500 bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded">
                API Connection Error
              </div>
            )}
            {apiSuccess && (
              <div className="text-sm text-green-500 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded">
                API Connected
              </div>
            )}
          </div>
        </div>

        <ComponentCard title="Truck Management">
          <TruckSearchFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            onReset={handleReset}
            onCreateTruck={handleCreateTruck}
            isLoading={isLoading}
          />

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTrucks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No trucks found</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Truck Number
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Number Plate
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Type
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Capacity
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Status
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Driver
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {filteredTrucks.map((truck) => (
                      <TableRow key={truck.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {truck.truck_number}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {truck.number_plate}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <Badge
                            size="sm"
                            color={
                              truck.truck_type === 'small_truck' ? 'primary' :
                              truck.truck_type === 'medium_truck' ? 'info' :
                              truck.truck_type === 'large_truck' ? 'warning' : 'error'
                            }
                          >
                            {truck.truck_type?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {truck.capacity_kg.toLocaleString()} kg
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <Badge
                            size="sm"
                            color={
                              truck.status === 'available' ? 'success' :
                              truck.status === 'in_use' ? 'warning' :
                              truck.status === 'maintenance' ? 'error' : 'warning'
                            }
                          >
                            {truck.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {truck.assigned_driver_id ? (
                            <Badge color="success">Assigned</Badge>
                          ) : (
                            <Badge color="warning">Unassigned</Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewTruck(truck)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTruck(truck)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTruck(truck.id!)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {filteredTrucks.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
