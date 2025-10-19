"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { publicService, PublicService } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon } from "@/icons";

export default function UpdateServiceStatusPage() {
  const router = useRouter();
  const params = useParams();
  const [service, setService] = useState<PublicService | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'maintenance' | 'cancelled'>('active');

  const fetchService = useCallback(async () => {
    try {
      setLoading(true);
      const serviceData = await publicService.getPublicServiceById(parseInt(params.id as string));
      setService(serviceData);
      setNewStatus(serviceData.status as 'active' | 'inactive' | 'maintenance' | 'cancelled' || 'active');
    } catch (error: unknown) {
      console.error("Error fetching public service:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch public service");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchService();
    }
  }, [params.id, fetchService]);

  const handleStatusUpdate = async () => {
    if (!service) return;
    
    try {
      setUpdating(true);
      const updatedService = await publicService.updatePublicServiceStatus(service.service_id!, newStatus);
      setService(updatedService);
      toast.success(`Service status updated to ${newStatus} successfully!`);
      // Redirect back to service detail page after successful update
      setTimeout(() => {
        router.push(`/public-services/${service.service_id}`);
      }, 1500);
    } catch (error: unknown) {
      console.error("Error updating service status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update service status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.back()} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <div className="flex justify-center">
              <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading service details...
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (!service) {
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Service Not Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The requested public service could not be found.
            </p>
            <Button 
              onClick={() => router.push("/public-services")}
              className="flex items-center gap-2 mx-auto"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back to Services
            </Button>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <Button 
          onClick={() => router.push(`/public-services/${service.service_id}`)} 
          className="flex items-center gap-2"
          variant="outline"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Service
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Update Service Status
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Change the operational status for {service.route_name}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ComponentCard title="" className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
            Current Status
          </h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Service ID
              </h4>
              <p className="text-lg font-medium text-black dark:text-white">
                {service.service_id}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Route Name
              </h4>
              <p className="text-lg font-medium text-black dark:text-white">
                {service.route_name}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Current Status
              </h4>
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
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
            Update Status
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Select New Status
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
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === service.status}
                className="w-full flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
              
              <Button 
                onClick={() => router.push(`/public-services/${service.service_id}`)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}