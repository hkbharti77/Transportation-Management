"use client";
import React, { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, BoxIcon, UserIcon, TimeIcon } from "@/icons";
import { fleetService, type FleetSummary as FleetSummaryType } from "@/services/fleetService";

export const FleetSummary = () => {
  const [summaryData, setSummaryData] = useState<FleetSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFleetSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if user is authenticated and admin
        if (!fleetService.isAuthenticated()) {
          setError("Authentication required");
          return;
        }

        if (!fleetService.isCurrentUserAdmin()) {
          setError("Admin access required");
          return;
        }

        const summary = await fleetService.getFleetSummary();
        setSummaryData(summary);
      } catch (err) {
        console.error('Failed to fetch fleet summary:', err);
        setError(err instanceof Error ? err.message : 'Failed to load fleet summary');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFleetSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 dark:bg-red-900/20 dark:border-red-800">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">⚠️ Error Loading Fleet Summary</div>
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          No fleet summary data available
        </div>
      </div>
    );
  }

  // Calculate utilization percentages
  const truckUtilization = summaryData.total_trucks > 0 
    ? Math.round((summaryData.busy_trucks / summaryData.total_trucks) * 100) 
    : 0;
  
  const driverUtilization = summaryData.total_drivers > 0 
    ? Math.round((summaryData.on_trip_drivers / summaryData.total_drivers) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Trucks */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trucks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{summaryData.total_trucks}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BoxIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Available</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{summaryData.available_trucks}</span>
          </div>
        </div>

        {/* Busy Trucks */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Busy Trucks</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{summaryData.busy_trucks}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <BoxIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge color={truckUtilization > 70 ? "success" : truckUtilization > 40 ? "warning" : "error"} size="sm">
              {truckUtilization}% Utilization
            </Badge>
          </div>
        </div>

        {/* Total Drivers */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Drivers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{summaryData.total_drivers}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <UserIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Available</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{summaryData.available_drivers}</span>
          </div>
        </div>

        {/* On Trip Drivers */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Trip</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{summaryData.on_trip_drivers}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TimeIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge color={driverUtilization > 70 ? "success" : driverUtilization > 40 ? "warning" : "error"} size="sm">
              {driverUtilization}% Utilization
            </Badge>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fleet Status Breakdown */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fleet Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                  <BoxIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Available Trucks</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ready for deployment</p>
                </div>
              </div>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{summaryData.available_trucks}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded">
                  <BoxIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Busy Trucks</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Currently on trips</p>
                </div>
              </div>
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">{summaryData.busy_trucks}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded">
                  <BoxIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Maintenance</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Under maintenance</p>
                </div>
              </div>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">{summaryData.maintenance_trucks}</span>
            </div>
          </div>
        </div>

        {/* Driver Status Breakdown */}
        <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Driver Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                  <UserIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Available Drivers</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ready for assignments</p>
                </div>
              </div>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">{summaryData.available_drivers}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                  <TimeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">On Trip</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Currently driving</p>
                </div>
              </div>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{summaryData.on_trip_drivers}</span>
            </div>
            
            {/* Utilization Summary */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Utilization</span>
                <div className="flex space-x-2">
                  <Badge color={truckUtilization > 70 ? "success" : truckUtilization > 40 ? "warning" : "error"} size="sm">
                    Trucks: {truckUtilization}%
                  </Badge>
                  <Badge color={driverUtilization > 70 ? "success" : driverUtilization > 40 ? "warning" : "error"} size="sm">
                    Drivers: {driverUtilization}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};