'use client';

import React from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import GeofenceManager from '@/components/ui-elements/tracking/GeofenceManager';

const GeofencesPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <PageBreadcrumb pageTitle="Geofence Management" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Geofence Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage geofences for location-based tracking and monitoring
        </p>
      </div>
      
      <GeofenceManager />
      
      <div className="mt-8 bg-white dark:bg-dark-2 rounded-lg p-6 shadow-sm border border-stroke dark:border-dark-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About Geofences</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
          <li>Geofences are virtual boundaries defined by a center point and radius</li>
          <li>They are used to trigger alerts when vehicles or assets enter or exit defined areas</li>
          <li>Each geofence can be activated or deactivated as needed</li>
          <li>Radius is defined in kilometers</li>
          <li>Coordinates must be valid (latitude: -90 to 90, longitude: -180 to 180)</li>
        </ul>
      </div>
    </div>
  );
};

export default GeofencesPage;