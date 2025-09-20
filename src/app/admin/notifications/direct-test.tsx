'use client';

import React, { useState, useEffect } from 'react';
import { NotificationStatsResponse } from '@/services/notificationService';

export default function DirectTest() {
  const [data, setData] = useState<NotificationStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDirectFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get the token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      console.log('Token:', token);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Fetching from: http://localhost:8000/api/v1/notifications/stats');
      const response = await fetch('http://localhost:8000/api/v1/notifications/stats', {
        method: 'GET',
        headers,
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Success response:', result);
      setData(result);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testDirectFetch();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <div>
      <h1>Direct Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}