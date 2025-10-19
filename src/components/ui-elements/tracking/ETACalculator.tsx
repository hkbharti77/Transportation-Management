'use client';

import React, { useState } from 'react';
import { trackingService, ETARequest, ETAResponse } from '@/services/trackingService';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import ComponentCard from '@/components/common/ComponentCard';

const ETACalculator = () => {
  const [formData, setFormData] = useState<ETARequest>({
    source_lat: 0,
    source_lng: 0,
    dest_lat: 0,
    dest_lng: 0,
    transport_mode: 'driving'
  });
  
  const [result, setResult] = useState<ETAResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('lat') || name.includes('lng') 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Validate coordinates
      if (formData.source_lat < -90 || formData.source_lat > 90) {
        throw new Error('Source latitude must be between -90 and 90');
      }
      
      if (formData.source_lng < -180 || formData.source_lng > 180) {
        throw new Error('Source longitude must be between -180 and 180');
      }
      
      if (formData.dest_lat < -90 || formData.dest_lat > 90) {
        throw new Error('Destination latitude must be between -90 and 90');
      }
      
      if (formData.dest_lng < -180 || formData.dest_lng > 180) {
        throw new Error('Destination longitude must be between -180 and 180');
      }
      
      const response = await trackingService.calculateETA(formData);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while calculating ETA');
      console.error('ETA calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatETA = (etaString: string) => {
    return new Date(etaString).toLocaleString();
  };

  return (
    <ComponentCard title="ETA Calculator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source Latitude
                </label>
                <Input
                  type="number"
                  name="source_lat"
                  value={formData.source_lat}
                  onChange={handleInputChange}
                  step={0.000001}
                  min="-90"
                  max="90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source Longitude
                </label>
                <Input
                  type="number"
                  name="source_lng"
                  value={formData.source_lng}
                  onChange={handleInputChange}
                  step={0.000001}
                  min="-180"
                  max="180"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destination Latitude
                </label>
                <Input
                  type="number"
                  name="dest_lat"
                  value={formData.dest_lat}
                  onChange={handleInputChange}
                  step={0.000001}
                  min="-90"
                  max="90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destination Longitude
                </label>
                <Input
                  type="number"
                  name="dest_lng"
                  value={formData.dest_lng}
                  onChange={handleInputChange}
                  step={0.000001}
                  min="-180"
                  max="180"
                />
              </div>

            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transport Mode
              </label>
              <select
                name="transport_mode"
                value={formData.transport_mode}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-stroke bg-white py-2 px-3 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              >
                <option value="driving">Driving</option>
                <option value="walking">Walking</option>
                <option value="cycling">Cycling</option>
                <option value="transit">Transit</option>
              </select>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Calculating...' : 'Calculate ETA'}
            </Button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
        
        <div>
          {result && (
            <div className="bg-white dark:bg-dark-2 rounded-lg p-4 shadow-sm border border-stroke dark:border-dark-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ETA Results</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Distance:</span>
                  <span className="font-medium">{result.distance_km.toFixed(2)} km</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium">{result.duration_minutes.toFixed(0)} minutes</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Arrival:</span>
                  <span className="font-medium">{formatETA(result.eta)}</span>
                </div>
                
                <div className="pt-3 border-t border-stroke dark:border-dark-3">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Route Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                      <span className="capitalize">{result.route_summary.transport_mode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Speed:</span>
                      <span>{result.route_summary.avg_speed_kmh.toFixed(1)} km/h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!result && !loading && !error && (
            <div className="bg-gray-50 dark:bg-dark-3 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Enter source and destination coordinates to calculate ETA
              </p>
            </div>
          )}
        </div>
      </div>
    </ComponentCard>
  );
};

export default ETACalculator;