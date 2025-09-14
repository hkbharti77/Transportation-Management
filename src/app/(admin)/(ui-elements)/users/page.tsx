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

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    role: "",
    status: "",
  });
  const [apiError, setApiError] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);



  // Check authentication on component mount
  useEffect(() => {
    if (!userService.isAuthenticated()) {
      router.push('/signin');
      return;
    }
  }, [router]);

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await userService.getUsersWithPagination(
          currentPage,
          10,
          {
            role: filters.role,
            is_active: filters.status === "active" ? true : filters.status === "inactive" ? false : undefined,
            search: searchQuery,
          }
        );
        setUsers(response.data);
        setFilteredUsers(response.data);
        
        // Get total count for accurate pagination
        try {
          const totalCount = await userService.getUsersCount({
            role: filters.role,
            is_active: filters.status === "active" ? true : filters.status === "inactive" ? false : undefined,
            search: searchQuery,
          });
          setTotalUsers(totalCount);
          setTotalPages(Math.ceil(totalCount / 10));
        } catch (error) {
          console.warn("Could not get total count, using current page data:", error);
          setTotalUsers(response.data.length);
          setTotalPages(Math.ceil(response.data.length / 10));
        }
        setApiError(false);
        setApiSuccess(true);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        // Fallback to empty array if API fails
        setUsers([]);
        setFilteredUsers([]);
        setTotalPages(1);
        setApiError(true);
        // Show a more user-friendly error message
        console.log("API not available, using empty data. Please ensure your backend is running on http://localhost:8000");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, filters, searchQuery]);

  useEffect(() => {
    // Apply search and filters
    let filtered = users;

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      );
    }

    // Apply role filter
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Apply status filter
    if (filters.status) {
      const isActive = filters.status === "active";
      filtered = filtered.filter(user => user.is_active === isActive);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / 10));
  }, [users, searchQuery, filters]);

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

  const handleEdit = (user: User) => {
    router.push(`/users/${user.id}/edit`);
  };

  const handleViewProfile = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handleDelete = async (userId: number) => {
    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setFilteredUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  // Get current page users
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div>
      {apiError && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                API Connection Issue
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Unable to connect to the backend API. Please ensure your backend server is running on http://localhost:8000
              </p>
            </div>
            <div className="ml-4">
              <input
                type="text"
                placeholder="Enter Bearer token"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-80"
                onChange={(e) => {
                  if (e.target.value) {
                    localStorage.setItem('access_token', e.target.value);
                    setApiError(false);
                    // Refresh the page to retry API calls
                    window.location.reload();
                  }
                }}
              />
              <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                Paste your Bearer token here to test API connection
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem('access_token');
                  setApiError(true);
                  setApiSuccess(false);
                  window.location.reload();
                }}
                className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded border border-red-200 hover:bg-red-200"
              >
                Clear Token
              </button>
            </div>
          </div>
        </div>
      )}
      
      {apiSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                API Connected Successfully!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Successfully connected to backend API. Found {totalUsers} total users.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          User Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      <UserSearchFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        onReset={handleReset}
        isLoading={isLoading}
      />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-5 lg:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Users ({filteredUsers.length} of {totalUsers})
            </h2>
          </div>

                     {isLoading ? (
                       <div className="flex items-center justify-center p-8">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                       </div>
                     ) : currentUsers.length === 0 ? (
                       <div className="text-center py-8">
                         <p className="text-gray-500 dark:text-gray-400">No users found</p>
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
                                   User
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
                                   Role
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
                               {currentUsers.map((user) => (
                                 <TableRow key={user.id}>
                                   <TableCell className="px-5 py-4 sm:px-6 text-start">
                                     <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                         <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                           {user.name.charAt(0).toUpperCase()}
                                         </span>
                                       </div>
                                       <div>
                                         <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                           {user.name}
                                         </span>
                                       </div>
                                     </div>
                                   </TableCell>
                                   <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                     {user.email}
                                   </TableCell>
                                   <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                     {user.phone || 'N/A'}
                                   </TableCell>
                                   <TableCell className="px-4 py-3 text-start">
                                     <Badge
                                       size="sm"
                                       color={
                                         user.role === 'admin' ? 'error' :
                                         user.role === 'staff' ? 'warning' :
                                         user.role === 'customer' ? 'success' : 'info'
                                       }
                                     >
                                       {user.role?.replace('_', ' ').toUpperCase()}
                                     </Badge>
                                   </TableCell>
                                   <TableCell className="px-4 py-3 text-start">
                                     <Badge
                                       size="sm"
                                       color={user.is_active ? 'success' : 'error'}
                                     >
                                       {user.is_active ? 'Active' : 'Inactive'}
                                     </Badge>
                                   </TableCell>
                                   <TableCell className="px-4 py-3 text-start">
                                     <div className="flex items-center gap-2">
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         onClick={() => handleViewProfile(user)}
                                       >
                                         View
                                       </Button>
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         onClick={() => handleEdit(user)}
                                       >
                                         Edit
                                       </Button>
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         onClick={() => handleDelete(user.id!)}
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

          {filteredUsers.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white/90 mb-2">
                No users found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || Object.values(filters).some(f => f)
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first user."
                }
              </p>
              {!searchQuery && !Object.values(filters).some(f => f) && (
                <button
                  onClick={() => router.push("/users/create")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                >
                  Create User
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
