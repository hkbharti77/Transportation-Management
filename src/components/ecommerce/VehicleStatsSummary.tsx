"use client";

import React, { useState, useEffect } from "react";
import { vehicleService, VehicleStatsResponse } from "@/services/vehicleService";
import { TruckIcon, UserIcon, CheckCircleIcon, AlertIcon } from "@/icons";

interface VehicleStatsSummaryProps {
  userRole?: string;
}

export default function VehicleStatsSummary({ userRole = "admin" }: VehicleStatsSummaryProps) {
  const [stats, setStats] = useState<VehicleStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === 'admin') {
      loadVehicleStats();
    }
  }, [userRole]);

  const loadVehicleStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Add cache control to prevent unnecessary re-fetching
      const data = await vehicleService.getVehicleStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vehicle statistics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole !== 'admin') {
    return null;
  }

  // Optimized loading skeleton with fewer elements
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 dark:bg-red-900/20 dark:border-red-800">
        <div className="flex items-center">
          <AlertIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statusColors = {
    active: "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400",
    inactive: "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400",
    maintenance: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400",
    retired: "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400"
  };

  const typeColors = {
    truck: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
    bus: "text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400",
    van: "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400",
    car: "text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400",
    motorcycle: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400"
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Vehicles */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Vehicles</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_vehicles}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Active Vehicles */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Vehicles</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.status_breakdown.active}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Assigned Vehicles */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Vehicles</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.assignment_breakdown.assigned}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <UserIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Unassigned Vehicles */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unassigned Vehicles</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.assignment_breakdown.unassigned}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TruckIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.status_breakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Types</h3>
          <div className="space-y-3">
            {Object.entries(stats.type_breakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[type as keyof typeof typeColors]}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Summary */}
      <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assignment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.assignment_breakdown.assigned}</p>
            <p className="text-sm text-purple-600 dark:text-purple-400">Vehicles with Drivers</p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.assignment_breakdown.unassigned}</p>
            <p className="text-sm text-orange-600 dark:text-orange-400">Available for Assignment</p>
          </div>
        </div>
      </div>
    </div>
  );
}