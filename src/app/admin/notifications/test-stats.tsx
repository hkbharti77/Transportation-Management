'use client';

import React, { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { NotificationStatsResponse } from '@/services/notificationService';

export default function TestStats() {
  const [stats, setStats] = useState<NotificationStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Calling getNotificationStats...');
      const response = await notificationService.getNotificationStats();
      console.log('API Response:', response);
      setStats(response);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notification stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!stats) {
    return <div>No data</div>;
  }

  return (
    <div>
      <h1>Test Stats</h1>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  );
}