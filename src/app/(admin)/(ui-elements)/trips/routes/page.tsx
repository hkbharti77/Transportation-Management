'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Badge from '@/components/ui/badge/Badge';

// Mock route data structure
interface Route {
  id: number;
  name: string;
  origin: string;
  destination: string;
  stops: string[];
  distance: number;
  estimated_duration: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
}

export default function RouteManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock routes data
  const mockRoutes: Route[] = useMemo(() => [
    {
      id: 1,
      name: "City Center Express",
      origin: "Downtown Terminal",
      destination: "Airport",
      stops: ["Central Mall", "University", "Business District"],
      distance: 25,
      estimated_duration: "45 minutes",
      status: 'active',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: "Suburban Loop",
      origin: "Main Station",
      destination: "Residential Area",
      stops: ["Shopping Center", "Hospital", "School District", "Park & Ride"],
      distance: 18,
      estimated_duration: "35 minutes",
      status: 'active',
      created_at: '2024-01-10T14:20:00Z'
    },
    {
      id: 3,
      name: "Industrial Route",
      origin: "Port Terminal",
      destination: "Factory District",
      stops: ["Warehouse Zone", "Manufacturing Hub"],
      distance: 12,
      estimated_duration: "25 minutes",
      status: 'maintenance',
      created_at: '2024-01-05T09:15:00Z'
    }
  ], []);

  useEffect(() => {
    // Simulate loading routes

    setTimeout(() => {
      setRoutes(mockRoutes);

    }, 1000);
  }, [mockRoutes]);

  const filteredRoutes = routes.filter(route =>
    (route.name && route.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (route.origin && route.origin.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (route.destination && route.destination.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const setSelectedRoute = (route: Route) => {
    // Implementation would go here
    console.log('Selected route:', route);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Route Management" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🗺️ Route Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage transportation routes, stops, and scheduling paths
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Route
          </Button>
        </div>
      </div>

      {/* Route Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🗺️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Routes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{routes.length}</p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Routes</p>
            <p className="text-2xl font-bold text-green-600">
              {routes.filter(r => r.status === 'active').length}
            </p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🔧</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Under Maintenance</p>
            <p className="text-2xl font-bold text-yellow-600">
              {routes.filter(r => r.status === 'maintenance').length}
            </p>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📏</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Distance</p>
            <p className="text-2xl font-bold text-blue-600">
              {routes.length > 0 ? Math.round(routes.reduce((sum, r) => sum + r.distance, 0) / routes.length) : 0} km
            </p>
          </div>
        </ComponentCard>
      </div>

      {/* Search and Filters */}
      <ComponentCard title="">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search routes by name, origin, or destination..."
                defaultValue={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={() => setSearchTerm('')}
              variant="outline"
              className="px-6"
            >
              Clear
            </Button>
          </div>
        </div>
      </ComponentCard>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRoutes.map((route) => (
          <ComponentCard key={route.id} title="">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {route.name}
                </h3>
                <Badge color={route.status === 'active' ? 'success' : route.status === 'maintenance' ? 'warning' : 'light'}>
                  {route.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">From:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{route.origin}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">To:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{route.destination}</span>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Stops ({route.stops.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {route.stops.map((stop, index) => (
                      <Badge key={index} color="light">
                        {stop}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span>Distance: {route.distance} km</span>
                  <span>Duration: {route.estimated_duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedRoute(route)}
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                    variant="outline"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => setSelectedRoute(route)}
                    size="sm"
                    className="text-green-600 hover:text-green-800"
                    variant="outline"
                  >
                    Edit
                  </Button>
                </div>
                <Button
                  onClick={() => {}}
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                  variant="outline"
                >
                  Delete
                </Button>
              </div>
            </div>
          </ComponentCard>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <ComponentCard title="">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🗺️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No Routes Found' : 'No Routes Available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm 
                ? 'No routes match your search criteria. Try different keywords.'
                : 'Create your first route to start managing transportation paths.'
              }
            </p>
            {!searchTerm && (
              <Button

                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create First Route
              </Button>
            )}
          </div>
        </ComponentCard>
      )}

      {/* Route Management Info */}
      <ComponentCard title="Route Management Guidelines">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📋 Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Plan optimal stop locations for passenger convenience
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Consider traffic patterns and peak hours
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Maintain reasonable distances between stops
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Regular route performance evaluation
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🛠️ Route Status Guide
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <Badge color="success">ACTIVE</Badge>
                Route is operational and accepting trips
              </li>
              <li className="flex items-center gap-2">
                <Badge color="warning">MAINTENANCE</Badge>
                Route under maintenance, temporarily unavailable
              </li>
              <li className="flex items-center gap-2">
                <Badge color="light">INACTIVE</Badge>
                Route disabled or not in service
              </li>
            </ul>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}