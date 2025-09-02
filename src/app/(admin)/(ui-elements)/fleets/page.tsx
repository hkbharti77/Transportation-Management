"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fleetService, Fleet } from "@/services/fleetService";
import { driverService, Driver } from "@/services/driverService";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Pagination from "@/components/tables/Pagination";

export default function FleetsPage() {
  const router = useRouter();
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFleet, setEditingFleet] = useState<Fleet | null>(null);
  const [viewingFleet, setViewingFleet] = useState<Fleet | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalFleets, setTotalFleets] = useState(0);
  const [filters, setFilters] = useState({
    is_active: undefined as boolean | undefined
  });

  // Driver pagination and filtering state
  const [currentDriverPage, setCurrentDriverPage] = useState(1);
  const [driverPageSize, setDriverPageSize] = useState(10);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [driverFilters, setDriverFilters] = useState({
    status: undefined as string | undefined,
    is_available: undefined as boolean | undefined
  });

  useEffect(() => {
    // Check if user is authenticated before fetching fleets
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/signin');
      return;
    }
    fetchFleets();
    fetchDrivers();
  }, [currentPage, pageSize, filters, currentDriverPage, driverPageSize, driverFilters]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    setCurrentDriverPage(1);
  }, [driverFilters]);

  const fetchFleets = async () => {
    try {
      setIsLoading(true);
      
      // Check authentication before making API call
      if (!fleetService.isAuthenticated()) {
        console.error('User not authenticated');
        router.push('/auth/signin');
        return;
      }
      
      const paginatedData = await fleetService.getFleetsWithPagination(
        currentPage, 
        pageSize, 
        filters
      );
      setFleets(paginatedData.data);
      setTotalFleets(paginatedData.total || paginatedData.data.length);
    } catch (error) {
      console.error('Failed to fetch fleets:', error);
      // If it's an authentication error, redirect to login
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        router.push('/auth/signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      setIsLoadingDrivers(true);
      
      if (!driverService.isAuthenticated()) {
        console.error('User not authenticated');
        router.push('/auth/signin');
        return;
      }
      
      const paginatedData = await driverService.getDriversWithPagination(
        currentDriverPage, 
        driverPageSize, 
        driverFilters
      );
      setDrivers(paginatedData.data);
      setTotalDrivers(paginatedData.total || paginatedData.data.length);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        router.push('/auth/signin');
      }
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  const handleCreateFleet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    try {
      await fleetService.createFleet(formData);
      setFormData({ name: "", description: "" });
      setShowCreateForm(false);
      fetchFleets();
    } catch (error) {
      console.error('Failed to create fleet:', error);
      alert('Failed to create fleet. Please try again.');
    }
  };

  const handleUpdateFleet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFleet || !formData.name.trim() || !formData.description.trim()) return;

    try {
      await fleetService.updateFleet(editingFleet.id!, formData);
      setFormData({ name: "", description: "" });
      setEditingFleet(null);
      fetchFleets();
    } catch (error) {
      console.error('Failed to update fleet:', error);
      alert('Failed to update fleet. Please try again.');
    }
  };

  const handleDeleteFleet = async (fleetId: number) => {
    if (!confirm('Are you sure you want to delete this fleet?')) return;

    try {
      await fleetService.deleteFleet(fleetId);
      fetchFleets();
    } catch (error) {
      console.error('Failed to delete fleet:', error);
      alert('Failed to delete fleet. Please try again.');
    }
  };

  const handleCreateDefaultFleet = async () => {
    if (!confirm('This will create a default fleet for the system. Continue?')) return;

    try {
      await fleetService.createDefaultFleet();
      alert('Default fleet created successfully!');
      fetchFleets();
    } catch (error) {
      console.error('Failed to create default fleet:', error);
      alert('Failed to create default fleet. Please try again.');
    }
  };

  const startEdit = (fleet: Fleet) => {
    setEditingFleet(fleet);
    setFormData({ name: fleet.name, description: fleet.description });
  };

  const cancelEdit = () => {
    setEditingFleet(null);
    setFormData({ name: "", description: "" });
  };

  const viewFleetDetails = async (fleet: Fleet) => {
    try {
      const fleetWithTrucks = await fleetService.getFleetWithTrucks(fleet.id!);
      setViewingFleet(fleetWithTrucks);
    } catch (error) {
      console.error('Failed to fetch fleet details:', error);
      alert('Failed to fetch fleet details. Please try again.');
    }
  };

  const closeFleetDetails = () => {
    setViewingFleet(null);
  };

  const debugAuth = () => {
    fleetService.debugAuthStatus();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Fleet Management
        </h2>
                 <div className="flex space-x-3">
        <Button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2"
           >
             Quick Create
           </Button>
           <Button
             onClick={handleCreateDefaultFleet}
             variant="outline"
             className="px-4 py-2"
           >
             Create Default Fleet
           </Button>
           <Button
             onClick={debugAuth}
             variant="outline"
             className="px-4 py-2 text-xs"
           >
             Debug Auth
           </Button>
         </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingFleet) && (
        <div className="mb-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            {editingFleet ? 'Edit Fleet' : 'Create New Fleet'}
          </h3>
          <form onSubmit={editingFleet ? handleUpdateFleet : handleCreateFleet} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fleet Name *
                </label>
                <Input
                  name="name"
                  type="text"
                  defaultValue={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter fleet name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <Input
                  name="description"
                  type="text"
                  defaultValue={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter fleet description"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={editingFleet ? cancelEdit : () => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingFleet ? 'Update Fleet' : 'Create Fleet'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Filters
        </h3>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.is_active === undefined ? "" : filters.is_active.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setFilters(prev => ({
                  ...prev,
                  is_active: value === "" ? undefined : value === "true"
                }));
              }}
              className="h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Page Size
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fleets List */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="px-6 py-4 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Available Fleets ({totalFleets})
          </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFleets}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500 mr-2"></div>
                  Loading...
                </div>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>
        
        {fleets.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No fleets available. Create your first fleet to get started.
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
                    Fleet Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Description
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
                    Created
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
                {fleets.map((fleet) => (
                    <TableRow key={fleet.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {fleet.name}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {fleet.description}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge
                          size="sm"
                          color={fleet.is_active ? "success" : "error"}
                        >
                        {fleet.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {fleet.created_at ? new Date(fleet.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                      <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewFleetDetails(fleet)}
                          >
                            View
                          </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(fleet)}
                        >
                          Edit
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
      </div>

      {/* Pagination */}
      {totalFleets > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalFleets)} of {totalFleets} fleets
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalFleets / pageSize)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Drivers Management Section */}
      <div className="mt-10 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="px-6 py-4 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Drivers Management ({totalDrivers})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDrivers}
              disabled={isLoadingDrivers}
            >
              {isLoadingDrivers ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500 mr-2"></div>
                  Loading...
                </div>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>

        {/* Driver Filters */}
        <div className="px-6 py-4 border-b border-stroke dark:border-strokedark">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={driverFilters.status === undefined ? "" : driverFilters.status}
                onChange={(e) => {
                  const value = e.target.value;
                  setDriverFilters(prev => ({
                    ...prev,
                    status: value === "" ? undefined : value
                  }));
                }}
                className="h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Availability
              </label>
              <select
                value={driverFilters.is_available === undefined ? "" : driverFilters.is_available.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setDriverFilters(prev => ({
                    ...prev,
                    is_available: value === "" ? undefined : value === "true"
                  }));
                }}
                className="h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">All</option>
                <option value="true">Available Only</option>
                <option value="false">Assigned Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Size
              </label>
              <select
                value={driverPageSize}
                onChange={(e) => setDriverPageSize(Number(e.target.value))}
                className="h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Drivers List */}
        {drivers.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No drivers available.
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
                      Employee ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      License Number
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      License Type
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
                      Availability
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Assigned Truck
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Shift
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {driver.employee_id}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {driver.license_number}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {driver.license_type}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge
                          size="sm"
                          color={
                            driver.status === 'active' ? 'success' :
                            driver.status === 'inactive' ? 'warning' : 'error'
                          }
                        >
                          {driver.status?.toUpperCase() || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge
                          size="sm"
                          color={driver.is_available ? "success" : "primary"}
                        >
                          {driver.is_available ? 'Available' : 'Assigned'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {driver.assigned_truck_id ? `Truck ${driver.assigned_truck_id}` : 'Not Assigned'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {driver.shift_start} - {driver.shift_end}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Driver Pagination */}
      {totalDrivers > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((currentDriverPage - 1) * driverPageSize) + 1} to {Math.min(currentDriverPage * driverPageSize, totalDrivers)} of {totalDrivers} drivers
          </div>
          
          <Pagination
            currentPage={currentDriverPage}
            totalPages={Math.ceil(totalDrivers / driverPageSize)}
            onPageChange={setCurrentDriverPage}
          />
        </div>
      )}

      {/* Fleet Details Modal */}
       {viewingFleet && (
         <Modal
           isOpen={!!viewingFleet}
        onClose={closeFleetDetails}
           className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
         >
           <div className="p-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                 Fleet Details: {viewingFleet.name}
               </h3>
             </div>
             
             <div className="space-y-6">
               {/* Fleet Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Fleet Name
                   </label>
                   <p className="text-sm text-gray-900 dark:text-white">{viewingFleet.name}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Status
                   </label>
                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                     viewingFleet.is_active 
                       ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                       : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                   }`}>
                     {viewingFleet.is_active ? 'Active' : 'Inactive'}
                   </span>
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Description
                   </label>
                   <p className="text-sm text-gray-900 dark:text-white">{viewingFleet.description}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Created At
                   </label>
                   <p className="text-sm text-gray-900 dark:text-white">
                     {viewingFleet.created_at ? new Date(viewingFleet.created_at).toLocaleString() : 'N/A'}
                   </p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Updated At
                   </label>
                   <p className="text-sm text-gray-900 dark:text-white">
                     {viewingFleet.updated_at ? new Date(viewingFleet.updated_at).toLocaleString() : 'Never'}
                   </p>
                 </div>
               </div>

               {/* Trucks Section */}
               <div>
                 <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                   Trucks ({viewingFleet.trucks?.length || 0})
                 </h4>
                 
                 {viewingFleet.trucks && viewingFleet.trucks.length > 0 ? (
                   <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                     <div className="max-w-full overflow-x-auto">
                       <Table>
                         <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                           <TableRow>
                             <TableCell
                               isHeader
                               className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                             >
                               Truck Number
                             </TableCell>
                             <TableCell
                               isHeader
                               className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                             >
                               Number Plate
                             </TableCell>
                             <TableCell
                               isHeader
                               className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                             >
                               Type
                             </TableCell>
                             <TableCell
                               isHeader
                               className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                             >
                               Status
                             </TableCell>
                           </TableRow>
                         </TableHeader>
                         <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                           {viewingFleet.trucks.map((truck) => (
                             <TableRow key={truck.id}>
                               <TableCell className="px-4 py-2 text-start">
                                 <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                   {truck.truck_number}
                                 </span>
                               </TableCell>
                               <TableCell className="px-4 py-2 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                 {truck.number_plate}
                               </TableCell>
                               <TableCell className="px-4 py-2 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                 {truck.truck_type?.replace('_', ' ').toUpperCase()}
                               </TableCell>
                               <TableCell className="px-4 py-2 text-start">
                                 <Badge
                                   size="sm"
                                   color={
                                     truck.status === 'available' ? 'success' :
                                     truck.status === 'in_use' ? 'primary' :
                                     truck.status === 'maintenance' ? 'warning' : 'error'
                                   }
                                 >
                                   {truck.status?.replace('_', ' ').toUpperCase() || 'Unknown'}
                                 </Badge>
                               </TableCell>
                             </TableRow>
                           ))}
                         </TableBody>
                       </Table>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                     No trucks assigned to this fleet.
                   </div>
                 )}
               </div>
             </div>
           </div>
         </Modal>
       )}
    </div>
  );
}
