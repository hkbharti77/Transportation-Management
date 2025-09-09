'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import UserBookings from '@/components/ui-elements/booking-management/UserBookings';
import BookingWithDispatchView from '@/components/ui-elements/booking-management/BookingWithDispatchView';
import BookingStatusManagement from '@/components/ui-elements/booking-management/BookingStatusManagement';

export default function BookingEndpointsTestPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'user-bookings' | 'dispatch-view' | 'status-management' | 'analytics' | 'revenue' | 'peak-hours'>('user-bookings');

  // Authentication check
  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Check if user is admin
    if (user?.role !== 'admin') {
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

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const tabs = [
    {
      id: 'user-bookings' as const,
      name: 'User Bookings',
      description: 'Get bookings for specific user',
      endpoint: 'GET /api/v1/bookings/user/{user_id}',
      icon: '👤'
    },
    {
      id: 'status-management' as const,
      name: 'Status Management',
      description: 'Get by status, confirm & complete',
      endpoint: 'GET /status/{status}, PUT /confirm, PUT /complete',
      icon: '📊'
    },
    {
      id: 'analytics' as const,
      name: 'Analytics Data',
      description: 'Get booking analytics & insights',
      endpoint: 'GET /api/v1/bookings/analytics',
      icon: '📈'
    },
    {
      id: 'revenue' as const,
      name: 'Revenue Data',
      description: 'Get booking revenue & financial insights',
      endpoint: 'GET /api/v1/bookings/revenue',
      icon: '💰'
    },
    {
      id: 'peak-hours' as const,
      name: 'Peak Hours',
      description: 'Get booking patterns by hour & day',
      endpoint: 'GET /api/v1/bookings/peak-hours',
      icon: '⏰'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Booking API Endpoints Test" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔧 Booking API Endpoints Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test and explore the additional booking API endpoints
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/bookings/all')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            All Bookings
          </Button>
        </div>
      </div>

      {/* API Endpoints Overview */}
      <ComponentCard title="Implemented API Endpoints">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-500 font-mono text-sm">GET</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">User Bookings</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                  /bookings/user/{`{user_id}`}
                </code>
              </p>
              <p className="text-xs text-gray-500">Get all bookings for a specific user with pagination</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-500 font-mono text-sm">GET</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">By Status</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                  /bookings/status/{`{status}`}
                </code>
              </p>
              <p className="text-xs text-gray-500">Get bookings filtered by status with pagination</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-500 font-mono text-sm">PUT</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">Confirm</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                  /bookings/{`{id}`}/confirm
                </code>
              </p>
              <p className="text-xs text-gray-500">Dedicated endpoint to confirm a booking</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-500 font-mono text-sm">PUT</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold">Complete</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                  /bookings/{`{id}`}/complete
                </code>
              </p>
              <p className="text-xs text-gray-500">Dedicated endpoint to complete a booking</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-500 font-mono text-sm">PUT</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">Update Status</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                  /bookings/{`{id}`}/status
                </code>
              </p>
              <p className="text-xs text-gray-500">Update booking status with request body</p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-500 font-mono text-sm">DEL</span>
                <span className="text-red-600 dark:text-red-400 font-semibold">Cancel Booking</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                  /bookings/{`{id}`}/cancel
                </code>
              </p>
              <p className="text-xs text-gray-500">Cancel booking using DELETE method</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-500 font-mono text-sm">GET</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold">With Dispatch</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                  /bookings/{`{id}`}/with-dispatch
                </code>
              </p>
              <p className="text-xs text-gray-500">Get booking with dispatch information</p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-500 font-mono text-sm">GET</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">Analytics</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                  /bookings/analytics
                </code>
              </p>
              <p className="text-xs text-gray-500">Get booking analytics and insights</p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-500 font-mono text-sm">GET</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Revenue</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                  /bookings/revenue
                </code>
              </p>
              <p className="text-xs text-gray-500">Get booking revenue and financial insights</p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-indigo-500 font-mono text-sm">GET</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Peak Hours</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                  /bookings/peak-hours
                </code>
              </p>
              <p className="text-xs text-gray-500">Get booking patterns by hour and day</p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{tab.icon}</span>
                <div className="text-left">
                  <div>{tab.name}</div>
                  <div className="text-xs font-normal opacity-75">{tab.endpoint}</div>
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'status-management' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                📊 Status Management Endpoints
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                These endpoints provide status-based filtering and dedicated status update actions.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    GET /api/v1/bookings/status/{`{status}`}?skip=0&limit=100
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">- Get bookings by status</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    PUT /api/v1/bookings/{`{id}`}/confirm
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">- Confirm a pending booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    PUT /api/v1/bookings/{`{id}`}/complete
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">- Complete a booking</span>
                </div>
              </div>
            </div>
            <BookingStatusManagement />
          </div>
        )}

        {activeTab === 'user-bookings' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                👤 User Bookings Endpoint
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This endpoint allows you to get all bookings for a specific user with pagination support.
                It matches the API specification: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                GET /api/v1/bookings/user/{`{user_id}`}?skip=0&limit=100</code>
              </p>
            </div>
            <UserBookings />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                📈 Booking Analytics Endpoint
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                This endpoint provides comprehensive booking analytics including summary statistics,
                status distribution, and service type breakdown.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    GET /api/v1/bookings/analytics
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">- Get analytics data</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    GET /api/v1/bookings/analytics?start_date=2025-08-01&end_date=2025-08-31
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">- Get analytics for date range</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <ComponentCard title="Analytics Endpoint Information">
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Response Structure</h3>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`{
  "period": {
    "start_date": "2025-08-10T00:00:52.705826",
    "end_date": "2025-09-09T00:00:52.705826"
  },
  "summary": {
    "total_bookings": 2,
    "completed_bookings": 1,
    "total_revenue": 30000,
    "average_booking_value": 15000,
    "completion_rate": 50
  },
  "by_status": [
    { "status": "confirmed", "count": 1 },
    { "status": "completed", "count": 1 }
  ],
  "by_service_type": [
    { "service_type": "cargo", "count": 2 }
  ]
}`}
                    </pre>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Summary Metrics</h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Total bookings count</li>
                        <li>• Completed bookings count</li>
                        <li>• Total revenue amount</li>
                        <li>• Average booking value</li>
                        <li>• Completion rate percentage</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Breakdown Data</h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Bookings grouped by status</li>
                        <li>• Bookings grouped by service type</li>
                        <li>• Time period information</li>
                        <li>• Performance analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </ComponentCard>
              
              <ComponentCard title="View Live Analytics">
                <div className="p-6 text-center">
                  <div className="text-4xl mb-4">📈</div>
                  <h3 className="text-lg font-semibold mb-2">Live Analytics Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    View the complete analytics dashboard with real-time data visualization
                  </p>
                  <Button
                    onClick={() => window.open('/bookings/analytics', '_blank')}
                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                  >
                    Open Analytics Dashboard
                  </Button>
                </div>
              </ComponentCard>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                💰 Booking Revenue Endpoint
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                This endpoint provides comprehensive booking revenue analytics including total revenue,
                revenue breakdown by status and service type, and daily revenue trends.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    GET /api/v1/bookings/revenue
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">- Get revenue data</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    GET /api/v1/bookings/revenue?start_date=2025-08-01&end_date=2025-08-31
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">- Get revenue for date range</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <ComponentCard title="Revenue Endpoint Information">
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Response Structure</h3>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`{
  "period": {
    "start_date": "2025-08-10T00:01:49.098824",
    "end_date": "2025-09-09T00:01:49.098824"
  },
  "total_revenue": 30000,
  "revenue_by_status": [
    { "status": "confirmed", "revenue": 15000 },
    { "status": "completed", "revenue": 15000 }
  ],
  "revenue_by_service_type": [
    { "service_type": "cargo", "revenue": 30000 }
  ],
  "daily_revenue_trend": [
    { "date": "2025-09-08", "revenue": 30000 }
  ]
}`}
                    </pre>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Revenue Metrics</h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Total revenue amount</li>
                        <li>• Revenue breakdown by booking status</li>
                        <li>• Revenue breakdown by service type</li>
                        <li>• Daily revenue trend data</li>
                        <li>• Time period information</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Financial Insights</h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Revenue distribution analysis</li>
                        <li>• Service type performance</li>
                        <li>• Status-based revenue tracking</li>
                        <li>• Historical revenue trends</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </ComponentCard>
              
              <ComponentCard title="View Live Revenue Dashboard">
                <div className="p-6 text-center">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-lg font-semibold mb-2">Live Revenue Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    View the complete revenue dashboard with real-time financial data visualization
                  </p>
                  <Button
                    onClick={() => window.open('/bookings/revenue', '_blank')}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  >
                    Open Revenue Dashboard
                  </Button>
                </div>
              </ComponentCard>
            </div>
          </div>
        )}

        {activeTab === 'peak-hours' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ⏰ Booking Peak Hours Endpoint
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                This endpoint provides insights into booking patterns by analyzing when bookings are made
                throughout the day and week, identifying peak hours and days.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    GET /api/v1/bookings/peak-hours
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">- Get peak hours data</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    GET /api/v1/bookings/peak-hours?start_date=2025-08-01&end_date=2025-08-31
                  </code>
                  <span className="text-gray-600 dark:text-gray-400">- Get peak hours for date range</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <ComponentCard title="Peak Hours Endpoint Information">
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Response Structure</h3>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`{
  "period": {
    "start_date": "2025-08-10T00:05:40.176895",
    "end_date": "2025-09-09T00:05:40.176895"
  },
  "peak_hour": {
    "hour": 22,
    "booking_count": 1
  },
  "peak_day": {
    "day": "Monday", 
    "booking_count": 2
  },
  "hourly_distribution": [
    { "hour": 22, "booking_count": 1 },
    { "hour": 23, "booking_count": 1 }
  ],
  "daily_distribution": [
    { "day": "Monday", "booking_count": 2 }
  ]
}`}
                    </pre>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Peak Analysis</h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Peak booking hour of the day</li>
                        <li>• Peak booking day of the week</li>
                        <li>• Booking counts for peak times</li>
                        <li>• Time period information</li>
                        <li>• Pattern identification</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Distribution Data</h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Hourly booking distribution (24-hour)</li>
                        <li>• Daily booking distribution (weekly)</li>
                        <li>• Activity pattern analysis</li>
                        <li>• Time-based insights</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </ComponentCard>
              
              <ComponentCard title="View Live Peak Hours Dashboard">
                <div className="p-6 text-center">
                  <div className="text-4xl mb-4">⏰</div>
                  <h3 className="text-lg font-semibold mb-2">Live Peak Hours Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    View the complete peak hours dashboard with detailed booking pattern analysis
                  </p>
                  <Button
                    onClick={() => window.open('/bookings/peak-hours', '_blank')}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  >
                    Open Peak Hours Dashboard
                  </Button>
                </div>
              </ComponentCard>
            </div>
          </div>
        )}

        {activeTab === 'dispatch-view' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🚚 Booking with Dispatch Endpoint
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This endpoint returns both booking and dispatch information for a specific booking ID.
                It matches the API specification: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                GET /api/v1/bookings/{`{id}`}/with-dispatch</code>
              </p>
            </div>
            <BookingWithDispatchView />
          </div>
        )}
      </div>

      {/* Implementation Notes */}
      <ComponentCard title="Implementation Notes">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ✅ Implemented Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  User-specific booking retrieval with pagination
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  Status-based booking filtering
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  Dedicated confirm and complete endpoints
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  Booking status update via request body
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  Booking cancellation using DELETE method
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  Combined booking and dispatch data retrieval
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  Proper error handling and validation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  TypeScript interfaces for all data structures
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🔧 Technical Details
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">●</span>
                  Pagination with skip/limit parameters (max 100)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">●</span>
                  Status-based filtering with dedicated endpoints
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">●</span>
                  Direct confirm/complete actions without request body
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">●</span>
                  Authentication via Bearer token headers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">●</span>
                  Comprehensive error handling with user feedback
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">●</span>
                  Real-time data updates and refresh functionality
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">●</span>
                  Responsive UI components with loading states
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">●</span>
                  Integration with existing booking management system
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}