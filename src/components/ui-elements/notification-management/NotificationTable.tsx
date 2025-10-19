'use client';

import React, { useState, useEffect } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import Badge from '@/components/ui/badge/Badge';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';

interface NotificationTableProps {
  onNotificationSelect?: (notification: Notification) => void;
  refreshTrigger?: number;
}

export default function NotificationTable({ 
  onNotificationSelect, 
  refreshTrigger = 0
}: NotificationTableProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await notificationService.getNotifications({});
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [refreshTrigger]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'delivered':
        return 'success';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'error';
      case 'pending':
      default:
        return 'warning';
    }
  };

  const canSendNotification = (notification: Notification) => {
    return notification.status === 'pending' && !notification.sent_at;
  };

  const handleSendNotification = async (notificationId: number) => {
    try {
      await notificationService.sendNotification(notificationId);
      // Refresh the list after sending
      loadNotifications();
    } catch (err) {
      console.error('Failed to send notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'low':
        return 'success';
      case 'normal':
      default:
        return 'warning';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'sms':
        return 'success';
      case 'email':
        return 'primary';
      case 'push':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationSelect?.(notification);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading notifications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="ml-2 text-sm text-red-700">{error}</p>
        </div>
        <button
          onClick={loadNotifications}
          className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="bg-gray-2 text-left dark:bg-meta-4">
              <TableCell isHeader className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Title
              </TableCell>
              <TableCell isHeader className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                Type
              </TableCell>
              <TableCell isHeader className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                Category
              </TableCell>
              <TableCell isHeader className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white">
                Priority
              </TableCell>
              <TableCell isHeader className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white">
                Status
              </TableCell>
              <TableCell isHeader className="py-4 px-4 font-medium text-black dark:text-white">
                Scheduled
              </TableCell>
              <TableCell isHeader className="py-4 px-4 font-medium text-black dark:text-white">
                Created
              </TableCell>
              <TableCell isHeader className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-5 px-4">
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No notifications found</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating a new notification.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notification) => (
                <TableRow key={notification.notification_id}>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <h5 className="font-medium text-black dark:text-white">
                      {notification.title}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message.substring(0, 50)}...
                    </p>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <Badge variant="solid" color={getTypeBadgeVariant(notification.notification_type)}>
                      {notification.notification_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <span className="text-black dark:text-white">
                      {notification.category}
                    </span>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <Badge variant="solid" color={getPriorityBadgeVariant(notification.priority)}>
                      {notification.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <Badge variant="solid" color={getStatusBadgeVariant(notification.status)}>
                      {notification.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {notification.scheduled_at ? new Date(notification.scheduled_at).toLocaleString() : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {notification.created_at ? new Date(notification.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      {canSendNotification(notification) && (
                        <button
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          onClick={() => handleSendNotification(notification.notification_id!)}
                          title="Send Notification"
                        >
                          <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 12L3 12M19 12L19 19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21L7 21C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19L5 12M12 16L16 12M12 16L8 12M12 16L12 5C12 4.46957 12.2107 3.96086 12.5858 3.58579C12.9609 3.21071 13.4696 3 14 3L15 3C15.5304 3 16.0391 3.21071 16.4142 3.58579C16.7893 3.96086 17 4.46957 17 5L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      <button
                        className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                        onClick={() => handleNotificationClick(notification)}
                        title="View Details"
                      >
                        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15.22 6.03L19.71 10.52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12.5 8.74L19.14 15.37C19.81 16.04 20.14 16.38 20.34 16.76C20.54 17.15 20.59 17.58 20.5 18.02C20.41 18.46 20.18 18.88 19.74 19.32L16.49 22.57C16.05 23.01 15.63 23.24 15.19 23.33C14.75 23.42 14.32 23.37 13.94 23.17C13.56 22.97 13.22 22.64 12.55 21.97L5.91997 15.34C5.27997 14.7 4.95997 14.38 4.76997 14.01C4.57997 13.64 4.52997 13.22 4.60997 12.8C4.68997 12.38 4.89997 11.98 5.31997 11.18L12.5 8.74Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}