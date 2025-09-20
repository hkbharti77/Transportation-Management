'use client';

import React, { useState, useEffect } from 'react';
import { notificationService, BroadcastNotification } from '@/services/notificationService';
import Badge from '@/components/ui/badge/Badge';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';

interface BroadcastTableProps {
  onBroadcastSelect?: (broadcast: BroadcastNotification) => void;
  refreshTrigger?: number;
}

export default function BroadcastTable({ 
  onBroadcastSelect, 
  refreshTrigger = 0
}: BroadcastTableProps) {
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executeResult, setExecuteResult] = useState<{broadcastId: number, sent: number, failed: number} | null>(null);

  const loadBroadcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await notificationService.getBroadcastNotifications();
      setBroadcasts(response);
    } catch (err) {
      console.error('Failed to load broadcasts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load broadcasts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBroadcasts();
  }, [refreshTrigger]);

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

  const getStatusText = (broadcast: BroadcastNotification) => {
    if (broadcast.sent_at) {
      return 'Sent';
    } else if (broadcast.scheduled_at) {
      return 'Scheduled';
    } else {
      return 'Draft';
    }
  };

  const getStatusBadgeVariant = (broadcast: BroadcastNotification) => {
    if (broadcast.sent_at) {
      return 'success';
    } else if (broadcast.scheduled_at) {
      return 'warning';
    } else {
      return 'primary';
    }
  };

  const handleBroadcastClick = (broadcast: BroadcastNotification) => {
    onBroadcastSelect?.(broadcast);
  };

  const handleExecuteBroadcast = async (broadcastId: number) => {
    try {
      const result = await notificationService.executeBroadcast(broadcastId);
      setExecuteResult({
        broadcastId: result.broadcast_id,
        sent: result.sent,
        failed: result.failed
      });
      // Refresh the list after execution
      loadBroadcasts();
      // Clear the result after 5 seconds
      setTimeout(() => setExecuteResult(null), 5000);
    } catch (err) {
      console.error('Failed to execute broadcast:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute broadcast');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading broadcasts...</span>
      </div>
    );
  }

  if (executeResult) {
    return (
      <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-300">
        <div className="flex items-center">
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="ml-2">
            Broadcast #{executeResult.broadcastId} executed successfully: {executeResult.sent} sent, {executeResult.failed} failed
          </span>
        </div>
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
          onClick={loadBroadcasts}
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
                Audience
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
            {broadcasts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-5 px-4">
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No broadcasts found</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating a new broadcast notification.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              broadcasts.map((broadcast) => (
                <TableRow key={broadcast.broadcast_id}>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <h5 className="font-medium text-black dark:text-white">
                      {broadcast.title}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {broadcast.message.substring(0, 50)}...
                    </p>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <Badge variant="solid" color={getTypeBadgeVariant(broadcast.notification_type)}>
                      {broadcast.notification_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <span className="text-black dark:text-white">
                      {broadcast.target_audience}
                    </span>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <Badge variant="solid" color={getStatusBadgeVariant(broadcast)}>
                      {getStatusText(broadcast)}
                    </Badge>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {broadcast.scheduled_at ? new Date(broadcast.scheduled_at).toLocaleString() : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {broadcast.created_at ? new Date(broadcast.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      {!broadcast.sent_at && (
                        <button
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          onClick={() => handleExecuteBroadcast(broadcast.broadcast_id!)}
                          title="Send Broadcast"
                        >
                          <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 12L3 12M19 12L19 19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21L7 21C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19L5 12M12 16L16 12M12 16L8 12M12 16L12 5C12 4.46957 12.2107 3.96086 12.5858 3.58579C12.9609 3.21071 13.4696 3 14 3L15 3C15.5304 3 16.0391 3.21071 16.4142 3.58579C16.7893 3.96086 17 4.46957 17 5L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      <button
                        className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                        onClick={() => handleBroadcastClick(broadcast)}
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