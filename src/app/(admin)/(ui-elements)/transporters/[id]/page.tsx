"use client";

import React, { useState, useEffect } from "react";
import UserDetailsCard from "@/components/ui-elements/user-management/UserDetailsCard";
import { useRouter, useParams } from "next/navigation";
import { userService } from "@/services/userService";
import { type User } from "@/services/userService";

export default function TransporterDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const transporterId = Number(params.id);
  const [transporter, setTransporter] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleEdit = () => {
    router.push(`/transporters/${transporterId}/edit`);
  };

  const handleDelete = async () => {
    if (!transporterId) return;
    
    if (!confirm("Are you sure you want to delete this transporter?")) {
      return;
    }

    try {
      await userService.deleteUser(transporterId);
      alert("Transporter deleted successfully!");
      router.push('/transporters');
    } catch (error) {
      console.error("Failed to delete transporter:", error);
      alert("Failed to delete transporter. Please try again.");
    }
  };

  const handleToggleStatus = async () => {
    if (!transporter) return;
    
    try {
      await userService.toggleUserStatus(transporter.id!, !transporter.is_active);
      setTransporter(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
    } catch (error) {
      console.error("Failed to toggle transporter status:", error);
      alert("Failed to update transporter status. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    if (!transporterId) return;
    
    try {
      await userService.resetUserPassword(transporterId);
      alert("Password reset email sent to transporter successfully!");
    } catch (error) {
      console.error("Failed to reset password:", error);
      alert("Failed to reset password. Please try again.");
    }
  };

  const handleRoleChange = async (role: string) => {
    if (!transporterId) return;
    
    try {
      await userService.changeUserRole(transporterId, role);
      setTransporter(prev => prev ? { ...prev, role: role as "admin" | "staff" | "customer" | "public_service_manager" } : null);
      alert("Transporter role updated successfully!");
    } catch (error) {
      console.error("Failed to change transporter role:", error);
      alert("Failed to update transporter role. Please try again.");
    }
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
            Transporter Details
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/transporters')}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Back to Transporters
            </button>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <UserDetailsCard
            user={transporter}
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
