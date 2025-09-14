'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import { paymentService } from '@/services/paymentService';
import { invoiceService } from '@/services/invoiceService';

interface ExportOptions {
  type: 'payments' | 'invoices';
  format: 'csv' | 'json';
  user_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

interface ExportRequest {
  format: 'csv' | 'json';
  user_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}

interface ExportResult {
  data: string;
  filename: string;
  content_type: string;
}

export default function ExportPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    type: 'payments',
    format: 'csv'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setExportOptions(prev => ({
      ...prev,
      [name]: value || undefined
    }));
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setExportResult(null);

    try {
      // Convert user_id to number if provided
      const exportRequest: ExportRequest = {
        format: exportOptions.format,
        status: exportOptions.status,
        date_from: exportOptions.date_from,
        date_to: exportOptions.date_to
      };

      if (exportOptions.user_id) {
        const userId = parseInt(exportOptions.user_id, 10);
        if (!isNaN(userId)) {
          exportRequest.user_id = userId;
        }
      }

      let result;
      if (exportOptions.type === 'payments') {
        result = await paymentService.exportPayments(exportRequest);
      } else {
        result = await invoiceService.exportInvoices(exportRequest);
      }
      setExportResult(result);
    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!exportResult) return;

    const blob = new Blob([exportResult.data], { type: exportResult.content_type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Only render the content if user is authenticated and is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Export Payments & Invoices" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📤 Export Payments & Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Export payment and invoice data in various formats
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Options</h2>
            <form onSubmit={handleExport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Export Type
                </label>
                <select
                  name="type"
                  value={exportOptions.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="payments">Payments</option>
                  <option value="invoices">Invoices</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Format
                </label>
                <select
                  name="format"
                  value={exportOptions.format}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID (Optional)
                </label>
                <input
                  type="text"
                  name="user_id"
                  value={exportOptions.user_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter user ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status (Optional)
                </label>
                <input
                  type="text"
                  name="status"
                  value={exportOptions.status || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter status"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date From (Optional)
                  </label>
                  <input
                    type="date"
                    name="date_from"
                    value={exportOptions.date_from || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date To (Optional)
                  </label>
                  <input
                    type="date"
                    name="date_to"
                    value={exportOptions.date_to || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  {loading ? 'Exporting...' : 'Export Data'}
                </Button>
              </div>
            </form>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Information</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">Export Formats</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Export your data in CSV or JSON format for easy integration with other systems.
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-800 dark:text-green-200">Filter Options</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Filter your export by user ID, status, or date range to get exactly the data you need.
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-medium text-purple-800 dark:text-purple-200">Large Exports</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  For large datasets, the export may take a few moments to complete. You&apos;ll be notified when it&apos;s ready.
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      {error && (
        <ComponentCard title="">
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

      {exportResult && (
        <ComponentCard title="">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Export Complete
              </h2>
              <Button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📥 Download File
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
              <pre className="text-xs text-gray-900 dark:text-white overflow-x-auto max-h-64">
                {exportResult.data}
              </pre>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Your {exportOptions.type} data has been exported.
                Click the download button to save the file to your device.
              </p>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}