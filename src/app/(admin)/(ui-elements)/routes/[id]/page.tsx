"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { routeService, Route, Trip, RouteDetailStats } from "@/services/routeService";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Link from "next/link";

const RouteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [route, setRoute] = useState<Route | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<RouteDetailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "trips" | "stats">("details");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        setLoading(true);
        const routeData = await routeService.getRouteById(Number(id));
        setRoute(routeData);
        
        // Fetch trips for this route
        const tripsData = await routeService.getRouteTrips(Number(id));
        setTrips(tripsData);
        
        // Fetch statistics for this route
        const statsData = await routeService.getRouteDetailStats(Number(id));
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch route details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRouteDetails();
    }
  }, [id]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Route not found</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The requested route could not be found.
          </p>
          <Link 
            href="/routes" 
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Routes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageBreadcrumb pageTitle={`Route ${route.route_number} Details`} />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Route {route.route_number} Details
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {route.start_point} → {route.end_point}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex space-x-2">
            <Link
              href={`/routes/${route.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Route
            </Link>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "details"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Route Details
          </button>
          <button
            onClick={() => setActiveTab("trips")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "trips"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Trips ({trips.length})
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "stats"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Statistics
          </button>
        </nav>
      </div>

      {activeTab === "details" && (
        <ComponentCard title="Route Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Route Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{route.route_number}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        route.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {route.is_active ? "Active" : "Inactive"}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Point</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{route.start_point}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">End Point</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{route.end_point}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Distance</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{route.distance} km</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Time</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatTime(route.estimated_time)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Base Fare</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">₹{route.base_fare}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Stops</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{route.stops.length}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Stops</h2>
              <ul className="border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                {route.stops.map((stop, index) => (
                  <li key={index} className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">{index + 1}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{stop}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300">{route.description}</p>
          </div>
        </ComponentCard>
      )}

      {activeTab === "trips" && (
        <ComponentCard title={`Trips for Route ${route.route_number}`}>
          {trips.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No trips scheduled</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                There are no trips scheduled for this route yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trip ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Departure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Arrival
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fare
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Seats
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{trip.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(trip.departure_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(trip.arrival_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            trip.status === "scheduled"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : trip.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : trip.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₹{trip.fare}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {trip.available_seats}/{trip.total_seats}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      )}

      {activeTab === "stats" && (
        <ComponentCard title={`Statistics for Route ${route.route_number}`}>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total_trips}</div>
                <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Trips</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active_trips}</div>
                <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Active Trips</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.completed_trips}</div>
                <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Completed Trips</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{formatPercentage(stats.completion_rate)}</div>
                <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">₹{stats.base_fare}</div>
                <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Base Fare</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.distance} km</div>
                <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Distance</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Loading statistics</h3>
            </div>
          )}
        </ComponentCard>
      )}
    </div>
  );
};

export default RouteDetailPage;