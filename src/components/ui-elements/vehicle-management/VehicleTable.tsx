"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import Select from "../../form/Select";
import { Vehicle } from "@/services/vehicleService";
import { EditIcon, TrashIcon, UserIcon, TruckIcon } from "@/icons";

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: number) => void;
  onView: (vehicle: Vehicle) => void;
  onAssignDriver?: (vehicle: Vehicle) => void;
  onUnassignDriver?: (vehicle: Vehicle) => void;
  onStatusChange?: (vehicleId: number, newStatus: Vehicle['status']) => void;
  isLoading?: boolean;
  userRole?: string;
  readOnlyMode?: boolean;
}

export default function VehicleTable({
  vehicles,
  onEdit,
  onDelete,
  onView,
  onAssignDriver,
  onUnassignDriver,
  onStatusChange,
  isLoading = false,
  userRole = "admin",
  readOnlyMode = false
}: VehicleTableProps) {
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Maintenance" },
    { value: "out_of_service", label: "Out of Service" }
  ];

  const handleStatusChange = async (vehicleId: number, newStatus: Vehicle['status']) => {
    if (!onStatusChange) return;
    
    setUpdatingStatus(vehicleId);
    try {
      await onStatusChange(vehicleId, newStatus);
    } catch (error) {
      console.error('Failed to update vehicle status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadgeColor = (status: Vehicle['status']): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'light';
      case 'maintenance':
        return 'warning';
      case 'out_of_service':
        return 'error';
      default:
        return 'light';
    }
  };

  const getTypeBadgeColor = (type: Vehicle['type']): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
    switch (type) {
      case 'truck':
        return 'primary';
      case 'bus':
        return 'dark';
      case 'van':
        return 'success';
      case 'pickup':
        return 'warning';
      case 'motorcycle':
        return 'info';
      default:
        return 'light';
    }
  };

  const formatCapacity = (capacity: number) => {
    if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(1)}t`;
    }
    return `${capacity}kg`;
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No vehicles found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding a new vehicle to your fleet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Vehicle Details
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Type & Capacity
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  License Plate
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Assigned Driver
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  {/* Vehicle Details */}
                  <TableCell className="px-5 py-4 text-start">
                    <div>
                      <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        #{vehicle.id} - {vehicle.model}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Year: {vehicle.year}
                      </div>
                      {vehicle.created_at && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Added: {new Date(vehicle.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Type & Capacity */}
                  <TableCell className="px-4 py-3 text-start">
                    <div className="space-y-1">
                      <Badge
                        size="sm"
                        color={getTypeBadgeColor(vehicle.type)}
                      >
                        {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                      </Badge>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCapacity(vehicle.capacity)}
                      </div>
                    </div>
                  </TableCell>

                  {/* License Plate */}
                  <TableCell className="px-4 py-3 text-start">
                    <div className="font-mono text-sm font-semibold text-gray-800 dark:text-white/90 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {vehicle.license_plate}
                    </div>
                  </TableCell>

                  {/* Assigned Driver */}
                  <TableCell className="px-4 py-3 text-start">
                    {vehicle.assigned_driver_id ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-gray-800 dark:text-white/90">
                            Driver #{vehicle.assigned_driver_id}
                          </span>
                        </div>
                        {!readOnlyMode && userRole === 'admin' && (
                          <div className="flex items-center gap-1 ml-2">
                            {onAssignDriver && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onAssignDriver(vehicle)}
                                className="!px-2 !py-1 text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                              >
                                Reassign
                              </Button>
                            )}
                            {onUnassignDriver && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onUnassignDriver(vehicle)}
                                className="!px-2 !py-1 text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                              >
                                Unassign
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Not assigned
                          </span>
                        </div>
                        {!readOnlyMode && userRole === 'admin' && onAssignDriver && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAssignDriver(vehicle)}
                            className="!px-2 !py-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-2"
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-4 py-3 text-start">
                    {!readOnlyMode && userRole === 'admin' && onStatusChange ? (
                      <div className="space-y-1">
                        <Badge
                          size="sm"
                          color={getStatusBadgeColor(vehicle.status)}
                        >
                          {vehicle.status === 'out_of_service' ? 'Out of Service' : 
                           vehicle.status ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : 'Unknown'}
                        </Badge>
                        <div className="w-32">
                          <Select
                            options={statusOptions}
                            value={vehicle.status}
                            onChange={(value: string) => vehicle.id && handleStatusChange(vehicle.id, value as Vehicle['status'])}
                            disabled={updatingStatus === vehicle.id}
                            className="text-xs"
                          />
                        </div>
                        {updatingStatus === vehicle.id && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            Updating...
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge
                        size="sm"
                        color={getStatusBadgeColor(vehicle.status)}
                      >
                        {vehicle.status === 'out_of_service' ? 'Out of Service' : 
                         vehicle.status ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : 'Unknown'}
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onView(vehicle)}
                        className="!px-3 !py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <span className="text-xs font-medium">View</span>
                      </Button>
                      
                      {!readOnlyMode && userRole === 'admin' && onEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(vehicle)}
                          className="!p-2 !min-w-[36px] !min-h-[36px] text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <EditIcon className="h-4 w-4 flex-shrink-0" />
                        </Button>
                      )}
                      
                      {!readOnlyMode && userRole === 'admin' && onAssignDriver && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAssignDriver(vehicle)}
                          className="!p-2 !min-w-[36px] !min-h-[36px] text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          <UserIcon className="h-4 w-4 flex-shrink-0" />
                        </Button>
                      )}
                      
                      {!readOnlyMode && userRole === 'admin' && onDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => vehicle.id && onDelete(vehicle.id)}
                          className="!p-2 !min-w-[36px] !min-h-[36px] text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4 flex-shrink-0" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}