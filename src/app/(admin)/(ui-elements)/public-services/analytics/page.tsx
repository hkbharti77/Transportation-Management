"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { publicService } from "@/services/publicService";
import toast from "react-hot-toast";

export default function PublicServicesAnalyticsPage() {
  const [stats, setStats] = useState({
    total_services: 0,
    status_breakdown: {
      active: 0,
      inactive: 0,
      maintenance: 0,
      cancelled: 0
    },
    avg_capacity: 0,
    avg_fare: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Since we don't have a dedicated stats endpoint yet, we'll calculate from the services data
      const services = await publicService.getPublicServices();
      
      const total_services = services.length;
      const active_services = services.filter(s => s.status === 'active').length;
      const inactive_services = services.filter(s => s.status === 'inactive').length;
      const maintenance_services = services.filter(s => s.status === 'maintenance').length;
      const cancelled_services = services.filter(s => s.status === 'cancelled').length;
      
      const total_capacity = services.reduce((sum, service) => sum + service.capacity, 0);
      const avg_capacity = total_services > 0 ? Math.round(total_capacity / total_services) : 0;
      
      const total_fare = services.reduce((sum, service) => sum + service.fare, 0);
      const avg_fare = total_services > 0 ? parseFloat((total_fare / total_services).toFixed(2)) : 0;
      
      setStats({
        total_services,
        status_breakdown: {
          active: active_services,
          inactive: inactive_services,
          maintenance: maintenance_services,
          cancelled: cancelled_services
        },
        avg_capacity,
        avg_fare
      });
    } catch (error: unknown) {
      console.error("Error fetching analytics:", error);
      toast.error((error as Error).message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Public Services Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of public transportation services metrics
          </p>
        </div>

        {loading ? (
          <ComponentCard title="">
            <div className="text-center py-12">
              <div className="flex justify-center">
                <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Loading analytics data...
              </p>
            </div>
          </ComponentCard>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Services
                  </h3>
                  <p className="text-2xl font-bold text-black dark:text-white mt-1">
                    {stats.total_services}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <span className="text-blue-600 dark:text-blue-300 text-xl font-bold">
                    {stats.total_services}
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Active Services
                  </h3>
                  <p className="text-2xl font-bold text-black dark:text-white mt-1">
                    {stats.status_breakdown.active}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <span className="text-green-600 dark:text-green-300 text-xl font-bold">
                    {stats.status_breakdown.active}
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Inactive Services
                  </h3>
                  <p className="text-2xl font-bold text-black dark:text-white mt-1">
                    {stats.status_breakdown.inactive}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <span className="text-yellow-600 dark:text-yellow-300 text-xl font-bold">
                    {stats.status_breakdown.inactive}
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Maintenance
                  </h3>
                  <p className="text-2xl font-bold text-black dark:text-white mt-1">
                    {stats.status_breakdown.maintenance}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                  <span className="text-orange-600 dark:text-orange-300 text-xl font-bold">
                    {stats.status_breakdown.maintenance}
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Cancelled
                  </h3>
                  <p className="text-2xl font-bold text-black dark:text-white mt-1">
                    {stats.status_breakdown.cancelled}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <span className="text-red-600 dark:text-red-300 text-xl font-bold">
                    {stats.status_breakdown.cancelled}
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Avg. Capacity
                  </h3>
                  <p className="text-2xl font-bold text-black dark:text-white mt-1">
                    {stats.avg_capacity}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <span className="text-purple-600 dark:text-purple-300 text-xl font-bold">
                    {stats.avg_capacity}
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="" className="md:col-span-2 lg:col-span-4">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Service Distribution
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Active Services
                  </h4>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-300 mt-2">
                    {stats.status_breakdown.active}
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-blue-200 dark:bg-blue-800">
                    <div 
                      className="h-2 rounded-full bg-blue-600 dark:bg-blue-400" 
                      style={{ width: `${stats.total_services > 0 ? (stats.status_breakdown.active / stats.total_services) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/30">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Inactive Services
                  </h4>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-300 mt-2">
                    {stats.status_breakdown.inactive}
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-yellow-200 dark:bg-yellow-800">
                    <div 
                      className="h-2 rounded-full bg-yellow-600 dark:bg-yellow-400" 
                      style={{ width: `${stats.total_services > 0 ? (stats.status_breakdown.inactive / stats.total_services) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/30">
                  <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Average Fare
                  </h4>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-300 mt-2">
                    ${stats.avg_fare}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Avg. Capacity: {stats.avg_capacity} passengers
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/30">
                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Maintenance Services
                  </h4>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-300 mt-2">
                    {stats.status_breakdown.maintenance}
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-orange-200 dark:bg-orange-800">
                    <div 
                      className="h-2 rounded-full bg-orange-600 dark:bg-orange-400" 
                      style={{ width: `${stats.total_services > 0 ? (stats.status_breakdown.maintenance / stats.total_services) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Cancelled Services
                  </h4>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-300 mt-2">
                    {stats.status_breakdown.cancelled}
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-red-200 dark:bg-red-800">
                    <div 
                      className="h-2 rounded-full bg-red-600 dark:bg-red-400" 
                      style={{ width: `${stats.total_services > 0 ? (stats.status_breakdown.cancelled / stats.total_services) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        )}
      </div>
    </div>
  );
}