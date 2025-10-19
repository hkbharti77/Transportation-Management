"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { userService, User } from "@/services/userService";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { 
  ChevronLeftIcon,
  PencilIcon,
  TrashBinIcon,
  UserIcon
} from "@/icons";

export default function PublicManagerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const managerId = Number(params.id);
  const [manager, setManager] = useState<User | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadManager = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const managerData = await userService.getUserById(managerId);
      setManager(managerData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load manager details';
      setError(errorMessage);
      console.error('Error loading manager:', err);
    } finally {
      setIsLoading(false);
    }
  }, [managerId]);

  useEffect(() => {
    if (managerId) {
      loadManager();
    }
  }, [managerId, loadManager]);

  const handleEdit = () => {
    router.push(`/public-managers/${managerId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this public service manager?')) {
      return;
    }

    try {
      await userService.deleteUser(managerId);
      alert('Public service manager deleted successfully!');
      router.push('/public-managers');
    } catch (error) {
      console.error('Failed to delete manager:', error);
      alert('Failed to delete public service manager. Please try again.');
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="light" color="success">Active</Badge>
    ) : (
      <Badge variant="light" color="error">Inactive</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant="light" color="info">{role.replace('_', ' ').toUpperCase()}</Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !manager) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error ? 'Error Loading Manager' : 'Manager Not Found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "The manager you're looking for doesn't exist or has been removed."}
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
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/public-managers')}
              className="flex items-center gap-2"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back to Public Managers
            </Button>
            <h2 className="text-title-md2 font-bold text-black dark:text-white">
              Public Service Manager Details
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="flex items-center gap-2 text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-700 dark:hover:bg-error-950/20"
            >
              <TrashBinIcon className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <ComponentCard title="Basic Information">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                  <p className="text-lg font-semibold text-black dark:text-white">{manager.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-lg font-semibold text-black dark:text-white">{manager.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                  <p className="text-lg font-semibold text-black dark:text-white">{manager.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Role</label>
                  <div className="mt-1">{getRoleBadge(manager.role)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className="mt-1">{getStatusBadge(manager.is_active)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">ID</label>
                  <p className="text-lg font-semibold text-black dark:text-white">#{manager.id}</p>
                </div>
              </div>
            </ComponentCard>

            {/* Account Information */}
            <ComponentCard title="Account Information">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Type</span>
                  <span className="text-sm text-gray-900 dark:text-white">Public Service Manager</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Access Level</span>
                  <span className="text-sm text-gray-900 dark:text-white">Public Service Management</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Permissions</span>
                  <span className="text-sm text-gray-900 dark:text-white">Manage Public Services</span>
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <ComponentCard title="Quick Actions">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="w-full justify-start"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Manager
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/public-managers')}
                  className="w-full justify-start"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  View All Managers
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="w-full justify-start text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-700 dark:hover:bg-error-950/20"
                >
                  <TrashBinIcon className="h-4 w-4 mr-2" />
                  Delete Manager
                </Button>
              </div>
            </ComponentCard>

            {/* System Information */}
            <ComponentCard title="System Information">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                System Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {manager.created_at ? new Date(manager.created_at).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {manager.updated_at ? new Date(manager.updated_at).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>
      </div>
    </div>
  );
}
