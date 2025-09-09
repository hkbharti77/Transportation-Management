'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { 
  analyticsService, 
  ServiceSummaryAnalytics,
  VehicleMaintenanceAnalytics,
  PartsInventoryAnalytics,
  MaintenanceScheduleAnalytics,
  ServiceCostAnalytics
} from '@/services/analyticsService';

export default function ServiceAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [serviceSummary, setServiceSummary] = useState<ServiceSummaryAnalytics | null>(null);
  const [vehicleMaintenance, setVehicleMaintenance] = useState<VehicleMaintenanceAnalytics | null>(null);
  const [partsInventory, setPartsInventory] = useState<PartsInventoryAnalytics | null>(null);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceScheduleAnalytics | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<ServiceCostAnalytics | null>(null);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyticsData = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString();

      // Load all analytics data in parallel
      const [
        summaryData,
        maintenanceData,
        inventoryData,
        scheduleData,
        costData
      ] = await Promise.allSettled([
        analyticsService.getServiceSummary(startDate, endDate),
        analyticsService.getVehicleMaintenanceAnalytics(),
        analyticsService.getPartsInventoryAnalytics(),
        analyticsService.getMaintenanceSchedule(30),
        analyticsService.getServiceCostAnalysis(startDate, endDate, 'month')
      ]);

      // Set data or handle errors
      if (summaryData.status === 'fulfilled') {
        setServiceSummary(summaryData.value);
      }
      if (maintenanceData.status === 'fulfilled') {
        setVehicleMaintenance(maintenanceData.value);
      }
      if (inventoryData.status === 'fulfilled') {
        setPartsInventory(inventoryData.value);
      }
      if (scheduleData.status === 'fulfilled') {
        setMaintenanceSchedule(scheduleData.value);
      }
      if (costData.status === 'fulfilled') {
        setCostAnalysis(costData.value);
      }

    } catch (error) {
      console.error('Error loading service analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, dateRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (isLoading && !serviceSummary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Service Analytics" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔧 Service Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analytics for fleet services and maintenance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Loading...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400">⚠️ {error}</div>
        </div>
      )}

      {/* Service Summary Overview */}
      {serviceSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComponentCard title="Total Services">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">🔧</div>
              <p className="text-2xl font-bold text-blue-600">{serviceSummary.summary.total_services}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Total Cost">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-2xl font-bold text-green-600">${serviceSummary.summary.total_cost.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Average Duration">
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <p className="text-2xl font-bold text-purple-600">{serviceSummary.summary.average_duration_minutes}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Minutes (Average)</p>
            </div>
          </ComponentCard>
        </div>
      )}

      {/* Service Status and Type Breakdown */}
      {serviceSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComponentCard title="Service Status Breakdown">
            <div className="p-6">
              <div className="space-y-4">
                {serviceSummary.by_status.map((status, index) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-gray-900 dark:text-white capitalize">{status.status.replace('_', ' ')}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Service Type Distribution">
            <div className="p-6">
              <div className="space-y-4">
                {serviceSummary.by_type.map((type, index) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${index === 0 ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                      <span className="text-gray-900 dark:text-white capitalize">{type.type.replace('_', ' ')}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{type.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </ComponentCard>
        </div>
      )}

      {/* Vehicle Maintenance Overview */}
      {vehicleMaintenance && (
        <ComponentCard title="Vehicle Maintenance Status">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{vehicleMaintenance.total_vehicles}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{vehicleMaintenance.vehicles_requiring_maintenance}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Requiring Maintenance</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{vehicleMaintenance.vehicles_overdue}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Services</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Vehicle</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Pending</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Overdue</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleMaintenance.vehicle_details.slice(0, 5).map((vehicle) => (
                    <tr key={vehicle.vehicle_id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{vehicle.license_plate}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white capitalize">{vehicle.type}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          color={vehicle.status === 'active' ? 'success' : 'light'}
                          size="sm"
                        >
                          {vehicle.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{vehicle.pending_services}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${vehicle.overdue_services > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {vehicle.overdue_services}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{vehicle.assigned_driver || 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ComponentCard>
      )}

      {/* Parts Inventory Status */}
      {partsInventory && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComponentCard title="Parts Inventory Summary">
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{partsInventory.summary.total_parts}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Parts Types</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">${partsInventory.summary.total_inventory_value.toLocaleString()}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Inventory Value</p>
                </div>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Parts by Category">
            <div className="p-6">
              <div className="space-y-4">
                {partsInventory.by_category.map((category) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{category.category}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{category.count} types</p>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{category.total_stock}</span>
                  </div>
                ))}
              </div>
            </div>
          </ComponentCard>
        </div>
      )}

      {/* Upcoming Maintenance Schedule */}
      {maintenanceSchedule && (
        <ComponentCard title="Upcoming Maintenance Schedule">
          <div className="p-6">
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {maintenanceSchedule.total_upcoming_services} services scheduled in next {maintenanceSchedule.period_days} days
              </p>
            </div>
            
            <div className="space-y-4">
              {Object.entries(maintenanceSchedule.services_by_date).map(([date, services]) => (
                <div key={date} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div key={service.service_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Vehicle #{service.vehicle_id} - {service.service_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            color={
                              service.priority === 'high' ? 'error' :
                              service.priority === 'medium' ? 'warning' :
                              'success'
                            }
                            size="sm"
                          >
                            {service.priority}
                          </Badge>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">${service.cost}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{service.estimated_duration}min</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ComponentCard>
      )}

      {/* Cost Analysis */}
      {costAnalysis && (
        <ComponentCard title="Service Cost Analysis">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${costAnalysis.total_cost.toLocaleString()}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{costAnalysis.total_services}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${Math.round(costAnalysis.total_cost / costAnalysis.total_services).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Cost</p>
              </div>
            </div>

            <div className="space-y-3">
              {costAnalysis.cost_breakdown.map((period, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(period.period).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{period.service_count} services</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">${period.total_cost.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg: ${period.average_cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}