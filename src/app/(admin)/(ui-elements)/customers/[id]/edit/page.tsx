"use client";

import React, { useState, useEffect } from "react";
import UserForm from "@/components/ui-elements/user-management/UserForm";
import { useRouter, useParams } from "next/navigation";
import { userService } from "@/services/userService";
import { type User } from "@/services/userService";

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = Number(params.id);
  const [customer, setCustomer] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    if (!customerId) return;
    
    setIsSubmitting(true);
    try {
      await userService.updateUser(customerId, userData);
      alert("Customer updated successfully!");
      router.push('/customers');
    } catch (error) {
      console.error("Failed to update customer:", error);
      alert("Failed to update customer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/customers');
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
            Edit Customer: {customer.name}
          </h2>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <UserForm
            user={customer}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
}
