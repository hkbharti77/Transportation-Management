"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import { publicService, PublicService } from "@/services/publicService";
import toast from "react-hot-toast";

export default function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeName = searchParams.get('routeName') || '';
  
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const servicesData = await publicService.searchRoutesByRouteName(routeName);
      setServices(servicesData);
    } catch (error: unknown) {
      console.error("Error fetching services:", error);
      toast.error((error as Error).message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  }, [routeName]);

  useEffect(() => {
    if (routeName) {
      fetchServices();
    }
  }, [routeName, fetchServices]);

  if (!routeName) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.push("/public-services")} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Public Services
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              No Search Term
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Please provide a route name to search for.
            </p>
            <Button 
              onClick={() => router.push("/public-services/search")}
              className="flex items-center gap-2 mx-auto"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Go to Search
            </Button>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.push("/public-services")} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Public Services
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <div className="flex justify-center">
              <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Searching for routes matching &quot;{routeName}&quot;...
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Search Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Routes matching &quot;{routeName}&quot;
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push("/public-services")} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Services
          </Button>
          <Button 
            onClick={() => router.push("/public-services/search")}
            className="flex items-center gap-2"
          >
            New Search
          </Button>
        </div>
      </div>

      {services.length === 0 ? (
        <ComponentCard title="">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              No Routes Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              No public service routes match &quot;{routeName}&quot;.
            </p>
            <Button 
              onClick={() => router.push("/public-services/search")}
              className="flex items-center gap-2 mx-auto"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Try Another Search
            </Button>
          </div>
        </ComponentCard>
      ) : (
        <ComponentCard title="">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-left dark:bg-gray-700">
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Service ID
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Route Name
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Capacity
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Fare
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.service_id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        #{service.service_id}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        {service.route_name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        service.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : service.status === 'inactive'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          : service.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                      }`}>
                        {service.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        {service.capacity}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        ${service.fare}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => router.push(`/public-services/${service.service_id}`)}
                          size="sm"
                          variant="outline"
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {services.length} route(s)
            </p>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}