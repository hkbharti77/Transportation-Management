"use client";

import React, { useState } from 'react';
import Button from '../ui/button/Button';

export default function OrdersDebug() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testAPIConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing API connection...');
    
    try {
      // Test 1: Check if we can reach the API
      const token = localStorage.getItem('access_token');
      setTestResult(prev => prev + `\n✅ Token found: ${token ? 'Yes' : 'No'}`);
      
      if (!token) {
        setTestResult(prev => prev + '\n❌ No authentication token found. Please login first.');
        setIsLoading(false);
        return;
      }

      // Test 2: Try to fetch orders
      const response = await fetch('http://127.0.0.1:8000/api/v1/orders/?skip=0&limit=10', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setTestResult(prev => prev + `\n✅ API Response Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(prev => prev + `\n✅ Orders fetched successfully: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorData = await response.text();
        setTestResult(prev => prev + `\n❌ API Error: ${errorData}`);
      }
      
    } catch (error) {
      setTestResult(prev => prev + `\n❌ Connection Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('access_token');
    setTestResult('🗑️ Token cleared. Please login again.');
  };

  return (
    <div className="p-6 border border-gray-300 rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">Orders API Debug Tool</h3>
      
      <div className="space-x-4 mb-4">
        <Button onClick={testAPIConnection} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test API Connection'}
        </Button>
        <Button onClick={clearToken} variant="outline">
          Clear Token
        </Button>
      </div>
      
      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium mb-2">Test Results:</h4>
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p><strong>Expected API URL:</strong> http://127.0.0.1:8000/api/v1/orders/</p>
        <p><strong>Frontend URL:</strong> http://localhost:3001</p>
        <p><strong>Auth Token:</strong> Stored in localStorage as &#39;access_token&#39;</p>
      </div>
    </div>
  );
}