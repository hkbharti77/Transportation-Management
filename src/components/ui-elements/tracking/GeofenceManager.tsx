'use client';

import React, { useState, useEffect } from 'react';
import { trackingService, Geofence, CreateGeofenceRequest } from '@/services/trackingService';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Alert from '@/components/ui/alert/Alert';

const GeofenceManager = () => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  
  const [formData, setFormData] = useState<CreateGeofenceRequest>({
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    radius: 1,
    is_active: true
  });

  // Load geofences on component mount
  useEffect(() => {
    loadGeofences();
  }, []);

  const loadGeofences = async () => {
    try {
      setLoading(true);
      const data = await trackingService.getGeofences();
      setGeofences(data);
      setError(null);
    } catch (err) {
      setError('Failed to load geofences');
      console.error('Error loading geofences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'latitude' || name === 'longitude' || name === 'radius' 
          ? parseFloat(value) || 0 
          : value 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingGeofence) {
        // Update existing geofence
        await trackingService.updateGeofence(editingGeofence.geofence_id!, formData);
        setSuccess('Geofence updated successfully');
      } else {
        // Create new geofence
        await trackingService.createGeofence(formData);
        setSuccess('Geofence created successfully');
      }
      
      // Reset form and reload data
      resetForm();
      loadGeofences();
    } catch (err) {
      setError(editingGeofence ? 'Failed to update geofence' : 'Failed to create geofence');
      console.error('Error saving geofence:', err);
    }
  };

  const handleEdit = (geofence: Geofence) => {
    setEditingGeofence(geofence);
    setFormData({
      name: geofence.name,
      description: geofence.description,
      latitude: geofence.latitude,
      longitude: geofence.longitude,
      radius: geofence.radius,
      is_active: geofence.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (geofenceId: number) => {
    if (!window.confirm('Are you sure you want to delete this geofence?')) {
      return;
    }
    
    try {
      await trackingService.deleteGeofence(geofenceId);
      setSuccess('Geofence deleted successfully');
      loadGeofences();
    } catch (err) {
      setError('Failed to delete geofence');
      console.error('Error deleting geofence:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      latitude: 0,
      longitude: 0,
      radius: 1,
      is_active: true
    });
    setEditingGeofence(null);
    setShowForm(false);
    setSuccess(null);
    setError(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <ComponentCard title="Geofence Management">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add New Geofence'}
          </Button>
          
          <Button variant="outline" onClick={loadGeofences} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {success && (
          <Alert 
            variant="success" 
            title="Success" 
            message={success} 
          />
        )}

        {error && (
          <Alert 
            variant="error" 
            title="Error" 
            message={error} 
          />
        )}

        {showForm && (
          <div className="mb-6 p-4 bg-white dark:bg-dark-2 rounded-lg border border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold mb-4">
              {editingGeofence ? 'Edit Geofence' : 'Create New Geofence'}
            </h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Radius (km) *
                </label>
                <Input
                  type="number"
                  name="radius"
                  value={formData.radius}
                  onChange={handleInputChange}
                  min="0.1"
                  step={0.1}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Latitude *
                </label>
                <Input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  step={0.0001}
                  min="-90"
                  max="90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Longitude *
                </label>
                <Input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  step={0.0001}
                  min="-180"
                  max="180"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-stroke bg-white py-2 px-3 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div className="md:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
              
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit">
                  {editingGeofence ? 'Update Geofence' : 'Create Geofence'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-3">
            <thead className="bg-gray-50 dark:bg-dark-3">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Radius
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-2 divide-y divide-gray-200 dark:divide-dark-3">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center">
                    Loading geofences...
                  </td>
                </tr>
              ) : geofences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center">
                    No geofences found
                  </td>
                </tr>
              ) : (
                geofences.map((geofence) => (
                  <tr key={geofence.geofence_id} className="hover:bg-gray-50 dark:hover:bg-dark-3">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {geofence.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {geofence.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {geofence.latitude.toFixed(4)}, {geofence.longitude.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {geofence.radius} km
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        geofence.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {geofence.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(geofence.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(geofence)}
                        className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(geofence.geofence_id!)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </div>
  );
};

export default GeofenceManager;