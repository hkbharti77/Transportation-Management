'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import { paymentService, PaymentStatistics } from '@/services/paymentService';
import { invoiceService, InvoiceStatistics } from '@/services/invoiceService';

export default function PaymentStatisticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [paymentStats, setPaymentStats] = useState<PaymentStatistics | null>(null);
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStatistics = async () => {
      if (!isAuthenticated || user?.role !== 'admin') return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch actual statistics from API endpoints
        const paymentStatsData = await paymentService.getPaymentStatistics();
        const invoiceStatsData = await invoiceService.getInvoiceStatistics();
        setPaymentStats(paymentStatsData);
        setInvoiceStats(invoiceStatsData);
      } catch (err) {
        console.error('Error loading statistics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Payment & Invoice Statistics" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Payment & Invoice Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of payment and invoice metrics
          </p>
        </div>
      </div>

      {paymentStats && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ComponentCard title="Total Payments">
              <div className="p-4">
                <div className="text-3xl mb-2">💳</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Payments</p>
                <p className="text-2xl font-bold text-blue-600">{paymentStats.total_payments}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Total Amount">
              <div className="p-4">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">${paymentStats.total_amount.toFixed(2)}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Successful Payments">
              <div className="p-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful Payments</p>
                <p className="text-2xl font-bold text-green-600">{paymentStats.successful_payments}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Failed Payments">
              <div className="p-4">
                <div className="text-3xl mb-2">❌</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed Payments</p>
                <p className="text-2xl font-bold text-red-600">{paymentStats.failed_payments}</p>
              </div>
            </ComponentCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComponentCard title="Pending Payments">
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">{paymentStats.pending_payments}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Refunded Amount">
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Refunded Amount</p>
                <p className="text-2xl font-bold text-purple-600">${paymentStats.refunded_amount.toFixed(2)}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Average Payment">
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Payment</p>
                <p className="text-2xl font-bold text-indigo-600">${paymentStats.average_payment.toFixed(2)}</p>
              </div>
            </ComponentCard>
          </div>

          <ComponentCard title="Payment Methods Distribution">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods Distribution</h3>
              <div className="space-y-3">
                {Object.entries(paymentStats.payment_methods_distribution).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">{method.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / paymentStats.total_payments) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ComponentCard>
        </>
      )}

      {invoiceStats && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8">Invoice Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ComponentCard title="Total Invoices">
              <div className="p-4">
                <div className="text-3xl mb-2">🧾</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">{invoiceStats.total_invoices}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Total Amount">
              <div className="p-4">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">${invoiceStats.total_amount.toFixed(2)}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Paid Invoices">
              <div className="p-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Paid Invoices</p>
                <p className="text-2xl font-bold text-green-600">{invoiceStats.paid_invoices}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Overdue Invoices">
              <div className="p-4">
                <div className="text-3xl mb-2">⏰</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Invoices</p>
                <p className="text-2xl font-bold text-red-600">{invoiceStats.overdue_invoices}</p>
              </div>
            </ComponentCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComponentCard title="Pending Invoices">
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Invoices</p>
                <p className="text-2xl font-bold text-yellow-600">{invoiceStats.pending_invoices}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Average Invoice">
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Invoice</p>
                <p className="text-2xl font-bold text-indigo-600">${invoiceStats.average_invoice.toFixed(2)}</p>
              </div>
            </ComponentCard>

            <ComponentCard title="Total Tax Collected">
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tax Collected</p>
                <p className="text-2xl font-bold text-purple-600">${invoiceStats.total_tax_collected.toFixed(2)}</p>
              </div>
            </ComponentCard>
          </div>
        </>
      )}
    </div>
  );
}