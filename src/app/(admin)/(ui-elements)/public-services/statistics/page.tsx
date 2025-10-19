"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { publicService, PublicService, PublicServiceStatistics } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon } from "@/icons";

export default function PublicServicesStatisticsPage() {
  const router = useRouter();
  const [services, setServices] = useState<PublicService[]>([]);
  const [statistics, setStatistics] = useState<Record<number, PublicServiceStatistics>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [, setSelectedService] = useState<number | null>(null); // Removed unused state

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const servicesData = await publicService.getPublicServices();
      setServices(servicesData);
      
      // Fetch statistics for all services
      const statsPromises = servicesData.map(service => 
        publicService.getServiceStatistics(service.service_id!)
      );
      
      const statsResults = await Promise.allSettled(statsPromises);
      const statsMap: Record<number, PublicServiceStatistics> = {};
      
      statsResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const stats = result.value;
          statsMap[stats.service_id] = stats;
        }
      });
      
      setStatistics(statsMap);
    } catch (error: unknown) {
      console.error("Error fetching services:", error);
      setError((error as Error).message || "Failed to fetch services");
      toast.error((error as Error).message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceStatistics = async (serviceId: number) => {
    try {
      const stats = await publicService.getServiceStatistics(serviceId);
      setStatistics(prev => ({ ...prev, [serviceId]: stats }));
    } catch (error: unknown) {
      console.error(`Error fetching statistics for service ${serviceId}:`, error);
      toast.error(`Failed to fetch statistics for ${services.find(s => s.service_id === serviceId)?.route_name || 'service'}`);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.push('/public-services')} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Services
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <div className="flex justify-center">
              <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading services and statistics...
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
            onClick={() => router.push('/public-services')} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Services
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Error Loading Data
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button 
              onClick={fetchServices}
              className="flex items-center gap-2 mx-auto"
            >
              Retry
            </Button>
          </div>
        </ComponentCard>
      </div>
    );
  }

  // Calculate overall statistics
  const totalServices = services.length;
  const totalTickets = Object.values(statistics).reduce((sum, stat) => sum + stat.total_tickets_sold, 0);
  const totalRevenue = Object.values(statistics).reduce((sum, stat) => sum + stat.total_revenue, 0);
  const avgOccupancy = Object.values(statistics).reduce((sum, stat) => sum + stat.average_occupancy, 0) / Math.max(Object.values(statistics).length, 1);

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Public Services Statistics
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/public-services')} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Services
          </Button>
          <Button 
            onClick={fetchServices}
            className="flex items-center gap-2"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <ComponentCard title="">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Total Services
              </h3>
              <p className="text-2xl font-bold text-black dark:text-white">
                {totalServices}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="text-blue-600 dark:text-blue-300 text-xl font-bold">
                {totalServices}
              </span>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Total Tickets Sold
              </h3>
              <p className="text-2xl font-bold text-black dark:text-white">
                {totalTickets}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <span className="text-green-600 dark:text-green-300 text-xl font-bold">
                {totalTickets}
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
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <span className="text-purple-600 dark:text-purple-300 text-xl font-bold">
                ${Math.round(totalRevenue)}
              </span>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Avg. Occupancy
              </h3>
              <p className="text-2xl font-bold text-black dark:text-white">
                {avgOccupancy.toFixed(1)}%
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <span className="text-orange-600 dark:text-orange-300 text-xl font-bold">
                {Math.round(avgOccupancy)}%
              </span>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Services List with Statistics */}
      <ComponentCard title="Service Statistics">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left dark:bg-gray-700">
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Service
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Tickets Sold
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Revenue
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Occupancy
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Popular Times
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => {
                const serviceStats = statistics[service.service_id!];
                return (
                  <tr key={service.service_id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-black dark:text-white">
                          {service.route_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {service.service_id}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {serviceStats ? (
                        <span className="font-medium">{serviceStats.total_tickets_sold}</span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {serviceStats ? (
                        <span className="font-medium">${serviceStats.total_revenue.toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {serviceStats ? (
                        <span className="font-medium">{serviceStats.average_occupancy.toFixed(1)}%</span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {serviceStats ? (
                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          {serviceStats.most_popular_times[0] || 'N/A'}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => router.push(`/public-services/${service.service_id}/statistics`)}
                          size="sm"
                          variant="outline"
                        >
                          Details
                        </Button>
                        <Button 
                          onClick={() => fetchServiceStatistics(service.service_id!)}
                          size="sm"
                          variant="outline"
                        >
                          Refresh
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </div>
  );
}