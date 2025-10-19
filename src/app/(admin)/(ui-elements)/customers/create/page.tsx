"use client";

import React, { useState } from "react";
import UserForm from "@/components/ui-elements/user-management/UserForm";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { type User } from "@/services/userService";

export default function CreateCustomerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      // Ensure the role is set to customer for new customers
      const customerData = {
        ...userData,
        role: 'customer' as const
      };
      
      await userService.createUser(customerData);
      alert("Customer created successfully!");
      router.push('/customers');
    } catch (error) {
      console.error("Failed to create customer:", error);
      alert("Failed to create customer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/customers');
  };

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Create New Customer
          </h2>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <UserForm
            user={null}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            mode="create"
          />
        </div>
      </div>
    </div>
  );
}
