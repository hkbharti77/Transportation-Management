'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';

export default function OrderTrackingPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = () => {
    if (!trackingId.trim()) {
      alert('Please enter a tracking ID');
      return;
    }

    // In a real implementation, this would call an API to get tracking information
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock data for demonstration
      setTrackingResult({
        id: trackingId,
        status: 'in_transit',
        pickup_location: 'New York, NY',
        drop_location: 'Los Angeles, CA',
        estimated_delivery: '2025-09-15T14:30:00Z',
        current_location: 'Chicago, IL',
        progress: 65,
        events: [
          {
            timestamp: '2025-09-01T09:15:00Z',
            location: 'New York, NY',
            description: 'Order picked up',
            status: 'picked_up'
          },
          {
            timestamp: '2025-09-02T16:30:00Z',
            location: 'Philadelphia, PA',
            description: 'Arrived at sorting facility',
            status: 'in_transit'
          },
          {
            timestamp: '2025-09-03T08:45:00Z',
            location: 'Chicago, IL',
            description: 'Currently at distribution center',
            status: 'in_transit'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      picked_up: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      in_transit: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      out_for_delivery: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return statusStyles[status] || statusStyles.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <PageBreadCrumb pageTitle="Order Tracking" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🗺️ Order Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track the real-time location and status of your orders
          </p>
        </div>
      </div>

      {/* Tracking Input */}
      <ComponentCard title="Track Your Order">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter order ID or tracking number"
                defaultValue={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleTrackOrder}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Tracking...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Track Order
                </>
              )}
            </Button>
          </div>
        </div>
      </ComponentCard>

      {/* Tracking Results */}
      {trackingResult && (
        <>
          {/* Order Summary */}
          <ComponentCard title="Order Status">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order #{trackingResult.id}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {trackingResult.pickup_location} → {trackingResult.drop_location}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(trackingResult.status)}`}>
                    {trackingResult.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Estimated Delivery: {formatDate(trackingResult.estimated_delivery)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Order Progress</span>
                  <span>{trackingResult.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${trackingResult.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Location */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-blue-700 dark:text-blue-400">
                    Current Location: {trackingResult.current_location}
                  </span>
                </div>
              </div>
            </div>
          </ComponentCard>

          {/* Tracking History */}
          <ComponentCard title="Tracking History">
            <div className="p-6">
              <div className="space-y-4">
                {trackingResult.events.map((event: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      {index < trackingResult.events.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-700 mt-1"></div>
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {event.description}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(event.timestamp)} • {event.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ComponentCard>
        </>
      )}

      {/* Info Section */}
      {!trackingResult && !loading && (
        <ComponentCard title="How to Track Your Order">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Find Your Order ID</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Locate your order confirmation email or check your order history
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">2️⃣</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Enter Tracking Number</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Paste your order ID or tracking number in the search box above
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">3️⃣</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">View Real-time Status</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  See current location, estimated delivery, and tracking history
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}