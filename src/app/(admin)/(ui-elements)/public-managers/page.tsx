"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService, User, PaginatedResponse } from "@/services/userService";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon,
  TrashBinIcon,
  UserIcon
} from "@/icons";

export default function PublicManagersPage() {
  const router = useRouter();
  const [publicManagers, setPublicManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalManagers, setTotalManagers] = useState(0);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadPublicManagers();
  }, [currentPage, limit]);

  const loadPublicManagers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get users with public_service_manager role
      const response: PaginatedResponse<User> = await userService.getUsersWithPagination(
        currentPage,
        limit,
        'public_service_manager'
      );
      
      setPublicManagers(response.data || []);
      setTotalManagers(response.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load public service managers';
      setError(errorMessage);
      console.error('Error loading public service managers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const allManagers = await userService.getUsers(0, 1000, 'public_service_manager');
        const filtered = allManagers.filter(manager => 
          manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manager.phone.includes(searchTerm)
        );
        setPublicManagers(filtered);
        setTotalManagers(filtered.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    } else {
      loadPublicManagers();
    }
  };

  const handleCreateManager = () => {
    router.push('/public-managers/create');
  };

  const handleViewManager = (manager: User) => {
    router.push(`/public-managers/${manager.id}`);
  };

  const handleEditManager = (manager: User) => {
    router.push(`/public-managers/${manager.id}/edit`);
  };

  const handleDeleteManager = async (managerId: number) => {
    if (!confirm('Are you sure you want to delete this public service manager?')) {
      return;
    }

    try {
      await userService.deleteUser(managerId);
      setPublicManagers(prev => prev.filter(manager => manager.id !== managerId));
      setTotalManagers(prev => prev - 1);
    } catch (err) {
      alert('Failed to delete public service manager');
      console.error('Error deleting manager:', err);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant="info">{role.replace('_', ' ').toUpperCase()}</Badge>
    );
  };

  if (loading && publicManagers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Public Service Managers
          </h2>
          <Button onClick={handleCreateManager} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add New Manager
          </Button>
        </div>

        <ComponentCard>
          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 max-w-md items-center gap-2">
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                defaultValue={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                Search
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="font-medium">Name</TableCell>
                  <TableCell className="font-medium">Email</TableCell>
                  <TableCell className="font-medium">Phone</TableCell>
                  <TableCell className="font-medium">Role</TableCell>
                  <TableCell className="font-medium">Status</TableCell>
                  <TableCell className="font-medium">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publicManagers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No public service managers found
                    </TableCell>
                  </TableRow>
                ) : (
                  publicManagers.map((manager) => (
                    <TableRow key={manager.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                          {manager.name}
                        </div>
                      </TableCell>
                      <TableCell>{manager.email}</TableCell>
                      <TableCell>{manager.phone}</TableCell>
                      <TableCell>{getRoleBadge(manager.role)}</TableCell>
                      <TableCell>{getStatusBadge(manager.is_active)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewManager(manager)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditManager(manager)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteManager(manager.id!)}
                          >
                            <TrashBinIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalManagers > limit && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalManagers)} of {totalManagers} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * limit >= totalManagers}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
