import React from "react";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import Image from "next/image";
import { Modal } from "../../ui/modal";
import { useRouter } from "next/navigation";
import { type User } from "../../../services/userService";

interface UserDetailsCardProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onResetPassword: () => void;
  onRoleChange: (role: string) => void;
  isLoading?: boolean;
  isAdmin?: boolean;
}

export default function UserDetailsCard({
  user,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword,
  onRoleChange,
  isLoading = false,
  isAdmin = false,
}: UserDetailsCardProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showRoleModal, setShowRoleModal] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState(user.role);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "staff":
        return "warning";
      case "customer":
        return "success";
      case "public_service_manager":
        return "info";
      default:
        return "light";
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? "success" : "error";
  };

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "staff", label: "Staff" },
    { value: "customer", label: "Customer" },
    { value: "public_service_manager", label: "Public Service Manager" },
  ];

  const handleRoleChange = () => {
    onRoleChange(selectedRole);
    setShowRoleModal(false);
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 overflow-hidden rounded-full">
            <Image
              width={64}
              height={64}
              src={user.avatar || "/images/user/user-17.jpg"}
              alt={user.name}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {user.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              User ID: {user.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            size="md"
            color={getStatusBadgeColor(user.is_active)}
          >
            {user.is_active ? "Active" : "Inactive"}
          </Badge>
          <Badge
            size="md"
            color={getRoleBadgeColor(user.role)}
          >
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </div>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <p className="text-gray-900 dark:text-white/90">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <p className="text-gray-900 dark:text-white/90">{user.phone}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Created
            </label>
            <p className="text-gray-900 dark:text-white/90">
              {user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) : "N/A"}
            </p>
          </div>

          {user.updated_at && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Updated
              </label>
              <p className="text-gray-900 dark:text-white/90">
                {new Date(user.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={onEdit}
          disabled={isLoading}
        >
          Edit User
        </Button>

        {/* Admin-only actions */}
        {isAdmin && (
          <>
            <Button
              variant="outline"
              onClick={onToggleStatus}
              disabled={isLoading}
            >
              {user.is_active ? "Deactivate" : "Activate"} User
            </Button>

            <Button
              variant="outline"
              onClick={onResetPassword}
              disabled={isLoading}
            >
              Reset Password
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowRoleModal(true)}
              disabled={isLoading}
            >
              Change Role
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/users/${user.id}/payments`)}
            >
              View Payments
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              disabled={isLoading}
              className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400"
            >
              Delete User
            </Button>
          </>
        )}

        
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className="max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400"
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Delete User
            </h3>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone and will permanently remove the user from the system.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Role Change Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        className="max-w-md"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Change User Role
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select New Role
            </label>
            <select
              value={selectedRole}
                             onChange={(e) => setSelectedRole(e.target.value as "admin" | "staff" | "customer" | "public_service_manager")}
              className="w-full h-11 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Changing the role will affect the user&apos;s permissions and access levels in the system.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRoleModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={selectedRole === user.role}
            >
              Update Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
