'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import AvailableDrivers from '@/components/ui-elements/dispatch-management/AvailableDrivers';
import { AvailableDriver, dispatchService } from '@/services/dispatchService';

export default function AvailableDriversPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedDriver, setSelectedDriver] = useState<AvailableDriver | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [assignmentMode, setAssignmentMode] = useState(false);
  const [dispatchId, setDispatchId] = useState<number | null>(null);

  // Authentication check
  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Check if user is admin or staff
    if (user?.role && !['admin', 'staff'].includes(user.role)) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin/staff
  if (!isAuthenticated || (user?.role && !['admin', 'staff'].includes(user.role))) {
    return null;
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDriverSelect = (driver: AvailableDriver) => {
    setSelectedDriver(driver);
    console.log('Selected driver:', driver);
  };

  const handleAssignToDispatch = async () => {
    if (!selectedDriver || !dispatchId) {
      alert('Please select a driver and enter a dispatch ID');
      return;
    }

    try {
      await dispatchService.assignDriver(dispatchId, selectedDriver.id);
      alert(`Driver ${selectedDriver.employee_id} has been successfully assigned to dispatch #${dispatchId}`);
      setSelectedDriver(null);
      setDispatchId(null);
      setAssignmentMode(false);
      handleRefresh();
    } catch (error) {
      console.error('Failed to assign driver:', error);
      alert('Failed to assign driver: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const startAssignmentMode = () => {
    const inputDispatchId = prompt('Enter Dispatch ID to assign driver to:');
    if (!inputDispatchId) return;

    const id = parseInt(inputDispatchId);
    if (isNaN(id) || id <= 0) {
      alert('Please enter a valid dispatch ID');
      return;
    }

    setDispatchId(id);
    setAssignmentMode(true);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Available Drivers" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            👤 Available Drivers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Drivers ready for dispatch assignment
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
          
          {!assignmentMode ? (
            <Button
              onClick={startAssignmentMode}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Assign to Dispatch
            </Button>
          ) : (
            <Button
              onClick={() => {
                setAssignmentMode(false);
                setDispatchId(null);
                setSelectedDriver(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Cancel Assignment
            </Button>
          )}
        </div>
      </div>

      {/* Assignment Mode Info */}
      {assignmentMode && (
        <ComponentCard title="Driver Assignment Mode">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Assigning driver to Dispatch #{dispatchId}
                  </h3>
                  <div className="mt-2 text-sm text-purple-700 dark:text-purple-300">
                    {selectedDriver ? (
                      <p>Selected: <strong>{selectedDriver.employee_id}</strong> - Click "Confirm Assignment" to proceed</p>
                    ) : (
                      <p>Please select a driver from the list below</p>
                    )}
                  </div>
                </div>
              </div>
              {selectedDriver && (
                <Button
                  onClick={handleAssignToDispatch}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Confirm Assignment
                </Button>
              )}
            </div>
          </div>
        </ComponentCard>
      )}

      {/* Selected Driver Info */}
      {selectedDriver && !assignmentMode && (
        <ComponentCard title="Selected Driver">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  {selectedDriver.employee_id} - {selectedDriver.license_number}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {selectedDriver.experience_years} years experience • {selectedDriver.license_type} license
                </p>
              </div>
              <Button
                onClick={() => setSelectedDriver(null)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </ComponentCard>
      )}

      {/* Available Drivers List */}
      <ComponentCard title="Available Drivers">
        <div className="p-6">
          <AvailableDrivers
            onDriverSelect={handleDriverSelect}
            onRefresh={handleRefresh}
            refreshTrigger={refreshTrigger}
            selectedDriverId={selectedDriver?.id || null}
          />
        </div>
      </ComponentCard>

      {/* Quick Actions */}
      <ComponentCard title="Quick Actions">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push('/dispatches/all')}
              className="w-full p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">📋</div>
              <span className="font-medium">All Dispatches</span>
              <span className="text-xs opacity-75">Manage dispatches</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/new')}
              className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">➕</div>
              <span className="font-medium">Create Dispatch</span>
              <span className="text-xs opacity-75">New dispatch</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/drivers')}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">🚚</div>
              <span className="font-medium">Driver Dispatches</span>
              <span className="text-xs opacity-75">By driver</span>
            </Button>

            <Button
              onClick={() => router.push('/dispatches/pending')}
              className="w-full p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex flex-col items-center gap-2"
            >
              <div className="text-2xl">⏳</div>
              <span className="font-medium">Pending Dispatches</span>
              <span className="text-xs opacity-75">Need action</span>
            </Button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}