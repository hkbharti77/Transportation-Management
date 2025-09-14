"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { 
  UserIcon,
  EnvelopeIcon,
  UserIcon as PhoneIcon,
  LockIcon,
  CheckLineIcon
} from "@/icons";

interface CreatePublicManagerData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function CreatePublicManagerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreatePublicManagerData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "public_service_manager" as const,
        is_active: true
      };

      await userService.createUser(userData);
      alert("Public service manager created successfully!");
      router.push('/public-managers');
    } catch (error) {
      console.error("Failed to create public service manager:", error);
      alert("Failed to create public service manager. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/public-managers');
  };

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Create New Public Service Manager
          </h2>
        </div>

        <ComponentCard title="Public Service Manager Information">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Public Service Manager Information
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Fill in the details below to create a new public service manager account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Name Field */}
              <div className="lg:col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    defaultValue={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    error={!!errors.name}
                    hint={errors.name}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="lg:col-span-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    defaultValue={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    error={!!errors.email}
                    hint={errors.email}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    defaultValue={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    error={!!errors.phone}
                    hint={errors.phone}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Role Display */}
              <div>
                <Label>Role</Label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  <CheckLineIcon className="h-4 w-4 text-green-500" />
                  Public Service Manager
                </div>
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter password"
                    defaultValue={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    error={!!errors.password}
                    hint={errors.password}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    defaultValue={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    error={!!errors.confirmPassword}
                    hint={errors.confirmPassword}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  "Create Manager"
                )}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}
