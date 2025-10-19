"use client";
import React, { useEffect, useState } from "react";
import { 
  performanceService, 
  DriverPerformance, 
  BehaviorEvent,
  VehicleDiagnostics,
  MaintenanceAlert,
  DriverScorecard
} from "@/services/performanceService";
import { driverService, Driver } from "@/services/driverService";
import { tripService, Trip } from "@/services/tripService";
import { vehicleService, Vehicle } from "@/services/vehicleService";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DriverScorecardComponent from "@/components/performance/DriverScorecard";
import VehicleDiagnosticsCard from "@/components/performance/VehicleDiagnosticsCard";

const PerformanceDashboard = () => {
  const [driverPerformances, setDriverPerformances] = useState<DriverPerformance[]>([]);
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([]);
  const [vehicleDiagnostics, setVehicleDiagnostics] = useState<VehicleDiagnostics[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [driverScorecard, setDriverScorecard] = useState<DriverScorecard | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          performances,
          events,
          diagnostics,
          alerts,
          scorecard,
          driversData,
          tripsData,
          vehiclesData
        ] = await Promise.all([
          performanceService.getDriverPerformances(3, 0, 100),
          performanceService.getDriverBehaviorEvents(3, 0, 100),
          performanceService.getVehicleDiagnostics(1).catch(() => null), // May not exist yet
          performanceService.getVehicleMaintenanceAlerts(3, 0, 100).catch(() => []),
          performanceService.getDriverScorecard(3).catch(() => null), // May not exist yet
          driverService.getDrivers({ limit: 100 }),
          tripService.getTrips({ limit: 100 }),
          vehicleService.getVehicles({ limit: 100 })
        ]);
        
        setDriverPerformances(performances);
        setBehaviorEvents(events);
        setVehicleDiagnostics(diagnostics ? [diagnostics] : []);
        setMaintenanceAlerts(alerts);
        setDriverScorecard(scorecard);
        setDrivers(driversData);
        setTrips(tripsData);
        setVehicles(vehiclesData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching performance data:", err);
        setError("Failed to load performance data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate average scores
  const calculateAverageScores = () => {
    if (driverPerformances.length === 0) return null;
    
    const total = driverPerformances.reduce(
      (acc, perf) => {
        acc.safety += perf.safety_score;
        acc.punctuality += perf.punctuality_score;
        acc.fuelEfficiency += perf.fuel_efficiency_score;
        acc.overall += perf.overall_score;
        return acc;
      },
      { safety: 0, punctuality: 0, fuelEfficiency: 0, overall: 0 }
    );
    
    const count = driverPerformances.length;
    return {
      safety: Math.round(total.safety / count),
      punctuality: Math.round(total.punctuality / count),
      fuelEfficiency: Math.round(total.fuelEfficiency / count),
      overall: Math.round(total.overall / count),
    };
  };

  const averageScores = calculateAverageScores();

  // Get driver name by ID
  const getDriverName = (driverId: number) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `${driver.user_id}` : `Driver ${driverId}`;
  };

  // Get trip details by ID
  const getTripDetails = (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    return trip ? `Trip ${tripId}` : `Trip ${tripId}`;
  };

  // Get vehicle details by ID
  const getVehicleDetails = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `Vehicle ${vehicleId} (${vehicle.model})` : `Vehicle ${vehicleId}`;
  };

  // Count unresolved alerts
  const unresolvedAlertsCount = maintenanceAlerts.filter(alert => !alert.resolved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading performance data...</div>
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
      <PageBreadcrumb pageTitle="Performance Dashboard" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Performance Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and analyze driver performance metrics, behavior events, vehicle diagnostics, and maintenance alerts
        </p>
      </div>

      {/* Driver Scorecard */}
      {driverScorecard && (
        <div className="mb-6">
          <DriverScorecardComponent scorecard={driverScorecard} />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <ComponentCard title="Average Safety Score">
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {averageScores?.safety || 0}<span className="text-lg">/100</span>
          </div>
        </ComponentCard>
        <ComponentCard title="Average Punctuality">
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {averageScores?.punctuality || 0}<span className="text-lg">/100</span>
          </div>
        </ComponentCard>
        <ComponentCard title="Fuel Efficiency">
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {averageScores?.fuelEfficiency || 0}<span className="text-lg">/100</span>
          </div>
        </ComponentCard>
        <ComponentCard title="Unresolved Alerts">
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {unresolvedAlertsCount}
          </div>
        </ComponentCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Performance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Performance Records</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Safety
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Punctuality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Overall
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {driverPerformances.slice(0, 5).map((performance) => (
                  <tr key={performance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {getDriverName(performance.driver_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {getTripDetails(performance.trip_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {performance.safety_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {performance.punctuality_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {performance.overall_score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Behavior Events Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Behavior Events</h2>
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
                    Speed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {behaviorEvents.slice(0, 5).map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {getDriverName(event.driver_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {event.event_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {event.speed} km/h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vehicle Diagnostics and Maintenance Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Vehicle Diagnostics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Vehicle Diagnostics</h2>
          {vehicleDiagnostics.length > 0 ? (
            <div className="space-y-4">
              {vehicleDiagnostics.map((diagnostic) => {
                const vehicle = vehicles.find(v => v.id === diagnostic.vehicle_id);
                const vehicleName = vehicle ? `${vehicle.model} (${vehicle.license_plate})` : undefined;
                
                return (
                  <VehicleDiagnosticsCard 
                    key={diagnostic.id} 
                    diagnostics={diagnostic} 
                    vehicleName={vehicleName} 
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No vehicle diagnostics data available.</p>
          )}
        </div>

        {/* Maintenance Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Maintenance Alerts</h2>
          {maintenanceAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Alert
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {maintenanceAlerts.slice(0, 5).map((alert) => (
                    <tr key={alert.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        {getVehicleDetails(alert.vehicle_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        {alert.alert_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          alert.severity === "critical" ? "bg-red-100 text-red-800" :
                          alert.severity === "high" ? "bg-orange-100 text-orange-800" :
                          alert.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No maintenance alerts at this time.</p>
          )}
        </div>
      </div>

      {/* Detailed Performance Data */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Detailed Performance Metrics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Distance (km)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Avg Speed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Harsh Braking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Speeding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Phone Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Idling (min)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {driverPerformances.map((performance) => (
                <tr key={performance.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {getDriverName(performance.driver_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {getTripDetails(performance.trip_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {performance.total_distance.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {performance.average_speed.toFixed(1)} km/h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {performance.harsh_braking_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {performance.speeding_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {performance.phone_usage_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {Math.round(performance.idling_time / 60)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;