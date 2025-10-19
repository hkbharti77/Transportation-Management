"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { 
  BoxIcon,
  AlertIcon,
  TruckIcon,
  TimeIcon
} from "@/icons";

// Interface for driver vehicle
interface DriverVehicle {
  id: number;
  truck_number: string;
  number_plate: string;
  truck_type: string;
  status: string;
  fuel_level?: number;
  last_maintenance?: string;
  next_maintenance?: string;
  mileage_km?: number;
  capacity_kg?: number;
  assigned_driver_id?: number;
}

export default function DriverVehiclePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // States
  const [assignedVehicle, setAssignedVehicle] = useState<DriverVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication and authorization check
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Only allow drivers to access this page
    if (user?.role !== 'driver') {
      // Redirect non-drivers to appropriate dashboard
      if (user?.role === 'admin') {
        router.push('/admin');
      } else if (user?.role === 'customer') {
        router.push('/dashboard');
      } else {
        router.push('/signin');
      }
      return;
    }

    // Load driver vehicle data
    loadVehicleData();
  }, [isAuthenticated, user, isLoading, router]);

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API calls
      const mockVehicle: DriverVehicle = {
        id: 1,
        truck_number: "TRK-001",
        number_plate: "MH-01-AB-1234",
        truck_type: "Large Truck",
        status: "available",
        fuel_level: 75,
        last_maintenance: "2024-08-25",
        next_maintenance: "2024-09-25",
        mileage_km: 125000,
        capacity_kg: 5000,
        assigned_driver_id: 1
      };

      setAssignedVehicle(mockVehicle);
    } catch (err) {
      console.error('Failed to load vehicle data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center">
            <AlertIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
          <Button className="mt-4" onClick={loadVehicleData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Vehicle
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View details and status of your assigned vehicle
          </p>
        </div>
      </div>

      {/* Vehicle Information */}
      {assignedVehicle ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Details Card */}
          <div className="lg:col-span-2">
            <ComponentCard title="Vehicle Details" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicle ID</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {assignedVehicle.truck_number}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Number Plate</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {assignedVehicle.number_plate}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicle Type</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {assignedVehicle.truck_type}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    <Badge 
                      color={assignedVehicle.status === 'available' ? 'success' : 'warning'}
                    >
                      {assignedVehicle.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Capacity</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {assignedVehicle.capacity_kg?.toLocaleString() || 'N/A'} kg
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Mileage</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {assignedVehicle.mileage_km?.toLocaleString() || 'N/A'} km
                  </p>
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Vehicle Status Card */}
          <div>
            <ComponentCard title="Vehicle Status" className="p-6">
              <div className="space-y-6">
                {/* Fuel Level */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fuel Level</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {assignedVehicle.fuel_level || 'N/A'}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${assignedVehicle.fuel_level || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Maintenance Status */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    Maintenance Status
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Maintenance</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(assignedVehicle.last_maintenance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Next Maintenance</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(assignedVehicle.next_maintenance)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    className="w-full mb-2"
                    onClick={() => router.push('/maintenance')}
                  >
                    <TruckIcon className="h-4 w-4 mr-2" />
                    View Maintenance Records
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/vehicle-directory')}
                  >
                    <BoxIcon className="h-4 w-4 mr-2" />
                    Vehicle Directory
                  </Button>
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Maintenance Reminders */}
          <div className="lg:col-span-3">
            <ComponentCard title="Maintenance Reminders" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <TimeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Next Maintenance</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {formatDate(assignedVehicle.next_maintenance)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scheduled maintenance date
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <TruckIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Mileage</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {assignedVehicle.mileage_km?.toLocaleString() || 'N/A'} km
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current vehicle mileage
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <AlertIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Fuel Level</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {assignedVehicle.fuel_level || 'N/A'}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current fuel level
                  </p>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>
      ) : (
        <ComponentCard title="Vehicle Information">
          <div className="text-center py-12">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No vehicle assigned to you at this time</p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/vehicle-directory')}
            >
              View Vehicle Directory
            </Button>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}