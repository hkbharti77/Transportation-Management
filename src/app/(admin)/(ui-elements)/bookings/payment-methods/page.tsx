'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
}

export default function PaymentMethodsPage() {
  const { user, isAuthenticated } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'card', name: 'Credit/Debit Card', description: 'Accept all major credit and debit cards', enabled: true, icon: '💳' },
    { id: 'upi', name: 'UPI', description: 'Unified Payments Interface for instant transfers', enabled: true, icon: '📱' },
    { id: 'cash', name: 'Cash', description: 'Traditional cash payments', enabled: true, icon: '💵' },
    { id: 'wallet', name: 'Digital Wallet', description: 'Pay with digital wallets like PayPal, Apple Pay', enabled: false, icon: '👝' },
    { id: 'bank_transfer', name: 'Bank Transfer', description: 'Direct bank transfers', enabled: true, icon: '🏦' },
    { id: 'net_banking', name: 'Net Banking', description: 'Online banking payments', enabled: false, icon: '💻' },
    { id: 'crypto', name: 'Cryptocurrency', description: 'Bitcoin, Ethereum and other cryptocurrencies', enabled: false, icon: '₿' },
  ]);
  const [, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!isAuthenticated || user?.role !== 'admin') return;
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation:
        // const methods = await paymentService.getPaymentMethods();
        // setPaymentMethods(methods.map(method => ({
        //   id: method,
        //   name: method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' '),
        //   description: `${method.replace('_', ' ')} payment method`,
        //   enabled: true,
        //   icon: getIconForMethod(method)
        // })));
      } catch (err) {
        console.error('Error loading payment methods:', err);
        setError(err instanceof Error ? err.message : 'Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, [isAuthenticated, user]);

  const handleToggleMethod = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };


  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Payment Methods" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💳 Payment Methods
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage available payment methods for customers
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
        {paymentMethods.map((method) => (
          <ComponentCard key={method.id} title={`${method.name} Method`}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{method.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {method.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {method.description}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleToggleMethod(method.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                    method.enabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      method.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Button>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  method.enabled 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {method.enabled ? 'Enabled' : 'Disabled'}
                </span>
                
                <Button
                  onClick={() => handleToggleMethod(method.id)}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    method.enabled
                      ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-800/40'
                      : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-800/40'
                  }`}
                >
                  {method.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          </ComponentCard>
        ))}
      </div>

      <ComponentCard title="Information">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200">Security</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                All payment methods are PCI DSS compliant and use industry-standard encryption.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-200">Fees</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Transaction fees vary by payment method. Check individual method details for specifics.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-medium text-purple-800 dark:text-purple-200">Integration</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                New payment methods can be integrated through the payment gateway configuration.
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}