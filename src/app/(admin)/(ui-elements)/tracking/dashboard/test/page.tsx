'use client';

import React, { useState, useEffect } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';

// Define the expected response structure
interface DashboardData {
  total_trucks: number;
  online_trucks: number;
  active_trips: number;
  total_distance_today: number;
  average_speed: number;
  recent_locations: Array<{
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    heading: number;
    accuracy: number;
    location_type: string;
    location_id: number;
    truck_id: number;
    timestamp: string;
    created_at: string;
  }>;
  geofence_alerts: Array<{
    event_type: string;
    timestamp: string;
    event_id: number;
    geofence_id: number;
    truck_id: number;
    location_id: number;
  }>;
}

export default function TrackingDashboardTestPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tracking/dashboard');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Tracking Dashboard Test" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🧪 Tracking Dashboard API Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Testing the new tracking dashboard API endpoint
          </p>
        </div>
      </div>

      <ComponentCard title="API Response">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              <h3 className="font-bold text-lg mb-2">Error</h3>
              <p>{error}</p>
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Trucks</p>
                  <p className="text-2xl font-bold text-blue-600">{data.total_trucks}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Online Trucks</p>
                  <p className="text-2xl font-bold text-green-600">{data.online_trucks}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Trips</p>
                  <p className="text-2xl font-bold text-purple-600">{data.active_trips}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Raw Response Data</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No data received</p>
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}