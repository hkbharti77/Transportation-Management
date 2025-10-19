"use client";
import React from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const PerformancePage = () => {
  return (
    <div className="p-4 md:p-6">
      <PageBreadcrumb pageTitle="Performance Management" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Performance Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage driver performance metrics, behavior events, vehicle diagnostics, and maintenance alerts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Dashboard Card */}
        <Link href="/admin/performance/dashboard" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Performance Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  View driver performance metrics and analytics
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Behavior Events Card */}
        <Link href="/admin/performance/events" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Behavior & Maintenance Events</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Monitor and manage driver behavior events and vehicle maintenance alerts
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Driver Scorecard Card */}
        <Link href="/admin/performance/scorecard" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Driver Scorecard</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  View detailed driver performance scorecard
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Vehicle Diagnostics Card */}
        <Link href="/admin/performance/diagnostics" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Vehicle Diagnostics</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  View and manage vehicle diagnostics data
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Maintenance Alerts Card */}
        <Link href="/admin/performance/maintenance" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Maintenance Management</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage vehicle maintenance alerts and schedules
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Unresolved Events Card */}
        <Link href="/admin/performance/unresolved-events" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Unresolved Events</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  View and manage unresolved behavior events
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* API Test Card */}
        <Link href="/admin/performance/test" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">API Test</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Test performance management API endpoints
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Route Optimization Test Card */}
        <Link href="/admin/performance/test-optimization" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Route Optimization Test</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Test route optimization API endpoints
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Performance Metrics Overview</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Safety Score</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">85<span className="text-lg">/100</span></p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Average safety rating across all drivers</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Punctuality</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">92<span className="text-lg">/100</span></p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">On-time arrival percentage</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Fuel Efficiency</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">78<span className="text-lg">/100</span></p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Average fuel consumption efficiency</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Unresolved Alerts</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">3</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Pending maintenance alerts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Add Performance Record</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manually add a driver performance record
            </p>
            <Link href="/admin/performance/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Add Record
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Add Behavior Event</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manually add a driver behavior event
            </p>
            <Link href="/admin/performance/events" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Add Event
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Add Vehicle Diagnostics</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add vehicle diagnostics data
            </p>
            <Link href="/admin/performance/diagnostics" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Add Diagnostics
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Add Maintenance Alert</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create a new maintenance alert
            </p>
            <Link href="/admin/performance/maintenance" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Add Alert
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;