'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { invoiceService, GenerateInvoicePDFRequest, GenerateInvoicePDFResponse } from '@/services/invoiceService';

export default function GenerateInvoicePDFPage() {
  const { user, isAuthenticated } = useAuth();
  const [pdfData, setPdfData] = useState<GenerateInvoicePDFRequest>({
    invoice_id: 2,
    template: 'default'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GenerateInvoicePDFResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPdfData(prev => ({
      ...prev,
      [name]: name === 'invoice_id' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || user?.role !== 'admin') return;
    
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      // Generate invoice PDF using the real API
      const response = await invoiceService.generateInvoicePDF(pdfData);
      setResult(response);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.pdf_url) {
      window.open(result.pdf_url, '_blank');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Generate Invoice PDF" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📄 Generate Invoice PDF
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate PDF for invoice
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="PDF Generation">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">PDF Generation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Invoice ID
                </label>
                <input
                  type="number"
                  name="invoice_id"
                  value={pdfData.invoice_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template
                </label>
                <select
                  name="template"
                  value={pdfData.template}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="default">Default</option>
                  <option value="minimal">Minimal</option>
                  <option value="detailed">Detailed</option>
                  <option value="branded">Branded</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  {loading ? 'Generating PDF...' : 'Generate PDF'}
                </Button>
              </div>
            </form>
          </div>
        </ComponentCard>

        <ComponentCard title="Information">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">PDF Generation Information</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">Templates</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 list-disc list-inside">
                  <li>Default - Standard invoice template</li>
                  <li>Minimal - Clean and simple design</li>
                  <li>Detailed - Comprehensive information layout</li>
                  <li>Branded - Company branded template</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-800 dark:text-green-200">Supported Formats</h3>
                <ul className="text-sm text-green-700 dark:text-green-300 mt-1 list-disc list-inside">
                  <li>PDF - Portable Document Format</li>
                  <li>HTML - Web-friendly format</li>
                  <li>PNG - Image format</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-medium text-purple-800 dark:text-purple-200">Customization</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  Templates can be customized with company logo, colors, and additional information.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Storage</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Generated PDFs are stored securely and can be accessed later from the invoice details page.
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
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

      {result && (
        <ComponentCard title="Result">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              PDF Generated Successfully
            </h2>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {result.success ? 'Yes' : 'No'}
                  </p>
                </div>
                {result.file_size && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">File Size</p>
                    <p className="font-medium text-gray-900 dark:text-white">{result.file_size} bytes</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">PDF URL</p>
                  <p className="font-medium text-blue-600 dark:text-blue-400 break-all">{result.pdf_url}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Message</p>
                <p className="font-medium text-gray-900 dark:text-white">{result.message}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}