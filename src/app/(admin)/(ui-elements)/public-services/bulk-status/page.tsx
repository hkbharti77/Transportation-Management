"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { publicService, PublicService } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon } from "@/icons";

export default function BulkUpdateServiceStatusPage() {
  const router = useRouter();
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Record<number, boolean>>({});
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'maintenance' | 'cancelled'>('active');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const servicesData = await publicService.getPublicServices();
      setServices(servicesData);
      
      // Initialize selected services record
      const initialSelected: Record<number, boolean> = {};
      servicesData.forEach(service => {
        initialSelected[service.service_id!] = false;
      });
      setSelectedServices(initialSelected);
    } catch (error: unknown) {
      console.error("Error fetching public services:", error);
      toast.error((error as Error).message || "Failed to fetch public services");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedServices).every(selected => selected);
    const newSelected: Record<number, boolean> = {};
    Object.keys(selectedServices).forEach(serviceId => {
      newSelected[parseInt(serviceId)] = !allSelected;
    });
    setSelectedServices(newSelected);
  };

  const handleSelectService = (serviceId: number) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const handleBulkStatusUpdate = async () => {
    const selectedServiceIds = Object.entries(selectedServices)
      .filter(([, selected]) => selected)
      .map(([serviceId]) => parseInt(serviceId));
      
    if (selectedServiceIds.length === 0) {
      toast.error("Please select at least one service to update");
      return;
    }
    
    try {
      setUpdating(true);
      // Update services one by one to handle errors individually
      const results = [];
      const errors = [];
      
      for (const serviceId of selectedServiceIds) {
        try {
          await publicService.updatePublicServiceStatus(serviceId, newStatus);
          results.push(serviceId);
        } catch (error: unknown) {
          console.error(`Error updating status for service ${serviceId}:`, error);
          errors.push({ serviceId, error: (error as Error).message || "Failed to update status" });
        }
      }
      
      // Show results
      if (results.length > 0) {
        toast.success(`Successfully updated status for ${results.length} service(s)!`);
      }
      
      if (errors.length > 0) {
        toast.error(`${errors.length} service(s) failed to update. Check console for details.`);
        // Optionally, you could show more detailed error information
      }
      
      // Refresh the services list
      fetchServices();
    } catch (error: unknown) {
      console.error("Error updating service statuses:", error);
      toast.error((error as Error).message || "Failed to update service statuses");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.push("/public-services")} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Services
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <div className="flex justify-center">
              <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading services...
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  const selectedCount = Object.values(selectedServices).filter(selected => selected).length;
  const allSelected = Object.values(selectedServices).every(selected => selected);

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Bulk Update Service Status
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push("/public-services")} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Services
          </Button>
          <Button 
            onClick={fetchServices}
            className="flex items-center gap-2"
          >
            Refresh
          </Button>
        </div>
      </div>

      <ComponentCard title="">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Select New Status for All Services
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as 'active' | 'inactive' | 'maintenance' | 'cancelled')}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleBulkStatusUpdate}
              disabled={updating || selectedCount === 0}
              className="w-full flex items-center justify-center gap-2"
            >
              {updating ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  Updating {selectedCount} Service(s)...
                </>
              ) : (
                `Update Status for ${selectedCount} Service(s)`
              )}
            </Button>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleSelectAll}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left dark:bg-gray-700">
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                  />
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Service
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Route Name
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Current Status
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Capacity
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Fare
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.service_id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedServices[service.service_id!] || false}
                      onChange={() => handleSelectService(service.service_id!)}
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-black dark:text-white">
                      #{service.service_id}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-black dark:text-white">
                      {service.route_name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      service.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : service.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        : service.status === 'cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-black dark:text-white">
                      {service.capacity} passengers
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-black dark:text-white">
                      ${service.fare}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {services.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              No Public Services Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by creating a new public transportation service.
            </p>
            <Button 
              onClick={() => router.push("/public-services/create")}
              className="flex items-center gap-2 mx-auto"
            >
              Create Your First Service
            </Button>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}