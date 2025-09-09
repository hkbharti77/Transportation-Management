"use client";

import React from "react";
import ComponentCard from "@/components/common/ComponentCard";

const PartsInventoryManagement: React.FC = () => {
  return (
    <ComponentCard>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Parts Inventory
        </h2>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90">
          Add Part
        </button>
      </div>

      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          Parts Inventory Management
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Manage vehicle parts inventory. Track stock levels and part usage.
        </p>
        <div className="text-sm text-gray-400">
          Features include:
        </div>
        <ul className="text-sm text-gray-400 mt-2 space-y-1">
          <li>• Add new parts to inventory</li>
          <li>• Update stock levels</li>
          <li>• Track part usage in services</li>
          <li>• Low stock alerts</li>
          <li>• Part categorization</li>
        </ul>
      </div>
    </ComponentCard>
  );
};

export default PartsInventoryManagement;