'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';

interface InvoiceStatus {
  id: string;
  name: string;
  description: string;
  color: string;
  count?: number;
}

export default function InvoiceStatusesPage() {
  const { user, isAuthenticated } = useAuth();
  const [invoiceStatuses] = useState<InvoiceStatus[]>([
    { id: 'draft', name: 'Draft', description: 'Invoice created but not yet sent to customer', color: 'bg-gray-500' },
    { id: 'sent', name: 'Sent', description: 'Invoice has been sent to the customer', color: 'bg-blue-500' },
    { id: 'paid', name: 'Paid', description: 'Invoice has been fully paid by the customer', color: 'bg-green-500' },
    { id: 'overdue', name: 'Overdue', description: 'Invoice payment is past the due date', color: 'bg-red-500' },
    { id: 'cancelled', name: 'Cancelled', description: 'Invoice has been cancelled', color: 'bg-purple-500' },
  ]);
  const [, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoiceStatuses = async () => {
      if (!isAuthenticated || user?.role !== 'admin') return;
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation:
        // const statuses = await invoiceService.getInvoiceStatuses();
        // setInvoiceStatuses(statuses.map(status => ({
        //   id: status,
        //   name: status.charAt(0).toUpperCase() + status.slice(1),
        //   description: `${status} invoice status`,
        //   color: getColorForStatus(status)
        // })));
      } catch (err) {
        console.error('Error loading invoice statuses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invoice statuses');
      } finally {
        setLoading(false);
      }
    };

    loadInvoiceStatuses();
  }, [isAuthenticated, user]);


  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Invoice Statuses" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🧾 Invoice Statuses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of all invoice status types and their meanings
          </p>
        </div>
      </div>

      {error && (
        <ComponentCard title="Error">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        </ComponentCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoiceStatuses.map((status) => (
          <ComponentCard key={status.id} title={`${status.name} Status`}>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${status.color}`}></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {status.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {status.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status ID</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{status.id}</span>
                </div>
              </div>
            </div>
          </ComponentCard>
        ))}
      </div>

      <ComponentCard title="Status Flow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Status Flow</h2>
          <div className="overflow-x-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Draft</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2"></div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Sent</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2"></div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Paid</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <h3 className="font-medium text-red-800 dark:text-red-200">Overdue</h3>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  Invoices that are not paid by their due date are marked as overdue. Automated reminders can be sent.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <h3 className="font-medium text-purple-800 dark:text-purple-200">Cancelled</h3>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                  Invoices can be cancelled if they are no longer valid or if the service was not provided.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}