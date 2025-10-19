'use client';

import React, { useState, useEffect } from 'react';
import { ETATester, TestResult } from '@/utils/etaTestUtility';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';

// Define the test results structure
interface TestResults {
  basicETA: TestResult;
  invalidData: TestResult;
  walkingETA: TestResult;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

const ETATestPage = () => {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await ETATester.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Run tests automatically when the page loads
    runTests();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ETA Calculation Tests</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Automated tests for the ETA calculation functionality
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full md:w-auto"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests Again'}
        </Button>
      </div>

      {testResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ComponentCard title="Basic ETA Test">
            <div className={`p-4 rounded-lg ${testResults.basicETA.success ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <h3 className="font-semibold mb-2">New York to Los Angeles</h3>
              <p className={testResults.basicETA.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {testResults.basicETA.message}
              </p>
              {testResults.basicETA.data && (
                <div className="mt-3 text-sm">
                  <p>Distance: {testResults.basicETA.data.distance_km.toFixed(2)} km</p>
                  <p>Duration: {testResults.basicETA.data.duration_minutes} minutes</p>
                  <p>ETA: {new Date(testResults.basicETA.data.eta).toLocaleString()}</p>
                </div>
              )}
              {testResults.basicETA.error && (
                <p className="text-red-700 dark:text-red-400 mt-2 text-sm">
                  Error: {testResults.basicETA.error}
                </p>
              )}
            </div>
          </ComponentCard>

          <ComponentCard title="Invalid Data Test">
            <div className={`p-4 rounded-lg ${testResults.invalidData.success ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <h3 className="font-semibold mb-2">Invalid Coordinates</h3>
              <p className={testResults.invalidData.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {testResults.invalidData.message}
              </p>
              {testResults.invalidData.error && (
                <p className="text-red-700 dark:text-red-400 mt-2 text-sm">
                  Error: {testResults.invalidData.error}
                </p>
              )}
            </div>
          </ComponentCard>

          <ComponentCard title="Walking ETA Test">
            <div className={`p-4 rounded-lg ${testResults.walkingETA.success ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <h3 className="font-semibold mb-2">Times Square to Rockefeller Center</h3>
              <p className={testResults.walkingETA.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {testResults.walkingETA.message}
              </p>
              {testResults.walkingETA.data && (
                <div className="mt-3 text-sm">
                  <p>Distance: {testResults.walkingETA.data.distance_km.toFixed(2)} km</p>
                  <p>Duration: {testResults.walkingETA.data.duration_minutes} minutes</p>
                  <p>ETA: {new Date(testResults.walkingETA.data.eta).toLocaleString()}</p>
                </div>
              )}
              {testResults.walkingETA.error && (
                <p className="text-red-700 dark:text-red-400 mt-2 text-sm">
                  Error: {testResults.walkingETA.error}
                </p>
              )}
            </div>
          </ComponentCard>

          <ComponentCard title="Test Summary" className="md:col-span-2 lg:col-span-3">
            <div className="flex flex-wrap gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg">
                <p className="text-sm">Total Tests</p>
                <p className="text-2xl font-bold">{testResults.summary.total}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg">
                <p className="text-sm">Passed</p>
                <p className="text-2xl font-bold">{testResults.summary.passed}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg">
                <p className="text-sm">Failed</p>
                <p className="text-2xl font-bold">{testResults.summary.failed}</p>
              </div>
            </div>
          </ComponentCard>
        </div>
      )}

      <div className="mt-8 bg-white dark:bg-dark-2 rounded-lg p-6 shadow-sm border border-stroke dark:border-dark-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How to Use</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
          <li>Tests run automatically when the page loads</li>
          <li>Click &quot;Run Tests Again&quot; to re-run all tests</li>
          <li>Check the browser console for detailed test output</li>
          <li>Test results are displayed in colored cards for easy identification</li>
        </ul>
      </div>
    </div>
  );
};

export default ETATestPage;