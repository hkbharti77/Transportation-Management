'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import { orderService, Order } from '@/services/orderService';

interface ActiveOrder extends Order {
  progress?: number;
}

export default function ActiveOrdersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadActiveOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch real active orders from the API
      const activeOrders = await orderService.getActiveOrders();
      
      // Transform the orders to include progress data (this would come from the API in a real implementation)
      const transformedOrders: ActiveOrder[] = activeOrders.map(order => ({
        ...order,
        progress: Math.floor(Math.random() * 40) + 40 // Random progress between 40-80%
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading active orders:', error);
      // Show error message to user
      alert('Failed to load active orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadActiveOrders();
    }
  }, [isAuthenticated, user]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && isAuthenticated && user?.role === 'admin') {
      interval = setInterval(() => {
        loadActiveOrders();
      }, 30000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, isAuthenticated, user]);

  const filteredOrders = orders.filter(order =>
    (order.customer_id?.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
    order.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.drop_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.vehicle_id?.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.driver_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  const getOrderTypeIcon = (cargoType: string) => {
    const icons = {
      general: '📦',
      fragile: '🛡️',
      hazardous: '⚠️',
      perishable: '🍎',
      liquid: '💧',
      bulk: '🚛',
    };
    return icons[cargoType as keyof typeof icons] || '📦';
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

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Active Orders" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚀 Active Orders Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time monitoring of orders currently in progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleAutoRefresh}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </Button>
        </div>
      </div>

      {/* Status Info */}
      <ComponentCard title="Live Order Status">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <p className="text-green-800 dark:text-green-200">
                  <strong>{filteredOrders.length}</strong> orders currently active and in progress
                  {autoRefresh && <span className="ml-2 text-sm">(Auto-refreshing every 30 seconds)</span>}
                </p>
              </div>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Search */}
      <ComponentCard title="Search & Filter">
        <div className="p-6">
          <Input
            type="text"
            placeholder="Search by customer, location, vehicle, or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </ComponentCard>

      {/* Active Orders Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <ComponentCard title="Loading...">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          </ComponentCard>
        ) : filteredOrders.length === 0 ? (
          <ComponentCard title="No Active Orders">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No Orders Found' : 'No Active Orders'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm 
                  ? 'No active orders match your search criteria.'
                  : 'All orders are either pending, completed, or cancelled.'
                }
              </p>
            </div>
          </ComponentCard>
        ) : (
          filteredOrders.map((order) => (
            <ComponentCard key={order.id} title="">
              <div className="p-6">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getOrderTypeIcon(order.cargo_type)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Order #{order.id}</h3>
                      <Badge className={getStatusBadge(order.status || 'in_progress')}>
                        IN PROGRESS
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                    <p className="font-medium text-gray-900 dark:text-white">Customer #{order.customer_id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Route</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {order.pickup_location} → {order.drop_location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Driver</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.driver_id ? `Driver #${order.driver_id}` : 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.vehicle_id ? `Vehicle #${order.vehicle_id}` : 'Not assigned'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="text-lg font-bold text-green-600">${order.total_amount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{order.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${order.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <div>Started: {order.created_at ? formatDate(order.created_at) : 'N/A'}</div>
                    {order.estimated_delivery_time && (
                      <div>Expected: {formatDate(order.estimated_delivery_time)}</div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    className="flex-1 text-blue-600 hover:text-blue-800"
                    variant="ghost"
                  >
                    Track Live
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-green-600 hover:text-green-800"
                    variant="ghost"
                  >
                    Contact Driver
                  </Button>
                </div>
              </div>
            </ComponentCard>
          ))
        )}
      </div>

      {/* Performance Summary */}
      <ComponentCard title="Performance Summary">
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {filteredOrders.length > 0 
                ? Math.round(filteredOrders.reduce((sum, order) => sum + (order.progress || 0), 0) / filteredOrders.length) 
                : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Progress</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${filteredOrders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Revenue</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {filteredOrders.filter(order => (order.progress || 0) > 80).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Near Completion</div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}