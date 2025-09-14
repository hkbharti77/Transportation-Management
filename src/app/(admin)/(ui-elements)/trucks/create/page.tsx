"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { fleetService, CreateTruckRequest, UpdateTruckRequest } from "@/services/fleetService";
import TruckForm from "@/components/ui-elements/fleet-management/TruckForm";

export default function CreateTruckPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (truckData: CreateTruckRequest | UpdateTruckRequest) => {
    // For create mode, we know it's a CreateTruckRequest
    const createData = truckData as CreateTruckRequest;
    
    setIsLoading(true);
    try {
      await fleetService.createTruck(createData);
      alert("Truck created successfully!");
      router.push('/trucks');
    } catch (error) {
      console.error("Failed to create truck:", error);
      alert("Failed to create truck. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/trucks');
  };

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Create New Truck
          </h2>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <TruckForm
            truck={null}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            mode="create"
          />
        </div>
      </div>
    </div>
  );
}