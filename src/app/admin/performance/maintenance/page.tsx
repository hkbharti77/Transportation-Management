"use client";
import React, { useEffect, useState } from "react";
import { performanceService, MaintenanceAlert } from "@/services/performanceService";
import { vehicleService, Vehicle } from "@/services/vehicleService";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MaintenanceAlertForm from "@/components/performance/MaintenanceAlertForm";
import Button from "@/components/ui/button/Button";

const MaintenancePage = () => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<MaintenanceAlert | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          alertsData,
          vehiclesData
        ] = await Promise.all([
          performanceService.getVehicleMaintenanceAlerts(3, 0, 100),
          vehicleService.getVehicles({ limit: 100 })
        ]);
        
        setAlerts(alertsData);
        setVehicles(vehiclesData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching maintenance data:", err);
        setError("Failed to load maintenance data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get vehicle details by ID
  const getVehicleDetails = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.model} (${vehicle.license_plate})` : `Vehicle ${vehicleId}`;
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedAlert(null);
    // Refresh the data
    fetchData();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        alertsData,
        vehiclesData
      ] = await Promise.all([
        performanceService.getVehicleMaintenanceAlerts(3, 0, 100),
        vehicleService.getVehicles({ limit: 100 })
      ]);
      
      setAlerts(alertsData);
      setVehicles(vehiclesData);
      
      setError(null);
    } catch (err) {
      console.error("Error fetching maintenance data:", err);
      setError("Failed to load maintenance data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Mark alert as resolved
  const handleResolveAlert = async (alertId: number) => {
    try {
      const updatedAlert = await performanceService.updateMaintenanceAlert(alertId, { resolved: true });
      setAlerts(prev => 
        prev.map(alert => alert.id === alertId ? updatedAlert : alert)
      );
      setSelectedAlert(null);
    } catch (err) {
      console.error("Error resolving maintenance alert:", err);
      setError("Failed to resolve maintenance alert. Please try again.");
    }
  };

  // Mark alert as unresolved
  const handleUnresolveAlert = async (alertId: number) => {
    try {
      const updatedAlert = await performanceService.updateMaintenanceAlert(alertId, { resolved: false });
      setAlerts(prev => 
        prev.map(alert => alert.id === alertId ? updatedAlert : alert)
      );
      setSelectedAlert(null);
    } catch (err) {
      console.error("Error unresolving maintenance alert:", err);
      setError("Failed to unresolve maintenance alert. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading maintenance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <PageBreadcrumb pageTitle="Maintenance Management" />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Maintenance Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage vehicle maintenance alerts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Maintenance Alert
        </button>
      </div>

      {showForm ? (
        <div className="mb-6">
          <MaintenanceAlertForm 
            onSuccess={handleSuccess} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      ) : null}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Alert Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {alerts.map((alert) => (
                <tr key={alert.id} className={selectedAlert?.id === alert.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                    onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                  >
                    {getVehicleDetails(alert.vehicle_id)}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                    onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                  >
                    {alert.alert_title}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                    onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                  >
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      alert.severity === "critical" ? "bg-red-100 text-red-800" :
                      alert.severity === "high" ? "bg-orange-100 text-orange-800" :
                      alert.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                    onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                  >
                    {new Date(alert.created_at || "").toLocaleDateString()}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                    onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                  >
                    {alert.resolved ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Resolved
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {alert.resolved ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUnresolveAlert(alert.id!)}
                      >
                        Mark as Pending
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleResolveAlert(alert.id!)}
                      >
                        Mark as Resolved
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Details Panel */}
      {selectedAlert && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Maintenance Alert Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Vehicle Information</h3>
              <p className="text-gray-600 dark:text-gray-400">Vehicle ID: {selectedAlert.vehicle_id}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {getVehicleDetails(selectedAlert.vehicle_id)}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Alert Information</h3>
              <p className="text-gray-600 dark:text-gray-400">Title: {selectedAlert.alert_title}</p>
              <p className="text-gray-600 dark:text-gray-400">
                Severity: 
                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedAlert.severity === "critical" ? "bg-red-100 text-red-800" :
                  selectedAlert.severity === "high" ? "bg-orange-100 text-orange-800" :
                  selectedAlert.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {selectedAlert.severity}
                </span>
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Description</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedAlert.alert_description}
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Recommended Action</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedAlert.recommended_action}
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Timestamps</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Created: {new Date(selectedAlert.created_at || "").toLocaleString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Updated: {new Date(selectedAlert.updated_at || "").toLocaleString()}
              </p>
              {selectedAlert.resolved_at && (
                <p className="text-gray-600 dark:text-gray-400">
                  Resolved: {new Date(selectedAlert.resolved_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            {selectedAlert.resolved ? (
              <Button 
                onClick={() => handleUnresolveAlert(selectedAlert.id!)}
              >
                Mark as Pending
              </Button>
            ) : (
              <Button 
                onClick={() => handleResolveAlert(selectedAlert.id!)}
              >
                Mark as Resolved
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => setSelectedAlert(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;