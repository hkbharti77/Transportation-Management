'use client';

import React, { useState } from 'react';
import { dispatchService } from '@/services/dispatchService';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';

export default function DispatchTestPage() {
  const [loading, setLoading] = useState(false);
  const [displayResults, setDisplayResults] = useState<string>('');

  const testGetDispatchByBooking = async () => {
    setLoading(true);
    try {
      const result = await dispatchService.getDispatchByBookingId(17);
      setDisplayResults(JSON.stringify(result, null, 2));
    } catch (error) {
      const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      setDisplayResults(JSON.stringify(errorResult, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const testGetDispatchesByDriver = async () => {
    setLoading(true);
    try {
      const result = await dispatchService.getDispatchesByDriver(3);
      setDisplayResults(JSON.stringify(result, null, 2));
    } catch (error) {
      const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      setDisplayResults(JSON.stringify(errorResult, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const testAssignDriver = async () => {
    setLoading(true);
    try {
      const result = await dispatchService.assignDriver(3, 3);
      setDisplayResults(JSON.stringify(result, null, 2));
    } catch (error) {
      const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      setDisplayResults(JSON.stringify(errorResult, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const testUpdateDispatchStatus = async () => {
    setLoading(true);
    try {
      const result = await dispatchService.updateDispatchStatusAdvanced(3, {
        status: 'dispatched',
        dispatch_time: new Date().toISOString(),
      });
      setDisplayResults(JSON.stringify(result, null, 2));
    } catch (error) {
      const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      setDisplayResults(JSON.stringify(errorResult, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const testCancelDispatch = async () => {
    setLoading(true);
    try {
      const result = await dispatchService.cancelDispatch(3);
      setDisplayResults(JSON.stringify(result, null, 2));
    } catch (error) {
      const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      setDisplayResults(JSON.stringify(errorResult, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const testGetDispatchWithDetails = async () => {
    setLoading(true);
    try {
      const result = await dispatchService.getDispatchWithDetails(3);
      setDisplayResults(JSON.stringify(result, null, 2));
    } catch (error) {
      const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      setDisplayResults(JSON.stringify(errorResult, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const testGetDispatchesByStatusDedicated = async () => {
    setLoading(true);
    try {
      const result = await dispatchService.getDispatchesByStatusDedicated('completed');
      setDisplayResults(JSON.stringify(result, null, 2));
    } catch (error) {
      const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      setDisplayResults(JSON.stringify(errorResult, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dispatch API Endpoints Test</h1>
      
      <ComponentCard title="New Endpoint Tests">
        <div className="p-6 space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={testGetDispatchByBooking} disabled={loading}>
              Get Dispatch by Booking ID (17)
            </Button>
            <Button onClick={testGetDispatchesByDriver} disabled={loading}>
              Get Dispatches by Driver ID (3)
            </Button>
            <Button onClick={testAssignDriver} disabled={loading}>
              Assign Driver to Dispatch
            </Button>
            <Button onClick={testUpdateDispatchStatus} disabled={loading}>
              Update Dispatch Status
            </Button>
            <Button onClick={testCancelDispatch} disabled={loading}>
              Cancel Dispatch
            </Button>
            <Button onClick={testGetDispatchWithDetails} disabled={loading}>
              Get Dispatch with Details
            </Button>
            <Button onClick={testGetDispatchesByStatusDedicated} disabled={loading}>
              Get Dispatches by Status
            </Button>
          </div>
          
          {loading && <p>Loading...</p>}
          
          {displayResults && (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {displayResults}
            </pre>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}