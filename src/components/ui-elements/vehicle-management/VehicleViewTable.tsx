"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../ui/table";
import Button from "../../ui/button/Button";
import Badge from "../../ui/badge/Badge";
import { Vehicle } from "@/services/vehicleService";
import { EyeIcon, UserIcon, TruckIcon } from "@/icons";

interface VehicleViewTableProps {
  vehicles: Vehicle[];
  onView: (vehicle: Vehicle) => void;
  isLoading: boolean;
}

export default function VehicleViewTable({
  vehicles,
  onView,
  isLoading
}: VehicleViewTableProps) {
  const getStatusColor = (status: string): "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "active":
        return "success";
      case "maintenance":
        return "warning";
      case "inactive":
      case "out_of_service":
        return "error";
      default:
        return "info";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "truck":
        return "🚛";
      case "bus":
        return "🚌";
      case "van":
        return "🚐";
      case "pickup":
        return "🛻";
      case "motorcycle":
        return "🏍️";
      default:
        return "🚗";
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
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <TruckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          No Vehicles Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No vehicles match your current search criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell className="font-semibold">Vehicle</TableCell>
            <TableCell className="font-semibold">Type & Model</TableCell>
            <TableCell className="font-semibold">License Plate</TableCell>
            <TableCell className="font-semibold">Capacity</TableCell>
            <TableCell className="font-semibold">Status</TableCell>
            <TableCell className="font-semibold">Driver Assignment</TableCell>
            <TableCell className="font-semibold">Year</TableCell>
            <TableCell className="font-semibold text-center">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              {/* Vehicle Icon & ID */}
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getTypeIcon(vehicle.type)}</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      #{vehicle.id}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Vehicle ID
                    </div>
                  </div>
                </div>
              </TableCell>

              {/* Type & Model */}
              <TableCell>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {vehicle.model}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {vehicle.type}
                  </div>
                </div>
              </TableCell>

              {/* License Plate */}
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {vehicle.license_plate}
                </span>
              </TableCell>

              {/* Capacity */}
              <TableCell>
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {formatCapacity(vehicle.capacity)}
                </span>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge color={getStatusColor(vehicle.status)} variant="light">
                  {vehicle.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </TableCell>

              {/* Driver Assignment */}
              <TableCell>
                {vehicle.assigned_driver_id ? (
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Driver #{vehicle.assigned_driver_id}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    Unassigned
                  </span>
                )}
              </TableCell>

              {/* Year */}
              <TableCell>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {vehicle.year}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell>
                <div className="flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(vehicle)}
                    className="!p-2 !min-w-[36px] !min-h-[36px]"
                  >
                    <EyeIcon className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}