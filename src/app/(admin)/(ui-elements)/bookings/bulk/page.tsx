'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { paymentService } from '@/services/paymentService';
import { invoiceService, CreateInvoiceRequest } from '@/services/invoiceService';

interface BulkPaymentData {
  user_id: number;
  amount: number;
  method: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer' | 'net_banking' | 'crypto';
  booking_id?: number;
  order_id?: number;
  trip_id?: number;
  invoice_id?: number;
  gateway_reference?: string;
}

interface BulkInvoiceData {
  user_id: number;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  currency: string;
  booking_id?: number;
  due_date?: string;
  notes?: string;
  billing_address?: string;
  shipping_address?: string;
  invoice_items: {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
  }[];
}

export default function BulkOperationsPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');
  const [bulkPayments, setBulkPayments] = useState<BulkPaymentData[]>([
    {
      user_id: 1,
      amount: 150.00,
      method: 'card',
      booking_id: 1,
    }
  ]);
  const [bulkInvoices, setBulkInvoices] = useState<BulkInvoiceData[]>([
    {
      user_id: 1,
      total_amount: 200.00,
      subtotal: 180.00,
      tax_amount: 20.00,
      discount_amount: 0.00,
      currency: 'USD',
      booking_id: 1,
      invoice_items: [
        {
          description: 'Cargo Transportation Service',
          quantity: 1,
          unit_price: 150.00,
          tax_rate: 10.0
        }
      ]
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);

  const handleAddPaymentRow = () => {
    setBulkPayments([
      ...bulkPayments,
      {
        user_id: 1,
        amount: 0,
        method: 'cash',
      }
    ]);
  };

  const handleRemovePaymentRow = (index: number) => {
    if (bulkPayments.length > 1) {
      const newPayments = [...bulkPayments];
      newPayments.splice(index, 1);
      setBulkPayments(newPayments);
    }
  };

  const handlePaymentChange = (index: number, field: string, value: string | number) => {
    const newPayments = [...bulkPayments];
    const payment = { ...newPayments[index] };
    
    // Type-safe field updates
    switch (field) {
      case 'user_id':
        payment.user_id = value === '' ? 0 : Number(value);
        break;
      case 'amount':
        payment.amount = value === '' ? 0 : Number(value);
        break;
      case 'method':
        payment.method = value as BulkPaymentData['method'];
        break;
      case 'booking_id':
        payment.booking_id = value === '' ? undefined : Number(value);
        break;
      case 'order_id':
        payment.order_id = value === '' ? undefined : Number(value);
        break;
      case 'trip_id':
        payment.trip_id = value === '' ? undefined : Number(value);
        break;
      case 'invoice_id':
        payment.invoice_id = value === '' ? undefined : Number(value);
        break;
      case 'gateway_reference':
        payment.gateway_reference = String(value);
        break;
      default:
        // Handle any other fields dynamically
        (payment as Record<string, unknown>)[field] = field.includes('_id') || field === 'amount' ? 
          (value === '' ? undefined : Number(value)) : value;
    }
    
    newPayments[index] = payment;
    setBulkPayments(newPayments);
  };

  const handleAddInvoiceRow = () => {
    setBulkInvoices([
      ...bulkInvoices,
      {
        user_id: 1,
        total_amount: 0,
        subtotal: 0,
        tax_amount: 0,
        discount_amount: 0,
        currency: 'USD',
        invoice_items: [
          {
            description: '',
            quantity: 1,
            unit_price: 0,
            tax_rate: 0
          }
        ]
      }
    ]);
  };

  const handleRemoveInvoiceRow = (index: number) => {
    if (bulkInvoices.length > 1) {
      const newInvoices = [...bulkInvoices];
      newInvoices.splice(index, 1);
      setBulkInvoices(newInvoices);
    }
  };

  const handleInvoiceChange = (index: number, field: string, value: string | number) => {
    const newInvoices = [...bulkInvoices];
    const invoice = { ...newInvoices[index] };
    
    // Type-safe field updates
    switch (field) {
      case 'user_id':
        invoice.user_id = value === '' ? 0 : Number(value);
        break;
      case 'total_amount':
        invoice.total_amount = value === '' ? 0 : Number(value);
        break;
      case 'subtotal':
        invoice.subtotal = value === '' ? 0 : Number(value);
        break;
      case 'tax_amount':
        invoice.tax_amount = value === '' ? 0 : Number(value);
        break;
      case 'discount_amount':
        invoice.discount_amount = value === '' ? 0 : Number(value);
        break;
      case 'currency':
        invoice.currency = String(value);
        break;
      case 'booking_id':
        invoice.booking_id = value === '' ? undefined : Number(value);
        break;
      case 'due_date':
        invoice.due_date = String(value);
        break;
      case 'notes':
        invoice.notes = String(value);
        break;
      case 'billing_address':
        invoice.billing_address = String(value);
        break;
      case 'shipping_address':
        invoice.shipping_address = String(value);
        break;
      default:
        // Handle any other fields dynamically
        (invoice as Record<string, unknown>)[field] = field.includes('_id') || 
          field.includes('amount') || field.includes('price') || field.includes('rate') ? 
          (value === '' ? undefined : Number(value)) : value;
    }
    
    newInvoices[index] = invoice;
    setBulkInvoices(newInvoices);
  };

  const handleAddInvoiceItem = (invoiceIndex: number) => {
    const newInvoices = [...bulkInvoices];
    newInvoices[invoiceIndex].invoice_items.push({
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 0
    });
    setBulkInvoices(newInvoices);
  };

  const handleRemoveInvoiceItem = (invoiceIndex: number, itemIndex: number) => {
    const newInvoices = [...bulkInvoices];
    if (newInvoices[invoiceIndex].invoice_items.length > 1) {
      newInvoices[invoiceIndex].invoice_items.splice(itemIndex, 1);
      setBulkInvoices(newInvoices);
    }
  };

  const handleInvoiceItemChange = (invoiceIndex: number, itemIndex: number, field: string, value: string | number) => {
    const newInvoices = [...bulkInvoices];
    (newInvoices[invoiceIndex].invoice_items[itemIndex] as Record<string, unknown>)[field] = 
      field.includes('quantity') || field.includes('price') || field.includes('rate') ? 
      (value === '' ? undefined : Number(value)) : value;
    setBulkInvoices(newInvoices);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsFileUploaded(true);
      parseFile(file);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          if (activeTab === 'payments') {
            setBulkPayments(jsonData as BulkPaymentData[]);
          } else {
            setBulkInvoices(jsonData as BulkInvoiceData[]);
          }
        } else if (file.name.endsWith('.csv')) {
          const csvData = parseCSV(content);
          if (activeTab === 'payments') {
            // Convert parsed CSV data to BulkPaymentData
            const payments: BulkPaymentData[] = csvData.map(row => ({
              user_id: typeof row.user_id === 'number' ? row.user_id : parseInt(row.user_id as string) || 0,
              amount: typeof row.amount === 'number' ? row.amount : parseFloat(row.amount as string) || 0,
              method: (row.method as BulkPaymentData['method']) || 'cash',
              booking_id: row.booking_id ? (typeof row.booking_id === 'number' ? row.booking_id : parseInt(row.booking_id as string)) : undefined,
              order_id: row.order_id ? (typeof row.order_id === 'number' ? row.order_id : parseInt(row.order_id as string)) : undefined,
              trip_id: row.trip_id ? (typeof row.trip_id === 'number' ? row.trip_id : parseInt(row.trip_id as string)) : undefined,
              invoice_id: row.invoice_id ? (typeof row.invoice_id === 'number' ? row.invoice_id : parseInt(row.invoice_id as string)) : undefined,
              gateway_reference: row.gateway_reference ? String(row.gateway_reference) : undefined
            }));
            setBulkPayments(payments);
          } else {
            // Convert parsed CSV data to BulkInvoiceData
            const invoices: BulkInvoiceData[] = csvData.map(row => ({
              user_id: typeof row.user_id === 'number' ? row.user_id : parseInt(row.user_id as string) || 0,
              total_amount: typeof row.total_amount === 'number' ? row.total_amount : parseFloat(row.total_amount as string) || 0,
              subtotal: typeof row.subtotal === 'number' ? row.subtotal : parseFloat(row.subtotal as string) || 0,
              tax_amount: typeof row.tax_amount === 'number' ? row.tax_amount : parseFloat(row.tax_amount as string) || 0,
              discount_amount: typeof row.discount_amount === 'number' ? row.discount_amount : parseFloat(row.discount_amount as string) || 0,
              currency: String(row.currency) || 'USD',
              booking_id: row.booking_id ? (typeof row.booking_id === 'number' ? row.booking_id : parseInt(row.booking_id as string)) : undefined,
              due_date: row.due_date ? String(row.due_date) : undefined,
              notes: row.notes ? String(row.notes) : undefined,
              billing_address: row.billing_address ? String(row.billing_address) : undefined,
              shipping_address: row.shipping_address ? String(row.shipping_address) : undefined,
              invoice_items: [] // This would need to be parsed from a separate field or structure
            }));
            setBulkInvoices(invoices);
          }
        }
      } catch (err) {
        console.error('Error parsing file:', err);
        setError('Failed to parse file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string): Array<Record<string, string | number>> => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const result: Array<Record<string, string | number>> = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      const currentLine = lines[i].split(',');
      const obj: Record<string, string | number> = {};
      
      for (let j = 0; j < headers.length; j++) {
        const key = headers[j];
        let value: string | number = currentLine[j]?.trim() || '';
        
        // Try to convert to number if possible
        if (typeof value === 'string' && !isNaN(Number(value)) && value !== '') {
          value = Number(value);
        }
        
        // Handle boolean values by keeping them as strings and letting the form handlers convert them
        if (typeof value === 'string') {
          if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            // Keep as string, form handlers will convert appropriately
          }
        }
        
        obj[key] = value;
      }
      
      result.push(obj);
    }
    
    return result;
  };

  const handleBulkCreatePayments = async () => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      // Convert bulk payment data to API format
      const paymentRequests = bulkPayments.map(payment => ({
        amount: payment.amount,
        method: payment.method,
        user_id: payment.user_id,
        booking_id: payment.booking_id,
        order_id: payment.order_id,
        trip_id: payment.trip_id,
        invoice_id: payment.invoice_id,
        gateway_reference: payment.gateway_reference
      }));
      
      // Create payments using the real API
      const createdPayments = await Promise.all(
        paymentRequests.map(request => paymentService.createPayment(request))
      );
      
      setResult(createdPayments);
    } catch (err) {
      console.error('Error creating bulk payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to create bulk payments');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreateInvoices = async () => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      // Convert bulk invoice data to API format
      const invoiceRequests: CreateInvoiceRequest[] = bulkInvoices.map(invoice => ({
        user_id: invoice.user_id,
        total_amount: invoice.total_amount,
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        discount_amount: invoice.discount_amount,
        currency: invoice.currency,
        booking_id: invoice.booking_id,
        due_date: invoice.due_date,
        notes: invoice.notes,
        billing_address: invoice.billing_address,
        shipping_address: invoice.shipping_address,
        invoice_items: invoice.invoice_items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate
        }))
      }));
      
      // Create invoices using the real API
      const result = await invoiceService.createBulkInvoices(invoiceRequests);
      setResult(result);
    } catch (err) {
      console.error('Error creating bulk invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to create bulk invoices');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleFile = () => {
    let sampleData: unknown;
    let filename: string;
    let fileType: string;
    
    if (activeTab === 'payments') {
      sampleData = [
        {
          user_id: 1,
          amount: 150.00,
          method: 'card',
          booking_id: 1,
          order_id: 1,
          trip_id: 1,
          invoice_id: 1,
          gateway_reference: 'PAY-123456'
        }
      ];
      filename = 'sample_payments.json';
      fileType = 'application/json';
    } else {
      sampleData = [
        {
          user_id: 1,
          total_amount: 200.00,
          subtotal: 180.00,
          tax_amount: 20.00,
          discount_amount: 0.00,
          currency: 'USD',
          booking_id: 1,
          due_date: '2023-12-31',
          notes: 'Sample invoice',
          billing_address: '123 Main St',
          shipping_address: '123 Main St',
          invoice_items: [
            {
              description: 'Cargo Transportation Service',
              quantity: 1,
              unit_price: 150.00,
              tax_rate: 10.0
            }
          ]
        }
      ];
      filename = 'sample_invoices.json';
      fileType = 'application/json';
    }
    
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Bulk Operations" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📦 Bulk Operations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create multiple payments or invoices at once
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Bulk Payments
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Bulk Invoices
          </button>
        </nav>
      </div>

      {/* File Upload Section */}
      <ComponentCard title="">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upload {activeTab === 'payments' ? 'Payments' : 'Invoices'} File
          </h2>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {isFileUploaded 
                  ? `File uploaded: ${uploadedFile?.name}` 
                  : `Drag and drop your ${activeTab === 'payments' ? 'payments' : 'invoices'} CSV or JSON file here`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Supported formats: CSV, JSON
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 cursor-pointer">
                  Select File
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <Button
                  onClick={downloadSampleFile}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Download Sample
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              {activeTab === 'payments' 
                ? 'Upload a CSV or JSON file containing payment data. The file should include columns/fields for user_id, amount, method, and optional fields like booking_id, order_id, etc.' 
                : 'Upload a CSV or JSON file containing invoice data. The file should include columns/fields for user_id, total_amount, subtotal, tax_amount, and invoice_items array.'}
            </p>
          </div>
        </div>
      </ComponentCard>

      {activeTab === 'payments' && (
        <ComponentCard title="">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Payment Creation</h2>
              <Button
                onClick={handleAddPaymentRow}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add Payment
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {bulkPayments.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={payment.user_id}
                          onChange={(e) => handlePaymentChange(index, 'user_id', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={payment.amount}
                          onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={payment.method}
                          onChange={(e) => handlePaymentChange(index, 'method', e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                          <option value="wallet">Wallet</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="net_banking">Net Banking</option>
                          <option value="crypto">Crypto</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={payment.booking_id || ''}
                          onChange={(e) => handlePaymentChange(index, 'booking_id', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          onClick={() => handleRemovePaymentRow(index)}
                          disabled={bulkPayments.length <= 1}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleBulkCreatePayments}
                disabled={loading}
                className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
              >
                {loading ? 'Creating Payments...' : 'Create All Payments'}
              </Button>
            </div>
          </div>
        </ComponentCard>
      )}

      {activeTab === 'invoices' && (
        <ComponentCard title="">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Invoice Creation</h2>
              <Button
                onClick={handleAddInvoiceRow}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add Invoice
              </Button>
            </div>
            
            <div className="space-y-6">
              {bulkInvoices.map((invoice, invoiceIndex) => (
                <div key={invoiceIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Invoice #{invoiceIndex + 1}</h3>
                    <Button
                      onClick={() => handleRemoveInvoiceRow(invoiceIndex)}
                      disabled={bulkInvoices.length <= 1}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        User ID
                      </label>
                      <input
                        type="number"
                        value={invoice.user_id}
                        onChange={(e) => handleInvoiceChange(invoiceIndex, 'user_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Booking ID
                      </label>
                      <input
                        type="number"
                        value={invoice.booking_id || ''}
                        onChange={(e) => handleInvoiceChange(invoiceIndex, 'booking_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={invoice.total_amount}
                        onChange={(e) => handleInvoiceChange(invoiceIndex, 'total_amount', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Currency
                      </label>
                      <input
                        type="text"
                        value={invoice.currency}
                        onChange={(e) => handleInvoiceChange(invoiceIndex, 'currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Invoice Items</h4>
                      <Button
                        onClick={() => handleAddInvoiceItem(invoiceIndex)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        + Add Item
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {invoice.invoice_items.map((item, itemIndex) => (
                        <div key={itemIndex} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                          <div className="md:col-span-2">
                            <label className="block text-xs text-gray-600 dark:text-gray-400">Description</label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleInvoiceItemChange(invoiceIndex, itemIndex, 'description', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400">Quantity</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleInvoiceItemChange(invoiceIndex, itemIndex, 'quantity', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400">Unit Price</label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => handleInvoiceItemChange(invoiceIndex, itemIndex, 'unit_price', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          
                          <div className="flex items-end">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-600 dark:text-gray-400">Tax Rate</label>
                              <input
                                type="number"
                                step="0.01"
                                value={item.tax_rate}
                                onChange={(e) => handleInvoiceItemChange(invoiceIndex, itemIndex, 'tax_rate', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <Button
                              onClick={() => handleRemoveInvoiceItem(invoiceIndex, itemIndex)}
                              disabled={invoice.invoice_items.length <= 1}
                              className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs disabled:opacity-50"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleBulkCreateInvoices}
                disabled={loading}
                className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
              >
                {loading ? 'Creating Invoices...' : 'Create All Invoices'}
              </Button>
            </div>
          </div>
        </ComponentCard>
      )}

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

      {result && (
        <ComponentCard title="">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Bulk Operation Complete
            </h2>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200">
                Successfully created {result.length} {activeTab}.
              </p>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}