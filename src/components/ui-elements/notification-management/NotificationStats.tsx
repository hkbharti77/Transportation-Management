'use client';

import React, { useState, useEffect } from 'react';
import { notificationService, NotificationStatsResponse } from '@/services/notificationService';
import ComponentCard from '@/components/common/ComponentCard';
import Badge from '@/components/ui/badge/Badge';

interface NotificationStatsProps {
  refreshTrigger?: number;
}

export default function NotificationStats({ refreshTrigger = 0 }: NotificationStatsProps) {
  const [stats, setStats] = useState<NotificationStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      console.log('Loading notification stats...');
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotificationStats();
      console.log('Notification stats loaded:', response);
      setStats(response);
    } catch (err) {
      console.error('Failed to load notification stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notification stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  console.log('NotificationStats render - stats:', stats, 'loading:', loading, 'error:', error);

  if (loading) {
    return (
      <ComponentCard title="Notification Statistics">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading statistics...</span>
        </div>
      </ComponentCard>
    );
  }

  if (error) {
    return (
      <ComponentCard title="Notification Statistics">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="ml-2 text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={loadStats}
            className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
          >
            Retry
          </button>
        </div>
      </ComponentCard>
    );
  }

  if (!stats) {
    console.log('No stats to display');
    return (
      <ComponentCard title="Notification Statistics">
        <div className="flex items-center justify-center py-8">
          <p>No statistics available</p>
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Notification Statistics">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">Total Notifications</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total_notifications}</p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">Sent</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.sent_notifications}</p>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Delivered</p>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.delivered_notifications}</p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <p className="text-sm text-purple-600 dark:text-purple-400">Read</p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.read_notifications}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">By Type</h3>
          <div className="space-y-2">
            {Object.entries(stats.notifications_by_type).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                <Badge variant="solid" color={count > 0 ? 'primary' : 'light'}>
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">By Category</h3>
          <div className="space-y-2">
            {Object.entries(stats.notifications_by_category).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                <Badge variant="solid" color={count > 0 ? 'primary' : 'light'}>
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Rate</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.delivery_rate.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Read Rate</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.read_rate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}