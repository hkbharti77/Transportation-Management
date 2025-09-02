"use client";

import React, { useState } from "react";
import UserForm from "@/components/ui-elements/user-management/UserForm";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";

interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "customer" | "public_service_manager";
  is_active: boolean;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (userData: User) => {
    setIsLoading(true);
    try {
      await userService.createUser(userData);
      alert("User created successfully!");
      router.push("/users");
    } catch (error) {
      console.error("Failed to create user:", error);
      alert("Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/users");
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push("/users")}
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
            Create New User
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Add a new user to the system with appropriate role and permissions
        </p>
      </div>

      <UserForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}
