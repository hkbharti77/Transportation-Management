"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { 
  PlusIcon,
  PieChartIcon, 
  SearchIcon 
} from "@/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { publicService, PublicService, PublicServiceFilterOptions } from "@/services/publicService";
import toast from "react-hot-toast";

export default function PublicServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    route_name: '',
    status: '' as '' | 'active' | 'inactive' | 'maintenance' | 'cancelled',
    search: ''
  });

  const fetchPublicServices = useCallback(async () => {
    try {
      setLoading(true);
      // Create properly typed filter options
      const filterOptions: PublicServiceFilterOptions = {};
      if (filters.route_name) filterOptions.route_name = filters.route_name;
      if (filters.status) filterOptions.status = filters.status as 'active' | 'inactive' | 'maintenance' | 'cancelled';
      if (filters.search) filterOptions.search = filters.search;
      
      const servicesData = await publicService.getPublicServices(filterOptions);
      setServices(servicesData);
    } catch (error: unknown) {
      console.error("Error fetching public services:", error);
      toast.error((error as Error).message || "Failed to fetch public services");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initialize filters from URL params
  useEffect(() => {
    const routeName = searchParams.get('route_name') || '';
    const status = searchParams.get('status') as '' | 'active' | 'inactive' | 'maintenance' | 'cancelled' || '';
    const search = searchParams.get('search') || '';
    
    setFilters({
      route_name: routeName,
      status: status,
      search: search
    });
  }, [searchParams]);

  // Fetch services when filters change
  useEffect(() => {
    fetchPublicServices();
  }, [fetchPublicServices]);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with new filters
    const params = new URLSearchParams();
    if (filters.route_name) params.set('route_name', filters.route_name);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    
    router.push(`/public-services?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      route_name: '',
      status: '',
      search: ''
    });
    router.push('/public-services');
  };

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Public Transportation Services
          </h2>
          <div className="flex gap-2">
            <Button 
              onClick={() => router.push("/public-services/statistics")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PieChartIcon className="h-4 w-4" />
              View Statistics
            </Button>
            <Button 
              onClick={() => router.push("/public-services/bulk-status")}
              variant="outline"
              className="flex items-center gap-2"
            >
              Bulk Update Status
            </Button>
            <Button 
              onClick={() => router.push("/public-services/create")}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Create New Service
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <ComponentCard title="" className="mb-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Route Name
              </label>
              <input
                type="text"
                value={filters.route_name}
                onChange={(e) => handleFilterChange('route_name', e.target.value)}
                placeholder="Filter by route name"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search services"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex items-center gap-2">
                <SearchIcon className="h-4 w-4" />
                Search
              </Button>
              <Button 
                type="button" 
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-2"
              >
                Clear
              </Button>
            </div>
          </form>
        </ComponentCard>

        {loading ? (
          <ComponentCard title="">
            <div className="text-center py-12">
              <div className="flex justify-center">
                <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Loading public services...
              </p>
            </div>
          </ComponentCard>
        ) : services.length === 0 ? (
          <ComponentCard title="">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
                No Public Services Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {filters.route_name || filters.status || filters.search 
                  ? "No services match your search criteria. Try adjusting your filters." 
                  : "Get started by creating a new public transportation service."}
              </p>
              <div className="flex justify-center gap-2">
                <Button 
                  onClick={() => router.push("/public-services/create")}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Your First Service
                </Button>
                {(filters.route_name || filters.status || filters.search) && (
                  <Button 
                    onClick={clearFilters}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </ComponentCard>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ComponentCard key={service.service_id} title="">
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    {service.route_name}
                  </h3>
                  <div className="flex-grow">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-medium">Capacity:</span> {service.capacity} passengers
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-medium">Fare:</span> ${service.fare}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        service.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : service.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          : service.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                      }`}>
                        {service.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Stops:</span> {service.stops.length}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                      Created: {service.created_at ? new Date(service.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                    {service.updated_at && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Updated: {new Date(service.updated_at).toLocaleDateString()}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button 
                        onClick={() => router.push(`/public-services/${service.service_id}`)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button 
                        onClick={() => router.push(`/public-services/${service.service_id}/edit`)}
                        size="sm"
                        className="flex-1"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </ComponentCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}