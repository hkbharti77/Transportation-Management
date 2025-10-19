'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import OrderForm from './OrderForm';
import { orderService, CreateOrderRequest, Order } from '@/services/orderService';
import { CheckCircleIcon, AlertIcon } from '@/icons';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  onOrderCreated?: (order: Order) => void;
  onOrderUpdated?: (order: Order) => void;
  mode?: "create" | "edit";
}

export default function OrderModal({
  isOpen,
  onClose,
  order,
  onOrderCreated,
  onOrderUpdated,
  mode = "create"
}: OrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (orderData: CreateOrderRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "create") {
        const newOrder = await orderService.createOrder(orderData);
        setSuccess("Transport order created successfully!");
        
        if (onOrderCreated) {
          onOrderCreated(newOrder);
        }
        
        // Close modal after delay
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      } else if (mode === "edit" && order?.id) {
        const updatedOrder = await orderService.updateOrder(order.id, orderData);
        setSuccess("Transport order updated successfully!");
        
        if (onOrderUpdated) {
          onOrderUpdated(updatedOrder);
        }
        
        // Close modal after delay
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${mode} transport order`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {mode === "create" ? "Create New Transport Order" : "Edit Transport Order"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === "create" 
              ? "Fill in the details to create a new transport order"
              : "Update the transport order information"
            }
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {success}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center">
              <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </span>
            </div>
          </div>
        )}

        {/* Order Form */}
        <OrderForm
          order={order}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={isLoading}
          mode={mode}
        />
      </div>
    </Modal>
  );
}