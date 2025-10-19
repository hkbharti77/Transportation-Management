"use client";

import React, { useState, useEffect } from "react";
import UserForm from "@/components/ui-elements/user-management/UserForm";
import { useRouter, useParams } from "next/navigation";
import { userService } from "@/services/userService";
import { type User } from "@/services/userService";

export default function EditTransporterPage() {
  const router = useRouter();
  const params = useParams();
  const transporterId = Number(params.id);
  const [transporter, setTransporter] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTransporter = async () => {
      if (!transporterId) return;
      
      try {
        const transporterData = await userService.getUserById(transporterId);
        setTransporter(transporterData);
      } catch (error) {
        console.error("Failed to fetch transporter:", error);
        alert("Failed to fetch transporter data. Please try again.");
        router.push('/transporters');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransporter();
  }, [transporterId, router]);

  const handleSubmit = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    if (!transporterId) return;
    
    setIsSubmitting(true);
    try {
      await userService.updateUser(transporterId, userData);
      alert("Transporter updated successfully!");
      router.push('/transporters');
    } catch (error) {
      console.error("Failed to update transporter:", error);
      alert("Failed to update transporter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/transporters');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading transporter data...</div>
      </div>
    );
  }

  if (!transporter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Transporter not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Edit Transporter: {transporter.name}
          </h2>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <UserForm
            user={transporter}
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
