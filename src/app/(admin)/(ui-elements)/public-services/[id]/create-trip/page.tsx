"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { publicService, PublicService } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon, PlusIcon } from "@/icons";

export default function CreateTripFromServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = parseInt(params.id as string);
  const [service, setService] = useState<PublicService | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [departureDate, setDepartureDate] = useState("");

  const fetchService = useCallback(async () => {
    try {
      setLoading(true);
      const serviceData = await publicService.getPublicServiceById(serviceId);
      setService(serviceData);
      
      // Set default departure date to today
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setDepartureDate(formattedDate);
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error((error as Error).message || "Failed to fetch service");
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (!isNaN(serviceId)) {
      fetchService();
    }
  }, [serviceId, fetchService]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departureDate) {
      toast.error("Please select a departure date");
      return;
    }
    
    try {
      setCreating(true);
      const message = await publicService.createTripFromService(serviceId, departureDate);
      toast.success(message || "Trip created successfully");
      
      // Redirect to trips page after successful creation
      setTimeout(() => {
        router.push("/trips");
      }, 1500);
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error((error as Error).message || "Failed to create trip");
    } finally {
      setCreating(false);
    }
  };

  if (isNaN(serviceId)) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.push("/public-services")} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Public Services
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Invalid Service ID
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The provided service ID is not valid.
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
            Back to Public Services
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

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Create Trip from Service
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Service: {service?.route_name} (ID: {serviceId})
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push(`/public-services/${serviceId}`)} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Service
          </Button>
        </div>
      </div>

      <ComponentCard title="">
        <form onSubmit={handleCreateTrip} className="max-w-md mx-auto">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Service Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Route Name:</span>
                <span className="font-medium text-black dark:text-white">{service?.route_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  service?.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                    : service?.status === 'inactive'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    : service?.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                }`}>
                  {service?.status || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                <span className="font-medium text-black dark:text-white">{service?.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fare:</span>
                <span className="font-medium text-black dark:text-white">${service?.fare}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Departure Date
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select the date for the trip departure
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={creating}
            className="w-full flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Creating Trip...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Create Trip
              </>
            )}
          </Button>
        </form>
      </ComponentCard>
    </div>
  );
}