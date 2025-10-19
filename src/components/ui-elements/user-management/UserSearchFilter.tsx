import React, { useState, useEffect } from "react";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import Button from "../../ui/button/Button";

interface UserSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onReset: () => void;
  isLoading?: boolean;
}

interface FilterOptions {
  role: string;
  status: string;
}

const roleOptions = [
  { value: "", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "customer", label: "Customer" },
  { value: "public_service_manager", label: "Public Service Manager" },
];

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function UserSearchFilter({
  onSearch,
  onFilter,
  onReset,
  isLoading = false,
}: UserSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    role: "",
    status: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    const newFilters = {
      ...filters,
      [filterType]: value,
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilters({ role: "", status: "" });
    onReset();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search Section */}
        <div className="flex-1">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search users by name, email, or phone..."
              defaultValue={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Toggle and Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                />
              </svg>
            }
          >
            Filters
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </Button>

          <Button
            onClick={() => window.location.href = "/users/create"}
            disabled={isLoading}
          >
            Create User
          </Button>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <Select
                options={roleOptions}
                placeholder="Select role"
                onChange={(value) => handleFilterChange("role", value)}
                defaultValue={filters.role}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <Select
                options={statusOptions}
                placeholder="Select status"
                onChange={(value) => handleFilterChange("status", value)}
                defaultValue={filters.status}
              />
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {filters.role && (
                  <span className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 mr-2 mb-2">
                    Role: {filters.role}
                  </span>
                )}
                {filters.status && (
                  <span className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 mr-2 mb-2">
                    Status: {filters.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
