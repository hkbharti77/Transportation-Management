"use client";

import React from "react";
import ServiceManagement from "@/components/ui-elements/fleet-management/ServiceManagement";
import ServiceSummary from "@/components/ui-elements/fleet-management/ServiceSummary";
import VehicleMaintenanceOverview from "@/components/ui-elements/fleet-management/VehicleMaintenanceOverview";
import MaintenanceSchedule from "@/components/ui-elements/fleet-management/MaintenanceSchedule";
import ServiceCostAnalysis from "@/components/ui-elements/fleet-management/ServiceCostAnalysis";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function FleetServiceManagementPage() {
  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <PageBreadcrumb pageTitle="Service Management" />
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage vehicle service records
          </p>
        </div>
        <div className="mb-6">
          <ServiceSummary />
        </div>
        <div className="mb-6">
          <VehicleMaintenanceOverview />
        </div>
        <div className="mb-6">
          <MaintenanceSchedule />
        </div>
        <div className="mb-6">
          <ServiceCostAnalysis />
        </div>
        <ServiceManagement />
      </div>
    </div>
  );
}