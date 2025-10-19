"use client";

import React from "react";
import Link from "next/link";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ArrowRightIcon } from "@/icons";

const FleetManagementPage: React.FC = () => {
  const fleetSections = [
    {
      title: "Fleet Overview",
      description: "View fleet statistics and key metrics",
      link: "/fleet-summary",
      icon: "📊",
    },
    {
      title: "Vehicles",
      description: "Manage vehicles in your fleet",
      link: "/vehicles",
      icon: "🚚",
    },
    {
      title: "Trucks",
      description: "Manage truck inventory and assignments",
      link: "/trucks",
      icon: "🚛",
    },
    {
      title: "Drivers",
      description: "Manage fleet drivers and assignments",
      link: "/fleet-drivers",
      icon: "👨‍✈️",
    },
    {
      title: "Service Management",
      description: "Create and manage vehicle service records",
      link: "/fleet-management/services",
      icon: "🔧",
    },
    {
      title: "Parts Inventory",
      description: "Manage vehicle parts and inventory",
      link: "/parts",
      icon: "⚙️",
    },
    {
      title: "Maintenance",
      description: "View and schedule maintenance tasks",
      link: "/maintenance",
      icon: "🛠️",
    },
  ];

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <PageBreadcrumb pageTitle="Fleet Management" />
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your vehicle fleet, drivers, and maintenance schedules
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fleetSections.map((section, index) => (
            <ComponentCard key={index} title={section.title} desc={section.description}>
              <Link 
                href={section.link} 
                className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-4">{section.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {section.description}
                    </p>
                    <div className="flex items-center text-primary font-medium">
                      <span>View Details</span>
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </ComponentCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FleetManagementPage;