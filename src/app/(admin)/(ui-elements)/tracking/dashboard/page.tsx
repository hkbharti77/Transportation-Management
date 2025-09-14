'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Badge from '@/components/ui/badge/Badge';
import LocationMap from '@/components/ui-elements/maps/LocationMap';

interface LocationRecord {
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
}

interface GeofenceAlert {
  event_type: string;
  timestamp: string;
  event_id: number;
  geofence_id: number;
  truck_id: number;
  location_id: number;
}

interface DashboardData {
  total_trucks: number;
  online_trucks: number;
  active_trips: number;
  total_distance_today: number;
  average_speed: number;
  recent_locations: LocationRecord[];
  geofence_alerts: GeofenceAlert[];
}

export default function TrackingDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tracking/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data: DashboardData = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching tracking dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200 max-w-2xl">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Tracking Dashboard" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚚 Tracking Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time overview of fleet tracking and location data
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : dashboardData ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <ComponentCard title="Total Trucks">
              <div className="p-4 text-center">
                <div className="text-3xl mb-2">🚛</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Trucks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.total_trucks}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Online Trucks">
              <div className="p-4 text-center">
                <div className="text-3xl mb-2">🟢</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Online Now</p>
                <p className="text-2xl font-bold text-green-600">{dashboardData.online_trucks}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Active Trips">
              <div className="p-4 text-center">
                <div className="text-3xl mb-2">🛣️</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Trips</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.active_trips}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Distance Today">
              <div className="p-4 text-center">
                <div className="text-3xl mb-2">📏</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kilometers</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardData.total_distance_today.toFixed(0)}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Avg Speed">
              <div className="p-4 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">km/h</p>
                <p className="text-2xl font-bold text-orange-600">{dashboardData.average_speed.toFixed(1)}</p>
              </div>
            </ComponentCard>
          </div>

          {/* Map Visualization */}
          <ComponentCard title="Fleet Locations">
            <div className="p-6">
              <LocationMap 
                locations={dashboardData.recent_locations}
                height="500px"
              />
            </div>
          </ComponentCard>

          {/* Recent Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComponentCard title="Recent Locations">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Truck ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Coordinates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Speed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {dashboardData.recent_locations.map((location) => (
                        <tr key={location.location_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            #{location.truck_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <Badge color="info" variant="light">
                              {location.speed} km/h
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(location.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ComponentCard>

            {/* Geofence Alerts */}
            <ComponentCard title="Geofence Alerts">
              <div className="p-6">
                {dashboardData.geofence_alerts.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.geofence_alerts.map((alert) => (
                      <div key={alert.event_id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-red-800 dark:text-red-200">
                              {alert.event_type.replace('_', ' ').toUpperCase()}
                            </h4>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              Truck #{alert.truck_id} • Alert #{alert.event_id}
                            </p>
                          </div>
                          <Badge color="error" variant="light">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(alert.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">✅</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Geofence Alerts
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All vehicles are within designated areas
                    </p>
                  </div>
                )}
              </div>
            </ComponentCard>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No dashboard data available</p>
        </div>
      )}
    </div>
  );
}