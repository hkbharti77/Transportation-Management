"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import { Notification } from "@/services/notificationService";
import { BellIcon, AlertIcon } from "@/icons";

export default function DriverNotificationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication and authorization check
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      window.location.href = '/signin';
      return;
    }

    // Only allow drivers to access this page
    if (user?.role !== 'driver') {
      // Redirect non-drivers to appropriate dashboard
      if (user?.role === 'admin') {
        window.location.href = '/admin/notifications';
      } else if (user?.role === 'customer') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/signin';
      }
      return;
    }

    // Load notifications
    loadNotifications();
  }, [isAuthenticated, user, isLoading]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API calls
      const mockNotifications: Notification[] = [
        {
          notification_id: 1,
          title: "New Order Assigned",
          message: "You have been assigned a new order #ORD-2024-001. Pickup scheduled for tomorrow at 9:00 AM.",
          notification_type: "push",
          category: "order",
          priority: "high",
          status: "delivered",
          created_at: "2024-09-05T08:30:00Z",
          user_id: user?.id || 0
        },
        {
          notification_id: 2,
          title: "Maintenance Reminder",
          message: "Your assigned vehicle TRK-001 is due for maintenance next week.",
          notification_type: "push",
          category: "maintenance",
          priority: "normal",
          status: "delivered",
          created_at: "2024-09-04T14:15:00Z",
          user_id: user?.id || 0
        },
        {
          notification_id: 3,
          title: "Trip Completed",
          message: "Your trip #TRP-2024-089 has been marked as completed. Please confirm delivery.",
          notification_type: "push",
          category: "trip",
          priority: "low",
          status: "delivered",
          read_at: "2024-09-03T16:45:00Z",
          created_at: "2024-09-03T16:45:00Z",
          user_id: user?.id || 0
        }
      ];

      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.notification_id === id 
            ? { ...notification, read_at: new Date().toISOString() } 
            : notification
        )
      );
      
      // In a real app, you would also make an API call here
      console.log(`Marking notification ${id} as read`);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <BellIcon className="h-4 w-4" />;
      case 'maintenance':
        return <AlertIcon className="h-4 w-4" />;
      case 'trip':
        return <BellIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'maintenance':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'trip':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center">
            <AlertIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stay updated with important alerts and messages
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BellIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {notifications.filter(n => !n.read_at).length} unread
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <ComponentCard title="Your Notifications" className="p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.notification_id} 
                className={`p-4 rounded-lg border ${
                  notification.read_at 
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(notification.category || 'general')}`}>
                    {getTypeIcon(notification.category || 'general')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read_at && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.category || 'general')}`}>
                          {notification.category || 'general'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(notification.created_at || '')}
                      </span>
                    </div>
                  </div>
                </div>
                {!notification.read_at && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => markAsRead(notification.notification_id!)}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ComponentCard>
    </div>
  );
}