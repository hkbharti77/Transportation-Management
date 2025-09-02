'use client';

import { useState, useEffect } from 'react';
import { userService, User, PaginatedResponse } from '@/services/userService';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Badge from '@/components/ui/badge/Badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ChevronLeftIcon, 
  ChevronDownIcon, 
  PlusIcon, 
  UserIcon,
  EnvelopeIcon,
  CalenderIcon,
  EyeIcon,
  PencilIcon,
  TrashBinIcon
} from '@/icons';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  
  // Toggle status functionality states
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [toggleSuccess, setToggleSuccess] = useState<string | null>(null);
  
  // Role change functionality states
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [driverToChangeRole, setDriverToChangeRole] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);
  const [roleChangeError, setRoleChangeError] = useState<string | null>(null);
  const [roleChangeSuccess, setRoleChangeSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadDrivers();
  }, [currentPage, limit]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedResponse<User> = await userService.getDriversWithPagination(
        currentPage,
        limit
      );
      
      setDrivers(response.data || []);
      
      // Get total count for pagination - handle errors gracefully
      try {
        const total = await userService.getDriversCount();
        setTotalDrivers(total);
      } catch (countError) {
        console.warn('Could not get total drivers count:', countError);
        // Use the current drivers length as fallback
        setTotalDrivers(response.data?.length || 0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load drivers';
      setError(errorMessage);
      console.error('Error loading drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        // For now, we'll filter client-side since the API doesn't show search parameter
        // In a real implementation, you'd pass search to the API
        const allDrivers = await userService.getDrivers(0, 1000);
        const filtered = allDrivers.filter(driver => 
          driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.phone.includes(searchTerm)
        );
        setDrivers(filtered);
        setTotalDrivers(filtered.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    } else {
      loadDrivers();
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleToggleStatus = async (driver: User) => {
    try {
      setToggleLoading(driver.id!);
      setToggleError(null);
      setToggleSuccess(null);
      
      const result = await userService.toggleUserStatus(driver.id!, !driver.is_active);
      
      setToggleSuccess(result.message || `Driver ${!driver.is_active ? 'activated' : 'deactivated'} successfully`);
      
      // Update the driver status in local state
      setDrivers(prev => prev.map(d => 
        d.id === driver.id 
          ? { ...d, is_active: !d.is_active }
          : d
      ));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setToggleSuccess(null);
      }, 3000);
      
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : 'Failed to update driver status');
      console.error('Error toggling driver status:', err);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setToggleError(null);
      }, 5000);
    } finally {
      setToggleLoading(null);
    }
  };

  const handleChangeRole = (driver: User) => {
    setDriverToChangeRole(driver);
    setNewRole(driver.role);
    setRoleModalOpen(true);
    setRoleChangeError(null);
    setRoleChangeSuccess(null);
  };

  const confirmRoleChange = async () => {
    if (!driverToChangeRole || !newRole || newRole === driverToChangeRole.role) {
      return;
    }

    try {
      setRoleChangeLoading(true);
      setRoleChangeError(null);
      
      const result = await userService.changeUserRole(driverToChangeRole.id!, newRole);
      
      setRoleChangeSuccess(result.message || 'User role changed successfully');
      
      // Update the driver role in local state
      setDrivers(prev => prev.map(d => 
        d.id === driverToChangeRole.id 
          ? { ...d, role: newRole as User['role'] }
          : d
      ));
      
      // Close modal after a delay
      setTimeout(() => {
        setRoleModalOpen(false);
        setDriverToChangeRole(null);
        setNewRole('');
        setRoleChangeSuccess(null);
      }, 2000);
      
    } catch (err) {
      setRoleChangeError(err instanceof Error ? err.message : 'Failed to change user role');
      console.error('Error changing user role:', err);
    } finally {
      setRoleChangeLoading(false);
    }
  };

  const cancelRoleChange = () => {
    setRoleModalOpen(false);
    setDriverToChangeRole(null);
    setNewRole('');
    setRoleChangeError(null);
    setRoleChangeSuccess(null);
  };

  const totalPages = Math.ceil(totalDrivers / limit);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'driver':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'staff':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && drivers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Drivers Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor all registered drivers in the system
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add New Driver
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ComponentCard title="Total Drivers" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDrivers}</p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Active Drivers" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {drivers.filter(d => d.is_active).length}
              </p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Inactive Drivers" className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {drivers.filter(d => !d.is_active).length}
              </p>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Search and Filters */}
      <ComponentCard title="Search Drivers">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search drivers by name, email, or phone..."
              defaultValue={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
                if (e.target.value === '' && e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
          <Button onClick={loadDrivers} variant="outline">
            Reset
          </Button>
        </div>
      </ComponentCard>

      {/* Drivers Table */}
      <ComponentCard title="Drivers List">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {drivers.length === 0 && !loading ? (
          <div className="text-center py-8">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No drivers found</p>
            <p className="text-gray-400">Get started by adding your first driver</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Driver</TableCell>
                    <TableCell isHeader>Contact</TableCell>
                    <TableCell isHeader>Role</TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader>Created</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {driver.name}
                            </p>
                            <p className="text-sm text-gray-500">ID: {driver.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            {driver.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-gray-400 mr-2">📞</span>
                            {driver.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge color="info">
                          {driver.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          color={driver.is_active ? 'success' : 'error'}
                        >
                          {driver.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <CalenderIcon className="h-4 w-4 mr-2" />
                          {driver.created_at ? formatDate(driver.created_at) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <TrashBinIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalDrivers)} of {totalDrivers} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </ComponentCard>
    </div>
  );
}
