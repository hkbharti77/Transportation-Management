"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fleetService, Truck } from "@/services/fleetService";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { 
  PencilIcon, 
  TrashBinIcon, 
  UserIcon, 
  BoxIcon, 
  BoltIcon,
  ChevronLeftIcon
} from "@/icons";

export default function TruckDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const truckId = Number(params.id);
  const [truck, setTruck] = useState<Truck | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTruck = async () => {
      if (!truckId) return;
      
      try {
        const truckData = await fleetService.getTruckById(truckId);
        setTruck(truckData);
      } catch (error) {
        console.error("Failed to fetch truck:", error);
        alert("Failed to fetch truck data. Please try again.");
        router.push('/trucks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTruck();
  }, [truckId, router]);

  const handleEdit = () => {
    router.push(`/trucks/${truckId}/edit`);
  };

  const handleDelete = async () => {
    if (!truckId) return;
    
    if (!confirm("Are you sure you want to delete this truck?")) {
      return;
    }

    try {
      await fleetService.deleteTruck(truckId);
      alert("Truck deleted successfully!");
      router.push('/trucks');
    } catch (error) {
      console.error("Failed to delete truck:", error);
      alert("Failed to delete truck. Please try again.");
    }
  };

  const handleAssignDriver = () => {
    // TODO: Implement driver assignment modal
    alert("Driver assignment functionality will be implemented soon!");
  };

  const handleUpdateLocation = () => {
    // TODO: Implement location update modal
    alert("Location update functionality will be implemented soon!");
  };

  const handleUpdateStatus = async (newStatus: Truck['status']) => {
    if (!truckId) return;
    
    try {
      await fleetService.updateTruckStatus(truckId, newStatus);
      alert("Truck status updated successfully!");
      // Refresh truck data
      const updatedTruck = await fleetService.getTruckById(truckId);
      setTruck(updatedTruck);
    } catch (error) {
      console.error("Failed to update truck status:", error);
      alert("Failed to update truck status. Please try again.");
    }
  };

  const getStatusBadge = (status: Truck['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">Available</Badge>;
      case 'in_use':
        return <Badge variant="warning">In Use</Badge>;
      case 'maintenance':
        return <Badge variant="danger">Maintenance</Badge>;
      case 'out_of_service':
        return <Badge variant="secondary">Out of Service</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTruckTypeBadge = (type: Truck['truck_type']) => {
    switch (type) {
      case 'small_truck':
        return <Badge variant="primary">Small Truck</Badge>;
      case 'medium_truck':
        return <Badge variant="info">Medium Truck</Badge>;
      case 'large_truck':
        return <Badge variant="warning">Large Truck</Badge>;
      case 'container_truck':
        return <Badge variant="danger">Container Truck</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getFuelTypeBadge = (fuelType: Truck['fuel_type']) => {
    switch (fuelType) {
      case 'Diesel':
        return <Badge variant="primary">Diesel</Badge>;
      case 'Petrol':
        return <Badge variant="warning">Petrol</Badge>;
      case 'Electric':
        return <Badge variant="success">Electric</Badge>;
      case 'Hybrid':
        return <Badge variant="info">Hybrid</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Truck Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The truck you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/trucks')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Back to Trucks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/trucks')}
              className="flex items-center gap-2"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back to Trucks
            </Button>
            <h2 className="text-title-md2 font-bold text-black dark:text-white">
              Truck Details - {truck.truck_number}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <TrashBinIcon className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Truck Number</label>
                  <p className="text-lg font-semibold text-black dark:text-white">{truck.truck_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Number Plate</label>
                  <p className="text-lg font-semibold text-black dark:text-white">{truck.number_plate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Truck Type</label>
                  <div className="mt-1">{getTruckTypeBadge(truck.truck_type)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className="mt-1">{getStatusBadge(truck.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Capacity</label>
                  <p className="text-lg font-semibold text-black dark:text-white">{truck.capacity_kg.toLocaleString()} kg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Mileage</label>
                  <p className="text-lg font-semibold text-black dark:text-white">{truck.mileage_km?.toLocaleString() || 0} km</p>
                </div>
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Vehicle Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Manufacturer</label>
                  <p className="text-lg font-semibold text-black dark:text-white">{truck.manufacturer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Model</label>
                  <p className="text-lg font-semibold text-black dark:text-white">{truck.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Year of Manufacture</label>
                  <p className="text-lg font-semibold text-black dark:text-white">{truck.year_of_manufacture}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fuel Type</label>
                  <div className="mt-1">{getFuelTypeBadge(truck.fuel_type)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fuel Capacity</label>
                  <p className="text-lg font-semibold text-black dark:text-white">{truck.fuel_capacity_l}L</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Dimensions</label>
                  <p className="text-lg font-semibold text-black dark:text-white">
                    {truck.length_m}m × {truck.width_m}m × {truck.height_m}m
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Assignment */}
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Driver Assignment
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Driver</label>
                  <p className="text-lg font-semibold text-black dark:text-white">
                    {truck.assigned_driver_id ? `Driver ID: ${truck.assigned_driver_id}` : "No driver assigned"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleAssignDriver}
                  className="flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4" />
                  {truck.assigned_driver_id ? "Change Driver" : "Assign Driver"}
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleUpdateLocation}
                  className="w-full justify-start"
                >
                  <BoxIcon className="h-4 w-4 mr-2" />
                  Update Location
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus('maintenance')}
                  className="w-full justify-start"
                >
                  <BoltIcon className="h-4 w-4 mr-2" />
                  Mark Maintenance
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus('available')}
                  className="w-full justify-start"
                >
                  Mark Available
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus('out_of_service')}
                  className="w-full justify-start"
                >
                  Mark Out of Service
                </Button>
              </div>
            </div>

            {/* Location Information */}
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Location Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Location</label>
                  <p className="text-sm text-black dark:text-white">
                    {truck.current_location_lat && truck.current_location_lng 
                      ? `${truck.current_location_lat}, ${truck.current_location_lng}`
                      : "Not available"
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Update</label>
                  <p className="text-sm text-black dark:text-white">
                    {formatDate(truck.last_location_update)}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Expiry */}
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Document Expiry
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Insurance Expiry</label>
                  <p className="text-sm text-black dark:text-white">{formatDate(truck.insurance_expiry)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Permit Expiry</label>
                  <p className="text-sm text-black dark:text-white">{formatDate(truck.permit_expiry)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fitness Expiry</label>
                  <p className="text-sm text-black dark:text-white">{formatDate(truck.fitness_expiry)}</p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                System Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Status</label>
                  <div className="mt-1">
                    {truck.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                  <p className="text-sm text-black dark:text-white">{formatDate(truck.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                  <p className="text-sm text-black dark:text-white">{formatDate(truck.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
