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
  BoxIcon,
  TaskIcon, 
  TimeIcon,
  LocationIcon
} from "@/icons";

// Interfaces for driver-specific data
interface DriverOrder {
  id: number;
  order_number: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  pickup_location: string;
  delivery_location: string;
  scheduled_date: string;
  customer_name: string;
}

interface DriverTrip {
  id: number;
  trip_number: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  start_location: string;
  end_location: string;
  start_time: string;
  end_time?: string;
  distance_km?: number;
}

interface DriverVehicle {
  id: number;
  truck_number: string;
  number_plate: string;
  truck_type: string;
  status: string;
  fuel_level?: number;
  last_maintenance?: string;
}

export default function DriverDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // States
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [activeTrips, setActiveTrips] = useState<DriverTrip[]>([]);
  const [tripHistory, setTripHistory] = useState<DriverTrip[]>([]);
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

    // Only allow drivers to access this dashboard
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

    // Load driver dashboard data
    loadDriverData();
  }, [isAuthenticated, user, isLoading, router]);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API calls
      // In real implementation, these would be API calls to driver-specific endpoints

      // Load assigned orders
      const mockOrders: DriverOrder[] = [
        {
          id: 1,
          order_number: "ORD-2024-001",
          status: "assigned",
          pickup_location: "Warehouse A, Mumbai",
          delivery_location: "Store B, Pune",
          scheduled_date: "2024-09-05T09:00:00Z",
          customer_name: "ABC Corporation"
        },
        {
          id: 2,
          order_number: "ORD-2024-002", 
          status: "in_progress",
          pickup_location: "Factory C, Delhi",
          delivery_location: "Distribution Center D, Gurgaon",
          scheduled_date: "2024-09-04T14:00:00Z",
          customer_name: "XYZ Industries"
        }
      ];

      // Load active trips
      const mockActiveTrips: DriverTrip[] = [
        {
          id: 1,
          trip_number: "TRP-2024-001",
          status: "in_progress",
          start_location: "Mumbai",
          end_location: "Pune",
          start_time: "2024-09-04T08:00:00Z",
          distance_km: 150
        }
      ];

      // Load trip history
      const mockTripHistory: DriverTrip[] = [
        {
          id: 2,
          trip_number: "TRP-2024-002",
          status: "completed", 
          start_location: "Delhi",
          end_location: "Gurgaon",
          start_time: "2024-09-03T10:00:00Z",
          end_time: "2024-09-03T12:30:00Z",
          distance_km: 45
        },
        {
          id: 3,
          trip_number: "TRP-2024-003",
          status: "completed",
          start_location: "Chennai",
          end_location: "Bangalore", 
          start_time: "2024-09-02T06:00:00Z",
          end_time: "2024-09-02T12:00:00Z",
          distance_km: 350
        }
      ];

      // Load assigned vehicle
      const mockVehicle: DriverVehicle = {
        id: 1,
        truck_number: "TRK-001",
        number_plate: "MH-01-AB-1234",
        truck_type: "Large Truck",
        status: "available",
        fuel_level: 75,
        last_maintenance: "2024-08-25"
      };

      setOrders(mockOrders);
      setActiveTrips(mockActiveTrips);
      setTripHistory(mockTripHistory);
      setAssignedVehicle(mockVehicle);

    } catch (err) {
      console.error('Failed to load driver data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      // API call to update order status
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      // await driverService.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as DriverOrder['status'] }
          : order
      ));
    } catch (err) {
      console.error('Failed to update order status:', err);
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
      case 'assigned':
      case 'scheduled':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'light';
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <Button onClick={loadDriverData} className="mt-4">
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
            Driver Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.name}! Manage your orders, trips, and vehicle.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ComponentCard title="Active Orders" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TaskIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'assigned' || o.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Active Trips" className="p-6">
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

        <ComponentCard title="Completed Trips" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TimeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tripHistory.length}
              </p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Vehicle Status" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BoxIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {assignedVehicle?.status || 'No Vehicle'}
              </p>
              <p className="text-sm text-gray-500">
                {assignedVehicle?.number_plate || 'Not Assigned'}
              </p>
            </div>
          </div>
        </ComponentCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Assigned Orders */}
        <ComponentCard title="My Orders">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <TaskIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {order.order_number}
                    </h4>
                    <Badge color={getStatusBadgeColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Customer: {order.customer_name}
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>📍 From: {order.pickup_location}</p>
                    <p>📍 To: {order.delivery_location}</p>
                    <p>⏰ Scheduled: {formatDate(order.scheduled_date)}</p>
                  </div>
                  {order.status === 'assigned' && (
                    <Button 
                      size="sm" 
                      className="mt-3"
                      onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}
                    >
                      Start Order
                    </Button>
                  )}
                  {order.status === 'in_progress' && (
                    <Button 
                      size="sm" 
                      className="mt-3"
                      onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                    >
                      Complete Order
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ComponentCard>

        {/* Active Trips */}
        <ComponentCard title="Active Trips">
          {activeTrips.length === 0 ? (
            <div className="text-center py-8">
              <LocationIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active trips</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTrips.map((trip) => (
                <div key={trip.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {trip.trip_number}
                    </h4>
                    <Badge color={getStatusBadgeColor(trip.status)}>
                      {trip.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>📍 From: {trip.start_location}</p>
                    <p>📍 To: {trip.end_location}</p>
                    <p>⏰ Started: {formatDate(trip.start_time)}</p>
                    {trip.distance_km && (
                      <p>📏 Distance: {trip.distance_km} km</p>
                    )}
                  </div>
                  {trip.status === 'in_progress' && (
                    <Button 
                      size="sm" 
                      className="mt-3"
                      onClick={() => handleUpdateTripStatus(trip.id, 'completed')}
                    >
                      Complete Trip
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ComponentCard>
      </div>

      {/* My Vehicle */}
      {assignedVehicle && (
        <ComponentCard title="My Vehicle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicle</label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {assignedVehicle.truck_number}
              </p>
              <p className="text-sm text-gray-500">{assignedVehicle.number_plate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {assignedVehicle.truck_type}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
              <div className="mt-1">
                <Badge color={assignedVehicle.status === 'available' ? 'success' : 'warning'}>
                  {assignedVehicle.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fuel Level</label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {assignedVehicle.fuel_level || 'N/A'}%
              </p>
            </div>
          </div>
        </ComponentCard>
      )}

      {/* Recent Trip History */}
      <ComponentCard title="Recent Trip History">
        {tripHistory.length === 0 ? (
          <div className="text-center py-8">
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
                  <TableCell isHeader>Date</TableCell>
                  <TableCell isHeader>Duration</TableCell>
                  <TableCell isHeader>Distance</TableCell>
                  <TableCell isHeader>Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tripHistory.slice(0, 5).map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.trip_number}</TableCell>
                    <TableCell>
                      {trip.start_location} → {trip.end_location}
                    </TableCell>
                    <TableCell>{formatDate(trip.start_time)}</TableCell>
                    <TableCell>
                      {trip.end_time ? (
                        `${Math.round((new Date(trip.end_time).getTime() - new Date(trip.start_time).getTime()) / (1000 * 60 * 60 * 24))} hrs`
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{trip.distance_km} km</TableCell>
                    <TableCell>
                      <Badge color={getStatusBadgeColor(trip.status)}>
                        {trip.status}
                      </Badge>
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