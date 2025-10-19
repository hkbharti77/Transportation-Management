"use client";
import React, { useEffect, useState } from "react";
import { 
  performanceService, 
  BehaviorEvent,
  MaintenanceAlert 
} from "@/services/performanceService";
import { driverService, Driver } from "@/services/driverService";
import { vehicleService, Vehicle } from "@/services/vehicleService";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";

const BehaviorEventsPage = () => {
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<BehaviorEvent | MaintenanceAlert | null>(null);
  const [activeTab, setActiveTab] = useState<"behavior" | "maintenance">("behavior");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          events,
          alerts,
          driversData,
          vehiclesData
        ] = await Promise.all([
          performanceService.getDriverBehaviorEvents(3, 0, 100),
          performanceService.getVehicleMaintenanceAlerts(3, 0, 100),
          driverService.getDrivers({ limit: 100 }),
          vehicleService.getVehicles({ limit: 100 })
        ]);
        
        setBehaviorEvents(events);
        setMaintenanceAlerts(alerts);
        setDrivers(driversData);
        setVehicles(vehiclesData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching events data:", err);
        setError("Failed to load events data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get driver name by ID
  const getDriverName = (driverId: number) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `${driver.user_id} - ${driver.license_number}` : `Driver ${driverId}`;
  };

  // Get vehicle details by ID
  const getVehicleDetails = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `Vehicle ${vehicleId} (${vehicle.model})` : `Vehicle ${vehicleId}`;
  };

  // Mark behavior event as resolved
  const handleResolveBehaviorEvent = async (eventId: number) => {
    try {
      const updatedEvent = await performanceService.updateBehaviorEvent(eventId, { resolved: true });
      setBehaviorEvents(prev => 
        prev.map(event => event.id === eventId ? updatedEvent : event)
      );
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error resolving behavior event:", err);
      setError("Failed to resolve behavior event. Please try again.");
    }
  };

  // Mark behavior event as unresolved
  const handleUnresolveBehaviorEvent = async (eventId: number) => {
    try {
      const updatedEvent = await performanceService.updateBehaviorEvent(eventId, { resolved: false });
      setBehaviorEvents(prev => 
        prev.map(event => event.id === eventId ? updatedEvent : event)
      );
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error unresolving behavior event:", err);
      setError("Failed to unresolve behavior event. Please try again.");
    }
  };

  // Mark maintenance alert as resolved
  const handleResolveMaintenanceAlert = async (alertId: number) => {
    try {
      const updatedAlert = await performanceService.updateMaintenanceAlert(alertId, { resolved: true });
      setMaintenanceAlerts(prev => 
        prev.map(alert => alert.id === alertId ? updatedAlert : alert)
      );
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error resolving maintenance alert:", err);
      setError("Failed to resolve maintenance alert. Please try again.");
    }
  };

  // Mark maintenance alert as unresolved
  const handleUnresolveMaintenanceAlert = async (alertId: number) => {
    try {
      const updatedAlert = await performanceService.updateMaintenanceAlert(alertId, { resolved: false });
      setMaintenanceAlerts(prev => 
        prev.map(alert => alert.id === alertId ? updatedAlert : alert)
      );
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error unresolving maintenance alert:", err);
      setError("Failed to unresolve maintenance alert. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading events data...</div>
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
      <PageBreadcrumb pageTitle="Behavior & Maintenance Events" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Behavior & Maintenance Events</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage driver behavior events and vehicle maintenance alerts
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("behavior")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "behavior"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Behavior Events
          </button>
          <button
            onClick={() => setActiveTab("maintenance")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "maintenance"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Maintenance Alerts
          </button>
        </nav>
      </div>

      {activeTab === "behavior" ? (
        // Behavior Events Table
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Speed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
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
                {behaviorEvents.map((event) => (
                  <tr key={event.id} className={selectedEvent?.id === event.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                      onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    >
                      {getDriverName(event.driver_id)}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                      onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    >
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {event.event_type}
                      </span>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                      onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    >
                      {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                      onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    >
                      {event.speed} km/h
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                      onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    >
                      {new Date(event.timestamp || "").toLocaleString()}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                      onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    >
                      {event.resolved ? (
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
                      {event.resolved ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleUnresolveBehaviorEvent(event.id!)}
                        >
                          Mark as Pending
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleResolveBehaviorEvent(event.id!)}
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
      ) : (
        // Maintenance Alerts Table
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
                {maintenanceAlerts.map((alert) => (
                  <tr key={alert.id} className={selectedEvent?.id === alert.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                      onClick={() => setSelectedEvent(selectedEvent?.id === alert.id ? null : alert)}
                    >
                      {getVehicleDetails(alert.vehicle_id)}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                      onClick={() => setSelectedEvent(selectedEvent?.id === alert.id ? null : alert)}
                    >
                      {alert.alert_title}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                      onClick={() => setSelectedEvent(selectedEvent?.id === alert.id ? null : alert)}
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
                      onClick={() => setSelectedEvent(selectedEvent?.id === alert.id ? null : alert)}
                    >
                      {new Date(alert.created_at || "").toLocaleString()}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                      onClick={() => setSelectedEvent(selectedEvent?.id === alert.id ? null : alert)}
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
                          onClick={() => handleUnresolveMaintenanceAlert(alert.id!)}
                        >
                          Mark as Pending
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleResolveMaintenanceAlert(alert.id!)}
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
      )}

      {/* Event Details Panel */}
      {selectedEvent && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            {activeTab === "behavior" ? "Behavior Event Details" : "Maintenance Alert Details"}
          </h2>
          
          {activeTab === "behavior" ? (
            // Behavior Event Details
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Driver Information</h3>
                <p className="text-gray-600 dark:text-gray-400">Driver ID: {(selectedEvent as BehaviorEvent).driver_id}</p>
                <p className="text-gray-600 dark:text-gray-400">Trip ID: {(selectedEvent as BehaviorEvent).trip_id}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Event Information</h3>
                <p className="text-gray-600 dark:text-gray-400">Type: {(selectedEvent as BehaviorEvent).event_type}</p>
                <p className="text-gray-600 dark:text-gray-400">Speed: {(selectedEvent as BehaviorEvent).speed} km/h</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Location: {(selectedEvent as BehaviorEvent).latitude.toFixed(6)}, {(selectedEvent as BehaviorEvent).longitude.toFixed(6)}
                </p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Additional Data</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {(selectedEvent as BehaviorEvent).additional_data || "No additional data provided"}
                </p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Timestamps</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Event Time: {new Date((selectedEvent as BehaviorEvent).timestamp || "").toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Created: {new Date((selectedEvent as BehaviorEvent).created_at || "").toLocaleString()}
                </p>
                {(selectedEvent as BehaviorEvent).resolved_at && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Resolved: {new Date((selectedEvent as BehaviorEvent).resolved_at!).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Maintenance Alert Details
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Vehicle Information</h3>
                <p className="text-gray-600 dark:text-gray-400">Vehicle ID: {(selectedEvent as MaintenanceAlert).vehicle_id}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {getVehicleDetails((selectedEvent as MaintenanceAlert).vehicle_id)}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Alert Information</h3>
                <p className="text-gray-600 dark:text-gray-400">Title: {(selectedEvent as MaintenanceAlert).alert_title}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Severity: 
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    (selectedEvent as MaintenanceAlert).severity === "critical" ? "bg-red-100 text-red-800" :
                    (selectedEvent as MaintenanceAlert).severity === "high" ? "bg-orange-100 text-orange-800" :
                    (selectedEvent as MaintenanceAlert).severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {(selectedEvent as MaintenanceAlert).severity}
                  </span>
                </p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {(selectedEvent as MaintenanceAlert).alert_description}
                </p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Recommended Action</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {(selectedEvent as MaintenanceAlert).recommended_action}
                </p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Timestamps</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Created: {new Date((selectedEvent as MaintenanceAlert).created_at || "").toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Updated: {new Date((selectedEvent as MaintenanceAlert).updated_at || "").toLocaleString()}
                </p>
                {(selectedEvent as MaintenanceAlert).resolved_at && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Resolved: {new Date((selectedEvent as MaintenanceAlert).resolved_at!).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex space-x-2">
            {activeTab === "behavior" ? (
              <>
                {(selectedEvent as BehaviorEvent).resolved ? (
                  <Button 
                    onClick={() => handleUnresolveBehaviorEvent((selectedEvent as BehaviorEvent).id!)}
                  >
                    Mark as Pending
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleResolveBehaviorEvent((selectedEvent as BehaviorEvent).id!)}
                  >
                    Mark as Resolved
                  </Button>
                )}
              </>
            ) : (
              <>
                {(selectedEvent as MaintenanceAlert).resolved ? (
                  <Button 
                    onClick={() => handleUnresolveMaintenanceAlert((selectedEvent as MaintenanceAlert).id!)}
                  >
                    Mark as Pending
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleResolveMaintenanceAlert((selectedEvent as MaintenanceAlert).id!)}
                  >
                    Mark as Resolved
                  </Button>
                )}
              </>
            )}
            <Button 
              variant="outline"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehaviorEventsPage;