"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  LocationIcon,
  TimeIcon,
  AlertIcon
} from "@/icons";

// Interface for driver trips
interface DriverTrip {
  id: number;
  trip_number: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  start_location: string;
  end_location: string;
  start_time: string;
  end_time?: string;
  distance_km?: number;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  vehicle_id: number;
  driver_id: number;
}

export default function DriverActiveTripsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // States
  const [activeTrips, setActiveTrips] = useState<DriverTrip[]>([]);
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

    // Load driver active trips data
    loadActiveTripsData();
  }, [isAuthenticated, user, isLoading, router]);

  const loadActiveTripsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API calls
      const mockActiveTrips: DriverTrip[] = [
        {
          id: 1,
          trip_number: "TRP-2024-001",
          status: "in_progress",
          start_location: "Mumbai",
          end_location: "Pune",
          start_time: "2024-09-04T08:00:00Z",
          distance_km: 150,
          estimated_duration_hours: 3.5,
          vehicle_id: 1,
          driver_id: 1
        },
        {
          id: 2,
          trip_number: "TRP-2024-002",
          status: "scheduled",
          start_location: "Delhi",
          end_location: "Gurgaon",
          start_time: "2024-09-06T09:00:00Z",
          distance_km: 45,
          estimated_duration_hours: 1.5,
          vehicle_id: 1,
          driver_id: 1
        },
        {
          id: 3,
          trip_number: "TRP-2024-003",
          status: "scheduled",
          start_location: "Chennai",
          end_location: "Bangalore",
          start_time: "2024-09-07T06:00:00Z",
          distance_km: 350,
          estimated_duration_hours: 6,
          vehicle_id: 1,
          driver_id: 1
        }
      ];

      setActiveTrips(mockActiveTrips);
    } catch (err) {
      console.error('Failed to load active trips data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load active trips data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTripStatus = async (tripId: number, newStatus: string) => {
    try {
      // API call to update trip status  
      console.log(`Updating trip ${tripId} to status: ${newStatus}`);
      // await driverService.updateTripStatus(tripId, newStatus);
      
      // Update local state
      setActiveTrips(prev => prev.map(trip =>
        trip.id === tripId
          ? { ...trip, status: newStatus as DriverTrip['status'] }
          : trip
      ));
    } catch (err) {
      console.error('Failed to update trip status:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
    switch (status) {
      case 'scheduled':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'light';
    }
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
          <Button className="mt-4" onClick={loadActiveTripsData}>
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
            Active Trips
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your current and scheduled trips
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ComponentCard title="In Progress" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <LocationIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTrips.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Scheduled" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TimeIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTrips.filter(t => t.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Active" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <LocationIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTrips.length}
              </p>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Active Trips Table */}
      <ComponentCard title="Trip List">
        {activeTrips.length === 0 ? (
          <div className="text-center py-12">
            <LocationIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active trips</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Trip #</TableCell>
                  <TableCell isHeader>Route</TableCell>
                  <TableCell isHeader>Start Time</TableCell>
                  <TableCell isHeader>Distance</TableCell>
                  <TableCell isHeader>Est. Duration</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.trip_number}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>📍 {trip.start_location}</div>
                        <div>➡️ {trip.end_location}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(trip.start_time)}</TableCell>
                    <TableCell>{trip.distance_km || 'N/A'} km</TableCell>
                    <TableCell>{trip.estimated_duration_hours || 'N/A'} hrs</TableCell>
                    <TableCell>
                      <Badge color={getStatusBadgeColor(trip.status)}>
                        {trip.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {trip.status === 'scheduled' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateTripStatus(trip.id, 'in_progress')}
                          >
                            Start Trip
                          </Button>
                        )}
                        {trip.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateTripStatus(trip.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/driver-trips/${trip.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}