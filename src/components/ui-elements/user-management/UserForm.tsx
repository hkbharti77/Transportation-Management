import React, { useState, useEffect } from "react";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import Label from "../../form/Label";
import Button from "../../ui/button/Button";
import { useModal } from "../../../hooks/useModal";

interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "customer" | "public_service_manager";
  is_active: boolean;
}

interface UserFormProps {
  user?: User | null;
  onSubmit: (userData: User) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "customer", label: "Customer" },
  { value: "public_service_manager", label: "Public Service Manager" },
];

export default function UserForm({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}: UserFormProps) {
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    phone: "",
    role: "customer",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    if (user && mode === "edit") {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
      });
    }
  }, [user, mode]);

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
      newErrors.phone = "Phone is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as "admin" | "staff" | "customer" | "public_service_manager"
    }));
    
    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: ""
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    if (Object.keys(formData).some(key => formData[key as keyof User] !== user?.[key as keyof User])) {
      openModal();
    } else {
      onCancel();
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {mode === "create" ? "Create New User" : "Edit User"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {mode === "create" 
            ? "Fill in the details below to create a new user account."
            : "Update the user information below."
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Name Field */}
          <div className="lg:col-span-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter full name"
              defaultValue={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              hint={errors.name}
            />
          </div>

          {/* Email Field */}
          <div className="lg:col-span-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              defaultValue={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              hint={errors.email}
              disabled={mode === "edit"} // Email cannot be changed in edit mode
            />
            {mode === "edit" && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed from this interface
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter phone number"
              defaultValue={formData.phone}
              onChange={handleInputChange}
              error={!!errors.phone}
              hint={errors.phone}
            />
          </div>

          {/* Role Field */}
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select
              options={roleOptions}
              placeholder="Select role"
              onChange={handleRoleChange}
              defaultValue={formData.role}
            />
            {errors.role && (
              <p className="mt-1 text-xs text-error-500">{errors.role}</p>
            )}
          </div>

          {/* Status Field */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  is_active: e.target.checked
                }))}
                className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-gray-300 rounded"
              />
              <Label htmlFor="is_active" className="text-sm font-medium">
                Active Account
              </Label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Inactive users cannot log in to the system
            </p>
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
            {isLoading ? "Saving..." : mode === "create" ? "Create User" : "Update User"}
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Discard Changes?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have unsaved changes. Are you sure you want to discard them?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={closeModal}
              >
                Continue Editing
              </Button>
              <Button
                onClick={() => {
                  closeModal();
                  onCancel();
                }}
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
