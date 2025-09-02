"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fleetService, Truck, UpdateTruckRequest } from "@/services/fleetService";
import TruckForm from "@/components/ui-elements/fleet-management/TruckForm";

export default function EditTruckPage() {
  const router = useRouter();
  const params = useParams();
  const truckId = Number(params.id);
  const [truck, setTruck] = useState<Truck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchTruck = async () => {
      if (!truckId) return;
      
      try {
        const truckData = await fleetService.getTruckById(truckId);
        setTruck(truckData);
      } catch (error) {
        console.error("Failed to fetch truck:", error);
        alert("Failed to fetch truck data. Please try again.");
        router.push('/trucks');
      } finally {
        setIsFetching(false);
      }
    };

    fetchTruck();
  }, [truckId, router]);

  const handleSubmit = async (truckData: UpdateTruckRequest) => {
    if (!truckId) return;
    
    setIsLoading(true);
    try {
      await fleetService.updateTruck(truckId, truckData);
      alert("Truck updated successfully!");
      router.push('/trucks');
    } catch (error) {
      console.error("Failed to update truck:", error);
      alert("Failed to update truck. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/trucks');
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Truck Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The truck you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/trucks')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Back to Trucks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Edit Truck - {truck.truck_number}
          </h2>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <TruckForm
            truck={truck}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
}
