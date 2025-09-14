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
  TimeIcon,
  LocationIcon,
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

export default function DriverTripHistoryPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // States
  const [tripHistory, setTripHistory] = useState<DriverTrip[]>([]);
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

    // Load driver trip history data
    loadTripHistoryData();
  }, [isAuthenticated, user, isLoading, router]);

  const loadTripHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API calls
      const mockTripHistory: DriverTrip[] = [
        {
          id: 1,
          trip_number: "TRP-2024-001",
          status: "completed",
          start_location: "Mumbai",
          end_location: "Pune",
          start_time: "2024-09-04T08:00:00Z",
          end_time: "2024-09-04T11:30:00Z",
          distance_km: 150,
          estimated_duration_hours: 3.5,
          actual_duration_hours: 3.5,
          vehicle_id: 1,
          driver_id: 1
        },
        {
          id: 2,
          trip_number: "TRP-2024-002",
          status: "completed",
          start_location: "Delhi",
          end_location: "Gurgaon",
          start_time: "2024-09-03T10:00:00Z",
          end_time: "2024-09-03T12:30:00Z",
          distance_km: 45,
          estimated_duration_hours: 1.5,
          actual_duration_hours: 2.5,
          vehicle_id: 1,
          driver_id: 1
        },
        {
          id: 3,
          trip_number: "TRP-2024-003",
          status: "completed",
          start_location: "Chennai",
          end_location: "Bangalore",
          start_time: "2024-09-02T06:00:00Z",
          end_time: "2024-09-02T12:00:00Z",
          distance_km: 350,
          estimated_duration_hours: 6,
          actual_duration_hours: 6,
          vehicle_id: 1,
          driver_id: 1
        },
        {
          id: 4,
          trip_number: "TRP-2024-004",
          status: "completed",
          start_location: "Kolkata",
          end_location: "Hyderabad",
          start_time: "2024-09-01T07:00:00Z",
          end_time: "2024-09-01T18:00:00Z",
          distance_km: 750,
          estimated_duration_hours: 12,
          actual_duration_hours: 11,
          vehicle_id: 1,
          driver_id: 1
        }
      ];

      setTripHistory(mockTripHistory);
    } catch (err) {
      console.error('Failed to load trip history data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trip history data');
    } finally {
      setLoading(false);
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
          <Button className="mt-4" onClick={loadTripHistoryData}>
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
            Trip History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View your completed trips and performance metrics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ComponentCard title="Total Trips" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <LocationIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tripHistory.length}
              </p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Total Distance" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <LocationIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tripHistory.reduce((sum, trip) => sum + (trip.distance_km || 0), 0)} km
              </p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Avg. Duration" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TimeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tripHistory.length > 0 
                  ? (tripHistory.reduce((sum, trip) => sum + (trip.actual_duration_hours || 0), 0) / tripHistory.length).toFixed(1) 
                  : '0'} hrs
              </p>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Trip History Table */}
      <ComponentCard title="Trip History">
        {tripHistory.length === 0 ? (
          <div className="text-center py-12">
            <TimeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No trip history available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Trip #</TableCell>
                  <TableCell isHeader>Route</TableCell>
                  <TableCell isHeader>Start Time</TableCell>
                  <TableCell isHeader>End Time</TableCell>
                  <TableCell isHeader>Distance</TableCell>
                  <TableCell isHeader>Duration</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tripHistory.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.trip_number}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>📍 {trip.start_location}</div>
                        <div>➡️ {trip.end_location}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(trip.start_time)}</TableCell>
                    <TableCell>{trip.end_time ? formatDate(trip.end_time) : 'N/A'}</TableCell>
                    <TableCell>{trip.distance_km || 'N/A'} km</TableCell>
                    <TableCell>
                      {trip.actual_duration_hours 
                        ? `${trip.actual_duration_hours} hrs` 
                        : trip.estimated_duration_hours 
                          ? `${trip.estimated_duration_hours} hrs (est)` 
                          : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge color={getStatusBadgeColor(trip.status)}>
                        {trip.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/driver-trips/${trip.id}`)}
                      >
                        View Details
                      </Button>
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