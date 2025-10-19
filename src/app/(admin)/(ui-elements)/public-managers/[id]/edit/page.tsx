"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { userService, User } from "@/services/userService";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { 
  ChevronLeftIcon,
  UserIcon,
  EnvelopeIcon,
  UserIcon as PhoneIcon,
  CheckLineIcon
} from "@/icons";

interface EditPublicManagerData {
  name: string;
  email: string;
  phone: string;
}

export default function EditPublicManagerPage() {
  const router = useRouter();
  const params = useParams();
  const managerId = Number(params.id);
  const [manager, setManager] = useState<User | null>(null);
  const [formData, setFormData] = useState<EditPublicManagerData>({
    name: "",
    email: "",
    phone: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadManager = useCallback(async () => {
    try {
      setLoading(true);
      const managerData = await userService.getUserById(managerId);
      setManager(managerData);
      setFormData({
        name: managerData.name || "",
        email: managerData.email || "",
        phone: managerData.phone || ""
      });
    } catch (err) {
      console.error('Error loading manager:', err);
      alert('Failed to load manager details');
      router.push('/public-managers');
    } finally {
      setLoading(false);
    }
  }, [managerId, router]);

  useEffect(() => {
    if (managerId) {
      loadManager();
    }
  }, [managerId, loadManager]);

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
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      await userService.updateUser(managerId, updateData);
      alert("Public service manager updated successfully!");
      router.push(`/public-managers/${managerId}`);
    } catch (error) {
      console.error("Failed to update public service manager:", error);
      alert("Failed to update public service manager. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/public-managers/${managerId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Manager Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The manager you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/public-managers')}>
            Back to Public Managers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/public-managers/${managerId}`)}
              className="flex items-center gap-2"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back to Manager Details
            </Button>
            <h2 className="text-title-md2 font-bold text-black dark:text-white">
              Edit Public Service Manager
            </h2>
          </div>
        </div>

        <ComponentCard title="Edit Manager Information">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Edit Manager Information
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update the details below to modify the public service manager account.
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
                    Updating...
                  </div>
                ) : (
                  "Update Manager"
                )}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}
