"use client";
import React, { useEffect, useState } from "react";
import { 
  performanceService, 
  BehaviorEvent 
} from "@/services/performanceService";
import { driverService, Driver } from "@/services/driverService";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";

const UnresolvedBehaviorEventsPage = () => {
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<BehaviorEvent | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          events,
          driversData
        ] = await Promise.all([
          performanceService.getUnresolvedDriverBehaviorEvents(3),
          driverService.getDrivers({ limit: 100 })
        ]);
        
        setBehaviorEvents(events);
        setDrivers(driversData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching unresolved behavior events:", err);
        setError("Failed to load unresolved behavior events. Please try again later.");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading unresolved behavior events...</div>
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
      <PageBreadcrumb pageTitle="Unresolved Behavior Events" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Unresolved Behavior Events</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage unresolved driver behavior events
        </p>
      </div>

      {/* Behavior Events Table */}
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {behaviorEvents.length > 0 ? (
                behaviorEvents.map((event) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      <Button 
                        size="sm" 
                        onClick={() => handleResolveBehaviorEvent(event.id!)}
                      >
                        Mark as Resolved
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No unresolved behavior events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Panel */}
      {selectedEvent && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Behavior Event Details
            </h2>
            <Button 
              variant="outline"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Driver Information</h3>
              <p className="text-gray-600 dark:text-gray-400">Driver ID: {selectedEvent.driver_id}</p>
              <p className="text-gray-600 dark:text-gray-400">Trip ID: {selectedEvent.trip_id}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Event Information</h3>
              <p className="text-gray-600 dark:text-gray-400">Type: {selectedEvent.event_type}</p>
              <p className="text-gray-600 dark:text-gray-400">Speed: {selectedEvent.speed} km/h</p>
              <p className="text-gray-600 dark:text-gray-400">
                Location: {selectedEvent.latitude.toFixed(6)}, {selectedEvent.longitude.toFixed(6)}
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Additional Data</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedEvent.additional_data || "No additional data provided"}
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Timestamps</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Event Time: {new Date(selectedEvent.timestamp || "").toLocaleString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Created: {new Date(selectedEvent.created_at || "").toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button 
              onClick={() => handleResolveBehaviorEvent(selectedEvent.id!)}
            >
              Mark as Resolved
            </Button>
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

export default UnresolvedBehaviorEventsPage;