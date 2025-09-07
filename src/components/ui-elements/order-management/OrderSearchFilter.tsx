import React, { useState } from "react";
import Button from "../../ui/button/Button";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import Label from "../../form/Label";
import { OrderFilterOptions } from "../../../services/orderService";

interface OrderSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: OrderFilterOptions) => void;
  onReset: () => void;
  isLoading?: boolean;
  onCreateOrder?: () => void;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const cargoTypeOptions = [
  { value: "", label: "All Cargo Types" },
  { value: "general", label: "General Cargo" },
  { value: "fragile", label: "Fragile Items" },
  { value: "hazardous", label: "Hazardous Materials" },
  { value: "perishable", label: "Perishable Goods" },
  { value: "liquid", label: "Liquid Cargo" },
  { value: "bulk", label: "Bulk Cargo" },
];

export default function OrderSearchFilter({
  onSearch,
  onFilter,
  onReset,
  isLoading = false,
  onCreateOrder
}: OrderSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OrderFilterOptions>({
    status: "",
    cargo_type: "",
    date_from: "",
    date_to: "",
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (field: keyof OrderFilterOptions, value: string) => {
    const newFilters = {
      ...filters,
      [field]: value
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilters({
      status: "",
      cargo_type: "",
      date_from: "",
      date_to: "",
    });
    onReset();
  };

  return (
    <div className="space-y-4">
      {/* Main Search and Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
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
            <Input
              type="text"
              placeholder="Search orders by pickup location, drop location, or cargo..."
              defaultValue={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
              disabled={isLoading}
            />
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

          {onCreateOrder && (
            <Button
              onClick={onCreateOrder}
              disabled={isLoading}
            >
              Create Order
            </Button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select
                options={statusOptions}
                placeholder="Filter by status"
                onChange={(value) => handleFilterChange("status", value)}
                defaultValue={filters.status}
              />
            </div>

            {/* Cargo Type Filter */}
            <div>
              <Label htmlFor="cargo-type-filter">Cargo Type</Label>
              <Select
                options={cargoTypeOptions}
                placeholder="Filter by cargo type"
                onChange={(value) => handleFilterChange("cargo_type", value)}
                defaultValue={filters.cargo_type}
              />
            </div>

            {/* Date From Filter */}
            <div>
              <Label htmlFor="date-from-filter">From Date</Label>
              <Input
                id="date-from-filter"
                type="date"
                defaultValue={filters.date_from || ""}
                onChange={(e) => handleFilterChange("date_from", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Date To Filter */}
            <div>
              <Label htmlFor="date-to-filter">To Date</Label>
              <Input
                id="date-to-filter"
                type="date"
                defaultValue={filters.date_to || ""}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              Hide Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}