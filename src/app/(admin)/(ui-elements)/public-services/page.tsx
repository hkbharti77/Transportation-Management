"use client";

import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";

export default function PublicServicesPage() {
  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Public Services
          </h2>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add New Service
          </Button>
        </div>

        <ComponentCard>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Public Services Management
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              This section will be implemented to manage public transportation services and routes.
            </p>
            <div className="text-sm text-gray-400">
              Features coming soon:
            </div>
            <ul className="text-sm text-gray-400 mt-2 space-y-1">
              <li>• Service route management</li>
              <li>• Schedule management</li>
              <li>• Service provider coordination</li>
              <li>• Passenger capacity management</li>
              <li>• Service quality monitoring</li>
            </ul>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
