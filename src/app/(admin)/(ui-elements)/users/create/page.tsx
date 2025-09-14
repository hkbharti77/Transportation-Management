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
  role: "admin" | "staff" | "customer" | "public_service_manager" | "driver";
  is_active: boolean;
  password?: string; // Optional password for creation
}

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const handleSubmit = (userData: User) => {
    setIsLoading(true);
    setServerErrors({}); // Clear previous errors
    
    // Wrap the async logic in an async function
    const submitAsync = async () => {
      try {
        // First check if email already exists
        const emailExists = await userService.checkEmailExists(userData.email);
        if (emailExists) {
          setServerErrors({ email: "This email address is already registered. Please use a different email address." });
          return;
        }

        await userService.createUser(userData);
        alert("User created successfully!");
        router.push("/users");
      } catch (error) {
        console.error("Failed to create user:", error);
        
        // Handle specific error types
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        
        if (errorMessage.includes("Email already registered")) {
          setServerErrors({ email: "This email address is already registered. Please use a different email address." });
        } else if (errorMessage.includes("422")) {
          // Try to parse field-specific errors from the response
          setServerErrors({ general: "Invalid data provided. Please check all required fields and try again." });
        } else if (errorMessage.includes("401")) {
          alert("Error: Authentication failed. Please log in again.");
          router.push("/login");
        } else if (errorMessage.includes("403")) {
          alert("Error: You don't have permission to create users. Please contact your administrator.");
        } else {
          setServerErrors({ general: errorMessage });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Call the async function
    submitAsync();
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
        serverErrors={serverErrors}
      />
    </div>
  );
}
