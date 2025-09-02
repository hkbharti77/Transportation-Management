"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { driverService, CreateDriverRequest, UpdateDriverRequest } from "@/services/driverService";
import DriverForm from "@/components/ui-elements/fleet-management/DriverForm";

export default function CreateDriverPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (driverData: CreateDriverRequest | UpdateDriverRequest) => {
    setIsLoading(true);
    try {
      // Since this is create mode, we know driverData is CreateDriverRequest
      await driverService.createDriver(driverData as CreateDriverRequest);
      alert("Driver created successfully!");
      router.push('/fleet-drivers');
    } catch (error) {
      console.error("Failed to create driver:", error);
      alert("Failed to create driver. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/fleet-drivers');
  };

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Create New Driver
          </h2>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <DriverForm
            driver={null}
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
