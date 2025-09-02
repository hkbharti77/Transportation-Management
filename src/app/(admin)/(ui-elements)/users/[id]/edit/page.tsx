"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UserForm from "@/components/ui-elements/user-management/UserForm";
import { userService, type User } from "@/services/userService";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);



  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const userId = parseInt(params.id as string);
        const userData = await userService.getUserById(userId);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        // Handle error - could redirect to 404 or show error message
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const handleSubmit = async (userData: User) => {
    setIsSaving(true);
    try {
      if (!user?.id) return;
      await userService.updateUser(user.id, userData);
      alert("User updated successfully!");
      router.push(`/users/${user.id}`);
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/users/${user?.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white/90 mb-2">
          User not found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The user you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/users")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push(`/users/${user.id}`)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit User
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Update user information, role, and account status
        </p>
      </div>

      <UserForm
        user={user}
        mode="edit"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSaving}
      />
    </div>
  );
}
