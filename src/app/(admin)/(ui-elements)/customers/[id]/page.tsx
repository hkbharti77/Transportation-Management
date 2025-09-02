"use client";

import React, { useState, useEffect } from "react";
import UserDetailsCard from "@/components/ui-elements/user-management/UserDetailsCard";
import { useRouter, useParams } from "next/navigation";
import { userService } from "@/services/userService";
import { type User } from "@/services/userService";

export default function CustomerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = Number(params.id);
  const [customer, setCustomer] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;
      
      try {
        const customerData = await userService.getUserById(customerId);
        setCustomer(customerData);
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        alert("Failed to fetch customer data. Please try again.");
        router.push('/customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, router]);

  const handleEdit = () => {
    router.push(`/customers/${customerId}/edit`);
  };

  const handleDelete = async () => {
    if (!customerId) return;
    
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      await userService.deleteUser(customerId);
      alert("Customer deleted successfully!");
      router.push('/customers');
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Failed to delete customer. Please try again.");
    }
  };

  const handleToggleStatus = async () => {
    if (!customer) return;
    
    try {
      await userService.toggleUserStatus(customer.id!, !customer.is_active);
      setCustomer(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
    } catch (error) {
      console.error("Failed to toggle customer status:", error);
      alert("Failed to update customer status. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    if (!customerId) return;
    
    try {
      await userService.resetUserPassword(customerId);
      alert("Password reset email sent to customer successfully!");
    } catch (error) {
      console.error("Failed to reset password:", error);
      alert("Failed to reset password. Please try again.");
    }
  };

  const handleRoleChange = async (role: string) => {
    if (!customerId) return;
    
    try {
      await userService.changeUserRole(customerId, role);
      setCustomer(prev => prev ? { ...prev, role: role as "admin" | "staff" | "customer" | "public_service_manager" } : null);
      alert("Customer role updated successfully!");
    } catch (error) {
      console.error("Failed to change customer role:", error);
      alert("Failed to update customer role. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading customer data...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Customer not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Customer Details
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/customers')}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Back to Customers
            </button>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <UserDetailsCard
            user={customer}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onResetPassword={handleResetPassword}
            onRoleChange={handleRoleChange}
            isLoading={false}
            isAdmin={true}
            isOwnProfile={false}
          />
        </div>
      </div>
    </div>
  );
}
