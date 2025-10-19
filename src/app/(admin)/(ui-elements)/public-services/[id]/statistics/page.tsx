"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { publicService, PublicServiceStatistics } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon } from "@/icons";

export default function ServiceStatisticsPage() {
  const router = useRouter();
  const params = useParams();
  const [statistics, setStatistics] = useState<PublicServiceStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await publicService.getServiceStatistics(parseInt(params.id as string));
      setStatistics(statsData);
    } catch (error: unknown) {
      console.error("Error fetching statistics:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch statistics");
      toast.error(error instanceof Error ? error.message : "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchStatistics();
    }
  }, [params.id, fetchStatistics]);

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.back()} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <div className="flex justify-center">
              <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading statistics...
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.back()} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Error Loading Statistics
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button 
              onClick={fetchStatistics}
              className="flex items-center gap-2 mx-auto"
            >
              Retry
            </Button>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <Button 
          onClick={() => router.back()} 
          className="flex items-center gap-2"
          variant="outline"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Service
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Service Statistics
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Performance metrics for {statistics?.route_name}
        </p>
      </div>

      {statistics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Total Tickets Sold
                  </h3>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {statistics.total_tickets_sold}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <span className="text-blue-600 dark:text-blue-300 text-xl font-bold">
                    {statistics.total_tickets_sold}
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Total Revenue
                  </h3>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    ${statistics.total_revenue.toFixed(2)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <span className="text-green-600 dark:text-green-300 text-xl font-bold">
                    ${statistics.total_revenue.toFixed(0)}
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Average Occupancy
                  </h3>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {statistics.average_occupancy.toFixed(1)}%
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <span className="text-purple-600 dark:text-purple-300 text-xl font-bold">
                    {Math.round(statistics.average_occupancy)}%
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Popular Times
                  </h3>
                  <p className="text-lg font-bold text-black dark:text-white truncate">
                    {statistics.most_popular_times.length > 0 
                      ? statistics.most_popular_times[0] 
                      : 'N/A'}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                  <span className="text-orange-600 dark:text-orange-300 text-xl font-bold">
                    {statistics.most_popular_times.length}
                  </span>
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ComponentCard title="Popular Travel Times">
              <div className="space-y-3">
                {statistics.most_popular_times.map((time, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
                  >
                    <span className="font-medium text-black dark:text-white">{time}</span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      #{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </ComponentCard>

            <ComponentCard title="Service Overview">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Route Name
                  </h4>
                  <p className="text-lg font-medium text-black dark:text-white">
                    {statistics.route_name}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Service ID
                  </h4>
                  <p className="text-lg font-medium text-black dark:text-white">
                    #{statistics.service_id}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Revenue Per Ticket
                  </h4>
                  <p className="text-lg font-medium text-black dark:text-white">
                    ${(statistics.total_revenue / (statistics.total_tickets_sold || 1)).toFixed(2)}
                  </p>
                </div>
              </div>
            </ComponentCard>
          </div>
        </>
      )}
    </div>
  );
}