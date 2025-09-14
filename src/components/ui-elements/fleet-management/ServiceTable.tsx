"use client";

import React, { useEffect, useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import { ServiceRecord } from "@/services/serviceService";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
// Removed unused serviceService import
import ServiceStatusModal from "./ServiceStatusModal";
import ServiceViewModal from "./ServiceViewModal";

interface ServiceTableProps {
  services: ServiceRecord[];
  onEdit?: (service: ServiceRecord) => void;
  onDelete?: (id: number) => void;
}

const ServiceTable: React.FC<ServiceTableProps> = ({ services }) => { // onEdit and onDelete are unused
  const [serviceList, setServiceList] = useState<ServiceRecord[]>(services);
  // const [_loadingId, setLoadingId] = useState<number | null>(null); // Unused state
  const [activeService, setActiveService] = useState<ServiceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);

  useEffect(() => {
    setServiceList(services);
  }, [services]);

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
      case "critical":
        return "error";
      case "medium":
        return "warning";
      case "low":
      default:
        return "success";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      case "in_progress":
        return "warning";
      case "scheduled":
      default:
        return "primary";
    }
  };

  const openStatusModal = (service: ServiceRecord) => {
    setActiveService(service);
    setIsModalOpen(true);
  };

  const handleServiceUpdated = (updated: ServiceRecord) => {
    setServiceList((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
  };

  // const _allStatuses = ["scheduled", "in_progress", "completed", "cancelled"] as const; // Unused variable

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="bg-gray-2 text-left dark:bg-meta-4">
              <TableCell isHeader className="min-w-[90px] py-4 px-4 font-medium text-black dark:text-white">
                ID
              </TableCell>
              <TableCell isHeader className="min-w-[130px] py-4 px-4 font-medium text-black dark:text-white hidden md:table-cell">
                Vehicle ID
              </TableCell>
              <TableCell isHeader className="min-w-[160px] py-4 px-4 font-medium text-black dark:text-white">
                Service Type
              </TableCell>
              <TableCell isHeader className="min-w-[170px] py-4 px-4 font-medium text-black dark:text-white hidden sm:table-cell">
                Scheduled Date
              </TableCell>
              <TableCell isHeader className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white hidden lg:table-cell">
                Priority
              </TableCell>
              <TableCell isHeader className="min-w-[160px] py-4 px-4 font-medium text-black dark:text-white">
                Status
              </TableCell>
              <TableCell isHeader className="min-w-[160px] py-4 px-4 font-medium text-black dark:text-white hidden xl:table-cell">
                Created At
              </TableCell>
              <TableCell isHeader className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceList.map((service) => (
              <TableRow key={service.id} className="dark:border-strokedark">
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">{service.id}</p>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark hidden md:table-cell">
                  <p className="text-black dark:text-white">{service.vehicle_id}</p>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">{service.service_type}</p>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark hidden sm:table-cell">
                  <p className="text-black dark:text-white">
                    {service.scheduled_date ? new Date(service.scheduled_date).toLocaleString() : "N/A"}
                  </p>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark hidden lg:table-cell">
                  <Badge variant="solid" color={getPriorityBadgeVariant(service.priority || "medium")}>
                    {service.priority || "medium"}
                  </Badge>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <Badge variant="solid" color={getStatusBadgeVariant(service.status || "scheduled")}>
                    {service.status || "scheduled"}
                  </Badge>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark hidden xl:table-cell">
                  <p className="text-black dark:text-white">
                    {service.created_at ? new Date(service.created_at).toLocaleString() : "N/A"}
                  </p>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex items-center space-x-3.5">
                    <button
                      className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                      onClick={() => openStatusModal(service)}
                      title="Update Status"
                    >
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button
                      className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                      onClick={() => setViewId(service.id!)}
                      title="View"
                    >
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ServiceStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={activeService}
        onServiceUpdated={handleServiceUpdated}
      />
      <ServiceViewModal
        isOpen={viewId != null}
        onClose={() => setViewId(null)}
        serviceId={viewId}
      />
    </div>
  );
};

export default ServiceTable;