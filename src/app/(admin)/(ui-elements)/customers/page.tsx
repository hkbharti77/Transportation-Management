"use client";

import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import UserSearchFilter from "@/components/ui-elements/user-management/UserSearchFilter";
import Pagination from "@/components/tables/Pagination";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { type User } from "@/services/userService";

interface FilterOptions {
  role: string;
  status: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<User[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    role: "",
    status: "",
  });
  const [apiError, setApiError] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);
  const pagination = {
    skip: 0,
    limit: 100,
    total: 0
  };

  // Check authentication on component mount
  useEffect(() => {
    if (!userService.isAuthenticated()) {
      router.push('/signin');
      return;
    }

    // Check if user is admin
    if (!userService.isCurrentUserAdmin()) {
      // Redirect based on user role
      if (userService.getCurrentUserFromStorage()?.role === 'customer') {
        router.push('/dashboard'); // Customer dashboard
      } else if (userService.getCurrentUserFromStorage()?.role === 'public_service_manager') {
        router.push('/transporter-dashboard'); // Transporter dashboard
      } else {
        router.push('/users'); // Other non-admin users
      }
      return;
    }
  }, [router]);

  useEffect(() => {
    // Fetch customers from API
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const skip = (currentPage - 1) * pagination.limit;
        const response = await userService.getCustomers(skip, pagination.limit);
        
        setCustomers(response);
        setFilteredCustomers(response);
        setTotalPages(Math.ceil(response.length / pagination.limit));
        setApiError(false);
        setApiSuccess(true);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        // Fallback to empty array if API fails
        setCustomers([]);
        setFilteredCustomers([]);
        setTotalPages(1);
        setApiError(true);
        console.log("API not available, using empty data. Please ensure your backend is running on http://127.0.0.1:8000");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [currentPage, pagination.limit]);

  // Filter customers based on search and filters
  useEffect(() => {
    let filtered = customers;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(customer =>
        (customer.name && customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchQuery))
      );
    }

    // Apply role filter
    if (filters.role) {
      filtered = filtered.filter(customer => customer.role === filters.role);
    }

    // Apply status filter
    if (filters.status) {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(customer => customer.is_active === isActive);
    }

    setFilteredCustomers(filtered);
    setTotalPages(Math.ceil(filtered.length / pagination.limit));
    setCurrentPage(1); // Reset to first page when filters change
  }, [customers, searchQuery, filters, pagination.limit]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilters({ role: "", status: "" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (customer: User) => {
    router.push(`/customers/${customer.id}/edit`);
  };

  const handleDelete = async (customerId: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      await userService.deleteUser(customerId);
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
      setFilteredCustomers(prev => prev.filter(customer => customer.id !== customerId));
      alert("Customer deleted successfully!");
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Failed to delete customer. Please try again.");
    }
  };


  const handleViewProfile = (customer: User) => {
    router.push(`/customers/${customer.id}`);
  };

  // Get current page customers
  const itemsPerPage = pagination.limit;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Customer Management
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/customers/create')}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
              Add New Customer
            </button>
          </div>
        </div>

        {apiError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  API Connection Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  Unable to connect to the backend API. Please ensure your backend is running on http://127.0.0.1:8000
                </div>
              </div>
            </div>
          </div>
        )}

        {apiSuccess && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Connected to API
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  Successfully connected to the backend API
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <UserSearchFilter
              onSearch={handleSearch}
              onFilter={handleFilter}
              onReset={handleReset}
              isLoading={isLoading}
            />
            
            <div className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : currentCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No customers found</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                  <div className="max-w-full overflow-x-auto">
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Customer
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Email
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Phone
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Status
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {currentCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {customer.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                    {customer.name}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {customer.email}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {customer.phone || 'N/A'}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              <Badge
                                size="sm"
                                color={customer.is_active ? 'success' : 'error'}
                              >
                                {customer.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewProfile(customer)}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(customer)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(customer.id!)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>

            {filteredCustomers.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {!isLoading && filteredCustomers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No customers found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                  {searchQuery || Object.values(filters).some(f => f) 
                    ? "No customers match your current search criteria. Try adjusting your filters."
                    : "There are no customers in the system yet. Get started by adding your first customer."
                  }
                </p>
                {!searchQuery && !Object.values(filters).some(f => f) && (
                  <button
                    onClick={() => router.push('/customers/create')}
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                  >
                    Add First Customer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
