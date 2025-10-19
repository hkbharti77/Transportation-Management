'use client';

import React from 'react';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import ETACalculator from '@/components/ui-elements/tracking/ETACalculator';

const ETACalculatorPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <PageBreadCrumb pageTitle="ETA Calculator" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ETA Calculator</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Calculate estimated time of arrival based on source and destination coordinates
        </p>
      </div>
      
      <ETACalculator />
      
      <div className="mt-8 bg-white dark:bg-dark-2 rounded-lg p-6 shadow-sm border border-stroke dark:border-dark-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How to use</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
          <li>Enter valid latitude and longitude coordinates for both source and destination</li>
          <li>Latitude values must be between -90 and 90</li>
          <li>Longitude values must be between -180 and 180</li>
          <li>Select the appropriate transport mode for accurate calculations</li>
          <li>Click &quot;Calculate ETA&quot; to get the estimated arrival time and route details</li>
        </ul>
      </div>
    </div>
  );
};

export default ETACalculatorPage;