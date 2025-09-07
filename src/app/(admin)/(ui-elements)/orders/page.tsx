"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import OrderModal from "@/components/ui-elements/order-management/OrderModal";
import OrderTable from "@/components/ui-elements/order-management/OrderTable";
import OrderSearchFilter from "@/components/ui-elements/order-management/OrderSearchFilter";
import AssignOrderModal from "@/components/ui-elements/order-management/AssignOrderModal";
import StatusUpdateModal from "@/components/ui-elements/order-management/StatusUpdateModal";
import Pagination from "@/components/tables/Pagination";
import { orderService, Order, OrderFilterOptions } from "@/services/orderService";
import { useAuth } from "@/context/AuthContext";
import OrdersDebug from "@/components/debug/OrdersDebug";

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // States
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<OrderFilterOptions>({});
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Authentication check
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Only allow admin and staff to access orders management
    if (user?.role !== 'admin' && user?.role !== 'staff') {
      router.push('/dashboard');
      return;
    }

    loadOrders();
  }, [isAuthenticated, user, authLoading, router]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await orderService.getOrders({
        ...filters,
        search: searchQuery,
        page: currentPage,
        limit: ordersPerPage
      });
      
      setOrders(result.data);
      setFilteredOrders(result.data);
      
      // Calculate total pages
      const totalOrders = result.total || result.data.length;
      setTotalPages(Math.ceil(totalOrders / ordersPerPage));
      
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Reload orders when search, filters, or pagination changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadOrders();
    }
  }, [searchQuery, filters, currentPage, isAuthenticated, user]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilter = (newFilters: OrderFilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilters({});
    setCurrentPage(1);
  };

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setIsCreateModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleViewOrder = (order: Order) => {
    // For now, just edit. Could implement a separate view modal later
    handleEditOrder(order);
  };

  const handleAssignOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsAssignModalOpen(true);
  };

  const handleStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusUpdateModalOpen(true);
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await orderService.deleteOrder(orderId);
      setOrders(orders.filter(order => order.id !== orderId));
      setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
      alert('Order deleted successfully!');
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('Failed to delete order. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const cancelledOrder = await orderService.cancelOrder(orderId);
      
      // Update the order in the list
      const updatedOrders = orders.map(order => 
        order.id === orderId ? cancelledOrder : order
      );
      const updatedFilteredOrders = filteredOrders.map(order => 
        order.id === orderId ? cancelledOrder : order
      );
      
      setOrders(updatedOrders);
      setFilteredOrders(updatedFilteredOrders);
      
      alert('Order cancelled successfully!');
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to mark this order as completed?')) {
      return;
    }

    try {
      const completedOrder = await orderService.completeOrder(orderId);
      
      // Update the order in the list
      const updatedOrders = orders.map(order => 
        order.id === orderId ? completedOrder : order
      );
      const updatedFilteredOrders = filteredOrders.map(order => 
        order.id === orderId ? completedOrder : order
      );
      
      setOrders(updatedOrders);
      setFilteredOrders(updatedFilteredOrders);
      
      alert('Order marked as completed successfully!');
    } catch (err) {
      console.error('Failed to complete order:', err);
      alert('Failed to complete order. Please try again.');
    }
  };

  const handleOrderCreated = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
    setFilteredOrders([newOrder, ...filteredOrders]);
    setIsCreateModalOpen(false);
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    const updatedOrders = orders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    );
    const updatedFilteredOrders = filteredOrders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    );
    
    setOrders(updatedOrders);
    setFilteredOrders(updatedFilteredOrders);
    setIsEditModalOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get current orders for display
  const currentOrders = filteredOrders;

  if (authLoading || (isLoading && orders.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Orders Management
          </h2>
          <Button 
            className="flex items-center gap-2"
            onClick={handleCreateOrder}
          >
            <PlusIcon className="h-4 w-4" />
            Create New Order
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button 
              onClick={loadOrders} 
              className="mt-2"
              size="sm"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Debug Component - Remove this after fixing the issue */}
        <div className="mb-6">
          <OrdersDebug />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-white/[0.05] dark:bg-white/[0.03] sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <OrderSearchFilter
              onSearch={handleSearch}
              onFilter={handleFilter}
              onReset={handleReset}
              isLoading={isLoading}
              onCreateOrder={handleCreateOrder}
            />
            
            <div className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-white"></div>
                </div>
              ) : (
                <OrderTable
                  orders={currentOrders}
                  onView={handleViewOrder}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                  onAssign={handleAssignOrder}
                  onStatusUpdate={handleStatusUpdate}
                  onCancelOrder={handleCancelOrder}
                  onCompleteOrder={handleCompleteOrder}
                  isLoading={isLoading}
                  userRole={user?.role}
                />
              )}
            </div>

            {filteredOrders.length > 0 && totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Order Creation Modal */}
        <OrderModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onOrderCreated={handleOrderCreated}
          mode="create"
        />

        {/* Order Edit Modal */}
        <OrderModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          order={selectedOrder}
          onOrderUpdated={handleOrderUpdated}
          mode="edit"
        />

        {/* Order Assignment Modal */}
        <AssignOrderModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          order={selectedOrder}
          onOrderUpdated={handleOrderUpdated}
        />

        {/* Status Update Modal */}
        <StatusUpdateModal
          isOpen={isStatusUpdateModalOpen}
          onClose={() => setIsStatusUpdateModalOpen(false)}
          order={selectedOrder}
          onOrderUpdated={handleOrderUpdated}
          userRole={user?.role}
        />
      </div>
    </div>
  );
}
