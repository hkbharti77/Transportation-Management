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
  TaskIcon, 
  LocationIcon,
  AlertIcon
} from "@/icons";

// Interface for driver orders
interface DriverOrder {
  id: number;
  order_number: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  pickup_location: string;
  delivery_location: string;
  scheduled_date: string;
  customer_name: string;
  cargo_type: string;
  weight_kg: number;
  special_instructions?: string;
}

export default function DriverOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // States
  const [orders, setOrders] = useState<DriverOrder[]>([]);
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

    // Load driver orders data
    loadOrdersData();
  }, [isAuthenticated, user, isLoading, router]);

  const loadOrdersData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API calls
      const mockOrders: DriverOrder[] = [
        {
          id: 1,
          order_number: "ORD-2024-001",
          status: "assigned",
          pickup_location: "Warehouse A, Mumbai",
          delivery_location: "Store B, Pune",
          scheduled_date: "2024-09-05T09:00:00Z",
          customer_name: "ABC Corporation",
          cargo_type: "Electronics",
          weight_kg: 1250,
          special_instructions: "Fragile items, handle with care"
        },
        {
          id: 2,
          order_number: "ORD-2024-002", 
          status: "in_progress",
          pickup_location: "Factory C, Delhi",
          delivery_location: "Distribution Center D, Gurgaon",
          scheduled_date: "2024-09-04T14:00:00Z",
          customer_name: "XYZ Industries",
          cargo_type: "Machinery",
          weight_kg: 3500
        },
        {
          id: 3,
          order_number: "ORD-2024-003",
          status: "assigned",
          pickup_location: "Port E, Chennai",
          delivery_location: "Warehouse F, Bangalore",
          scheduled_date: "2024-09-06T10:00:00Z",
          customer_name: "Global Traders",
          cargo_type: "Textiles",
          weight_kg: 800
        },
        {
          id: 4,
          order_number: "ORD-2024-004",
          status: "assigned",
          pickup_location: "Manufacturing Plant G, Hyderabad",
          delivery_location: "Retail Outlet H, Kolkata",
          scheduled_date: "2024-09-07T08:00:00Z",
          customer_name: "Retail Chain Inc",
          cargo_type: "Consumer Goods",
          weight_kg: 2100,
          special_instructions: "Delivery before 5 PM"
        }
      ];

      setOrders(mockOrders);
    } catch (err) {
      console.error('Failed to load orders data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders data');
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
          <Button className="mt-4" onClick={loadOrdersData}>
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
            Assigned Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your assigned delivery orders and update their status
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ComponentCard title="Total Orders" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TaskIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.length}
              </p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Assigned" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TaskIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'assigned').length}
              </p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="In Progress" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <LocationIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Completed" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TaskIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'completed').length}
              </p>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Orders Table */}
      <ComponentCard title="Order List">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <TaskIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders assigned</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Order #</TableCell>
                  <TableCell isHeader>Customer</TableCell>
                  <TableCell isHeader>Cargo</TableCell>
                  <TableCell isHeader>Weight</TableCell>
                  <TableCell isHeader>Route</TableCell>
                  <TableCell isHeader>Scheduled</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.cargo_type}</TableCell>
                    <TableCell>{order.weight_kg} kg</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>📍 {order.pickup_location}</div>
                        <div>➡️ {order.delivery_location}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(order.scheduled_date)}</TableCell>
                    <TableCell>
                      <Badge color={getStatusBadgeColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {order.status === 'assigned' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}
                          >
                            Start
                          </Button>
                        )}
                        {order.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/driver-orders/${order.id}`)}
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