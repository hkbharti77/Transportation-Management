"use client";

import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";

export default function OrdersPage() {
  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Orders Management
          </h2>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Create New Order
          </Button>
        </div>

        <ComponentCard>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Orders Management
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              This section will be implemented to manage all transportation orders and shipments.
            </p>
            <div className="text-sm text-gray-400">
              Features coming soon:
            </div>
            <ul className="text-sm text-gray-400 mt-2 space-y-1">
              <li>• Order creation and management</li>
              <li>• Order status tracking</li>
              <li>• Route optimization</li>
              <li>• Driver assignment</li>
              <li>• Delivery scheduling</li>
            </ul>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
