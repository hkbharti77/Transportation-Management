'use client';

import { useState, useEffect } from 'react';
import { fleetService, FleetSummary } from '@/services/fleetService';
import { TruckIcon, UserSolidIcon, CheckCircleIcon, ClockIcon, WrenchIcon } from '@/icons';

export default function FleetSummaryCard() {
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFleetSummary();
  }, []);

  const fetchFleetSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fleetSummary = await fleetService.getFleetSummary();
      console.log('Fleet summary fetched:', fleetSummary);
      setSummary(fleetSummary);
      
    } catch (err) {
      console.error('Failed to fetch fleet summary:', err);
      setError('Failed to load fleet summary');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={fetchFleetSummary}
            className="mt-2 text-sm text-brand-500 hover:text-brand-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Fleet Summary
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Overview of trucks and drivers
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Trucks */}
        <div className="text-center p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
          <div className="flex items-center justify-center mb-2">
            <TruckIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{summary.total_trucks}</div>
          <div className="text-xs text-blue-600">Total Trucks</div>
        </div>

        {/* Available Trucks */}
        <div className="text-center p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
          <div className="flex items-center justify-center mb-2">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{summary.available_trucks}</div>
          <div className="text-xs text-green-600">Available</div>
        </div>

        {/* Busy Trucks */}
        <div className="text-center p-3 bg-orange-50 rounded-lg dark:bg-orange-900/20">
          <div className="flex items-center justify-center mb-2">
            <ClockIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{summary.busy_trucks}</div>
          <div className="text-xs text-orange-600">In Use</div>
        </div>

        {/* Maintenance Trucks */}
        <div className="text-center p-3 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
          <div className="flex items-center justify-center mb-2">
            <WrenchIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{summary.maintenance_trucks}</div>
          <div className="text-xs text-yellow-600">Maintenance</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {/* Total Drivers */}
        <div className="text-center p-3 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                     <div className="flex items-center justify-center mb-2">
             <UserSolidIcon className="h-6 w-6 text-purple-600" />
           </div>
          <div className="text-2xl font-bold text-purple-600">{summary.total_drivers}</div>
          <div className="text-xs text-purple-600">Total Drivers</div>
        </div>

        {/* Available Drivers */}
        <div className="text-center p-3 bg-emerald-50 rounded-lg dark:bg-emerald-900/20">
          <div className="flex items-center justify-center mb-2">
            <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{summary.available_drivers}</div>
          <div className="text-xs text-emerald-600">Available</div>
        </div>
      </div>

      {/* On Trip Drivers */}
      <div className="mt-4 text-center p-3 bg-indigo-50 rounded-lg dark:bg-indigo-900/20">
        <div className="flex items-center justify-center mb-2">
          <ClockIcon className="h-6 w-6 text-indigo-600" />
        </div>
        <div className="text-2xl font-bold text-indigo-600">{summary.on_trip_drivers}</div>
        <div className="text-xs text-indigo-600">On Trip</div>
      </div>

      <div className="mt-4 text-right">
        <button 
          onClick={fetchFleetSummary}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
