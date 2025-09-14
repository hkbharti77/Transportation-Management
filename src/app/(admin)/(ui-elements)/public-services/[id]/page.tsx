"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { publicService, PublicService } from "@/services/publicService";
import toast from "react-hot-toast";
import { 
  ChevronLeftIcon, 
  PencilIcon, 
  PlusIcon, 
  TrashBinIcon,
  PieChartIcon
} from "@/icons";

export default function PublicServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [service, setService] = useState<PublicService | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchService = useCallback(async () => {
    try {
      setLoading(true);
      const serviceData = await publicService.getPublicServiceById(parseInt(params.id as string));
      setService(serviceData);
    } catch (error) {
      console.error("Error fetching public service:", error);
      toast.error((error as Error).message || "Failed to fetch public service");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchService();
    }
  }, [params.id, fetchService]);

  const handleDelete = async () => {
    if (!service) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this public service?");
    if (!confirmed) return;
    
    try {
      setDeleting(true);
      await publicService.deletePublicService(service.service_id!);
      toast.success("Public service deleted successfully!");
      router.push("/public-services");
    } catch (error) {
      console.error("Error deleting public service:", error);
      toast.error((error as Error).message || "Failed to delete public service");
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async () => {
    if (!service) return;
    
    try {
      // Cycle through statuses: active -> inactive -> maintenance -> cancelled -> active
      let newStatus: 'active' | 'inactive' | 'maintenance' | 'cancelled' = 'active';
      
      if (service.status === 'active') {
        newStatus = 'inactive';
      } else if (service.status === 'inactive') {
        newStatus = 'maintenance';
      } else if (service.status === 'maintenance') {
        newStatus = 'cancelled';
      } else {
        newStatus = 'active';
      }
      
      const updatedService = await publicService.updatePublicServiceStatus(service.service_id!, newStatus);
      setService(updatedService);
      toast.success(`Service status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating service status:", error);
      toast.error((error as Error).message || "Failed to update service status");
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button 
          onClick={() => router.push("/public-services")} 
          className="flex items-center gap-2"
          variant="outline"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Services
        </Button>
        
        <div className="flex gap-2">
          <Button 
            onClick={toggleStatus}
            variant={service.status === 'active' ? 'outline' : undefined}
            className="flex items-center gap-2"
          >
            {service.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          
          <Button 
            onClick={() => router.push(`/public-services/${service.service_id}/edit`)}
            className="flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
          
          <Button 
            onClick={handleDelete}
            disabled={deleting}
            variant="outline"
            className="flex items-center gap-2"
          >
            {deleting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Deleting...
              </>
            ) : (
              <>
                <TrashBinIcon className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ComponentCard title="" className="lg:col-span-2">
          <h2 className="text-title-md2 font-bold text-black dark:text-white mb-6">
            {service.route_name}
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Service ID
              </h3>
              <p className="text-lg font-medium text-black dark:text-white">
                {service.service_id}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Status
              </h3>
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
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Capacity
              </h3>
              <p className="text-lg font-medium text-black dark:text-white">
                {service.capacity} passengers
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Fare
              </h3>
              <p className="text-lg font-medium text-black dark:text-white">
                ${service.fare}
              </p>
            </div>
            
            {service.vehicle_id && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Assigned Vehicle ID
                </h3>
                <p className="text-lg font-medium text-black dark:text-white">
                  {service.vehicle_id}
                </p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Created At
              </h3>
              <p className="text-lg font-medium text-black dark:text-white">
                {service.created_at ? new Date(service.created_at).toLocaleString() : 'N/A'}
              </p>
              {service.created_by && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  by user #{service.created_by}
                </p>
              )}
            </div>
            
            {service.updated_at && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Last Updated
                </h3>
                <p className="text-lg font-medium text-black dark:text-white">
                  {new Date(service.updated_at).toLocaleString()}
                </p>
                {service.updated_by && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    by user #{service.updated_by}
                  </p>
                )}
              </div>
            )}

          </div>
        </ComponentCard>

        <div className="space-y-6">
          <ComponentCard title="">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Actions
            </h3>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => router.push(`/public-services/tickets/book?serviceId=${service.service_id}`)}
                className="w-full flex items-center justify-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Book Ticket
              </Button>
              
              <Button 
                onClick={() => router.push(`/public-services/${service.service_id}/create-trip`)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Create Trip
              </Button>
              
              <Button 
                onClick={() => router.push(`/public-services/${service.service_id}/availability`)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                Check Availability
              </Button>
              
              <Button 
                onClick={() => router.push(`/public-services/${service.service_id}/timetable`)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                View Timetable
              </Button>
              
              <Button 
                onClick={() => router.push(`/public-services/${service.service_id}/tickets`)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                View Service Tickets
              </Button>

              <Button 
                onClick={() => router.push(`/public-services/${service.service_id}/statistics`)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <PieChartIcon className="h-4 w-4" />
                View Statistics
              </Button>

              <Button 
                onClick={() => router.push(`/public-services/${service.service_id}/status`)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                Update Status
              </Button>

              <Button 
                onClick={toggleStatus}
                variant={service.status === 'active' ? 'outline' : undefined}
                className="w-full flex items-center justify-center gap-2"
              >
                {service.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => router.push(`/public-services/${service.service_id}/edit`)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </Button>
                
                <Button 
                  onClick={handleDelete}
                  disabled={deleting}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashBinIcon className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Route Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Stops ({service.stops.length})
                </h4>
                <div className="space-y-3">
                  {service.stops.map((stop, index) => (
                    <div key={index} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3 py-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-black dark:text-white">
                          {stop.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          #{stop.sequence}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {stop.location}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Est. {stop.estimated_time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Schedule
                </h4>
                <div className="space-y-3">
                  {service.schedule.map((entry, index) => (
                    <div key={index} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="flex justify-between">
                        <span className="font-medium text-black dark:text-white">
                          {entry.day}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600 dark:text-gray-300">
                          Departure: {entry.departure_time}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          Arrival: {entry.arrival_time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}