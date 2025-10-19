'use client';

import React, { useState, useEffect } from 'react';
import { dispatchService } from '@/services/dispatchService';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';

// Define types for our debug info
interface EnvironmentInfo {
  apiUrl: string;
  userAgent: string;
  localStorage: {
    hasAccessToken: boolean;
    tokenLength: number;
  };
}

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  details: Record<string, unknown>;
}

interface DebugInfo {
  timestamp: string;
  environment: EnvironmentInfo;
  tests: TestResult[];
}

export default function DispatchDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const info: DebugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
        userAgent: navigator.userAgent,
        localStorage: {
          hasAccessToken: !!localStorage.getItem('access_token'),
          tokenLength: localStorage.getItem('access_token')?.length || 0
        }
      },
      tests: []
    };

    // Test 1: Basic API connectivity
    try {
      const response = await fetch(`${info.environment.apiUrl}/dispatches/?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('access_token') ? `Bearer ${localStorage.getItem('access_token')}` : '',
        },
      });
      
      info.tests.push({
        name: 'Basic API Connectivity',
        status: response.ok ? 'PASS' : 'FAIL',
        details: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        }
      });

      if (response.ok) {
        const data = await response.json();
        info.tests.push({
          name: 'API Response Format',
          status: Array.isArray(data) ? 'PASS' : 'FAIL',
          details: {
            type: typeof data,
            isArray: Array.isArray(data),
            length: Array.isArray(data) ? data.length : 'N/A',
            sample: Array.isArray(data) && data.length > 0 ? data[0] : data
          }
        });
      }
    } catch (error) {
      info.tests.push({
        name: 'Basic API Connectivity',
        status: 'ERROR',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      });
    }

    // Test 2: Service layer test
    try {
      const dispatches = await dispatchService.getDispatches({ limit: 1 });
      info.tests.push({
        name: 'Service Layer Test',
        status: 'PASS',
        details: {
          dispatchCount: dispatches.length,
          firstDispatch: dispatches.length > 0 ? dispatches[0] : null
        }
      });
    } catch (error) {
      info.tests.push({
        name: 'Service Layer Test',
        status: 'ERROR',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    setDebugInfo(info);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        🔍 Dispatch System Diagnostics
      </h1>
      
      <ComponentCard title="System Health Check">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2">Running diagnostics...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={runDiagnostics} className="mb-4">
                🔄 Refresh Diagnostics
              </Button>
              
              {debugInfo && (
                <div className="space-y-4">
                  {/* Environment Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Environment Information</h3>
                    <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
                      {JSON.stringify(debugInfo.environment, null, 2)}
                    </pre>
                  </div>

                  {/* Test Results */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Test Results</h3>
                    {debugInfo.tests.map((test, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        test.status === 'PASS' ? 'bg-green-50 dark:bg-green-900/20' :
                        test.status === 'FAIL' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                        'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            test.status === 'PASS' ? 'bg-green-100 text-green-800' :
                            test.status === 'FAIL' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {test.status}
                          </span>
                          <span className="font-medium">{test.name}</span>
                        </div>
                        <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Network Debugging Tips */}
      <ComponentCard title="Debugging Tips">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">🌐 Network Issues</h3>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Check if the backend server is running on port 8000</li>
                <li>• Verify CORS settings allow frontend origin</li>
                <li>• Check browser network tab for failed requests</li>
                <li>• Ensure API_URL environment variable is correct</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">🔐 Authentication Issues</h3>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Verify access token is present in localStorage</li>
                <li>• Check if token has expired</li>
                <li>• Ensure proper Authorization header format</li>
                <li>• Verify user has required permissions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">📡 API Response Issues</h3>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Check if response format matches expected schema</li>
                <li>• Verify status codes and error messages</li>
                <li>• Look for validation errors in request data</li>
                <li>• Check Content-Type headers</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">🔄 Component Issues</h3>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Check console for React errors or warnings</li>
                <li>• Verify useEffect dependencies</li>
                <li>• Look for infinite re-render loops</li>
                <li>• Check prop types and component state</li>
              </ul>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}