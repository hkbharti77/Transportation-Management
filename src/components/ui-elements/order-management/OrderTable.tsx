import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import { Order } from "../../../services/orderService";

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: number) => void;
  onAssign?: (order: Order) => void;
  onStatusUpdate?: (order: Order) => void;
  onCancelOrder?: (orderId: number) => void;
  onCompleteOrder?: (orderId: number) => void;
  isLoading?: boolean;
  userRole?: string;
}

export default function OrderTable({
  orders,
  onView,
  onEdit,
  onDelete,
  onAssign,
  onStatusUpdate,
  onCancelOrder,
  onCompleteOrder,
  isLoading = false,
  userRole = 'user'
}: OrderTableProps) {
  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'assigned':
        return 'primary';
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

  const getCargoTypeBadgeColor = (cargoType: Order['cargo_type']) => {
    switch (cargoType) {
      case 'hazardous':
        return 'error';
      case 'fragile':
        return 'warning';
      case 'perishable':
        return 'info';
      case 'liquid':
        return 'primary';
      case 'bulk':
        return 'light';
      default:
        return 'success';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-white"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No orders found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mx-auto">
          No transport orders match your current search criteria. Try adjusting your filters or create a new order.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Order ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Route
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Cargo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Weight
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Pickup Time
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      #{order.id}
                    </div>
                    {order.customer_id && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Customer: {order.customer_id}
                      </div>
                    )}
                    {/* Assignment Status */}
                    <div className="flex items-center space-x-1 mt-1">
                      {order.vehicle_id && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          🚛 V{order.vehicle_id}
                        </span>
                      )}
                      {order.driver_id && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          👤 D{order.driver_id}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="max-w-48">
                      <div className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                        📍 {order.pickup_location}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        📍 {order.drop_location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div>
                      <Badge
                        size="sm"
                        color={getCargoTypeBadgeColor(order.cargo_type)}
                      >
                        {order.cargo_type}
                      </Badge>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-32 truncate">
                        {order.cargo_description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {order.cargo_weight} kg
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="text-sm text-gray-800 dark:text-white/90">
                      {formatDate(order.pickup_time)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Est. Delivery: {formatDate(order.estimated_delivery_time)}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Badge
                      size="sm"
                      color={getStatusBadgeColor(order.status)}
                    >
                      {order.status === 'in_progress' ? 'In Progress' : 
                       order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onView(order)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </Button>
                      {(userRole === 'admin' || userRole === 'driver') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStatusUpdate && onStatusUpdate(order)}
                          className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                          disabled={!onStatusUpdate}
                        >
                          Status
                        </Button>
                      )}
                      {userRole === 'admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAssign && onAssign(order)}
                          className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                          disabled={!onAssign}
                        >
                          Assign
                        </Button>
                      )}
                      {/* Show complete button for orders that can be completed */}
                      {onCompleteOrder && order.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCompleteOrder(order.id!)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Complete
                        </Button>
                      )}
                      {/* Show cancel button for orders that can be cancelled */}
                      {onCancelOrder && order.status !== 'cancelled' && order.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCancelOrder(order.id!)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(order)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(order.id!)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}