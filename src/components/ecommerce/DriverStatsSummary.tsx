"use client";

import React, { useState, useEffect } from "react";
import { 
  TaskIcon, 
  LocationIcon, 
  TruckIcon, 
  UserIcon,
  AlertIcon
} from "@/icons";

interface DriverStatsProps {
  userRole?: string;
}

interface DriverDashboardStats {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  totalTrips: number;
  todayTrips: number;
  totalDistance: number;
  avgRating: number;
}

export default function DriverStatsSummary({ userRole = "driver" }: DriverStatsProps) {
  const [stats, setStats] = useState<DriverDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === 'driver') {
      loadDriverStats();
    }
  }, [userRole]);

  const loadDriverStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      const mockStats: DriverDashboardStats = {
        totalOrders: 145,
        completedOrders: 132,
        activeOrders: 3,
        totalTrips: 89,
        todayTrips: 2,
        totalDistance: 15420,
        avgRating: 4.7
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(mockStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load driver statistics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole !== 'driver') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Orders */}
      <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/20">
            <TaskIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {stats.completedOrders} completed
            </p>
          </div>
        </div>
      </div>

      {/* Total Trips */}
      <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900/20">
            <LocationIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trips</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTrips}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {stats.todayTrips} today
            </p>
          </div>
        </div>
      </div>

      {/* Distance Driven */}
      <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900/20">
            <TruckIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Distance</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(stats.totalDistance / 1000).toFixed(1)}k km
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Total driven
            </p>
          </div>
        </div>
      </div>

      {/* Driver Rating */}
      <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
        <div className="flex items-center">
          <div className="p-3 bg-orange-100 rounded-lg dark:bg-orange-900/20">
            <UserIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgRating}</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              ⭐ Average
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}