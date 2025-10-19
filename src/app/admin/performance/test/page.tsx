"use client";
import React, { useState } from "react";
import { performanceService } from "@/services/performanceService";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";

const PerformanceTestPage = () => {
  const [testResults, setTestResults] = useState<{ testName: string; result: unknown; success: boolean; timestamp: Date }[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (testName: string, result: unknown, success: boolean = true) => {
    setTestResults(prev => [...prev, { testName, result, success, timestamp: new Date() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test creating a driver performance record
  const testCreateDriverPerformance = async () => {
    setLoading(true);
    try {
      const performanceData = {
        driver_id: 3,
        trip_id: 3,
        safety_score: 87,
        punctuality_score: 92,
        fuel_efficiency_score: 78,
        overall_score: 85,
        total_distance: 145.8,
        total_time: 8640,
        average_speed: 60.75,
        harsh_braking_count: 3,
        speeding_count: 7,
        phone_usage_count: 2,
        hard_acceleration_count: 5,
        hard_turn_count: 4,
        idling_time: 420
      };

      const result = await performanceService.createDriverPerformance(performanceData);
      addResult("Create Driver Performance", result);
    } catch (error) {
      addResult("Create Driver Performance", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test getting a driver performance by ID
  const testGetDriverPerformance = async () => {
    setLoading(true);
    try {
      // Assuming we have a performance record with ID 1
      const result = await performanceService.getDriverPerformanceById(1);
      addResult("Get Driver Performance by ID", result);
    } catch (error) {
      addResult("Get Driver Performance by ID", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test getting driver performances
  const testGetDriverPerformances = async () => {
    setLoading(true);
    try {
      const result = await performanceService.getDriverPerformances(3, 0, 100);
      addResult("Get Driver Performances", result);
    } catch (error) {
      addResult("Get Driver Performances", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test getting driver scorecard
  const testGetDriverScorecard = async () => {
    setLoading(true);
    try {
      const result = await performanceService.getDriverScorecard(3);
      addResult("Get Driver Scorecard", result);
    } catch (error) {
      addResult("Get Driver Scorecard", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test creating a behavior event
  const testCreateBehaviorEvent = async () => {
    setLoading(true);
    try {
      const eventData = {
        driver_id: 3,
        trip_id: 3,
        event_type: "harsh_braking",
        latitude: 28.5355,
        longitude: 77.3910,
        speed: 72.5,
        additional_data: "Emergency braking detected at intersection, deceleration rate: 8.2 m/s², weather: clear",
        resolved: false
      };

      const result = await performanceService.createBehaviorEvent(eventData);
      addResult("Create Behavior Event", result);
    } catch (error) {
      addResult("Create Behavior Event", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test getting a behavior event by ID
  const testGetBehaviorEvent = async () => {
    setLoading(true);
    try {
      // Assuming we have a behavior event with ID 1
      const result = await performanceService.getBehaviorEventById(1);
      addResult("Get Behavior Event by ID", result);
    } catch (error) {
      addResult("Get Behavior Event by ID", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test getting driver behavior events
  const testGetDriverBehaviorEvents = async () => {
    setLoading(true);
    try {
      const result = await performanceService.getDriverBehaviorEvents(3, 0, 100);
      addResult("Get Driver Behavior Events", result);
    } catch (error) {
      addResult("Get Driver Behavior Events", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test getting unresolved driver behavior events
  const testGetUnresolvedDriverBehaviorEvents = async () => {
    setLoading(true);
    try {
      const result = await performanceService.getUnresolvedDriverBehaviorEvents(3);
      addResult("Get Unresolved Driver Behavior Events", result);
    } catch (error) {
      addResult("Get Unresolved Driver Behavior Events", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test creating vehicle diagnostics
  const testCreateVehicleDiagnostics = async () => {
    setLoading(true);
    try {
      const diagnosticsData = {
        vehicle_id: 1,
        engine_health: 34,
        tire_pressure_front_left: 32.5,
        tire_pressure_front_right: 32.8,
        tire_pressure_rear_left: 31.9,
        tire_pressure_rear_right: 32.1,
        oil_level: 85,
        coolant_level: 95,
        brake_fluid_level: 78,
        transmission_fluid_level: 88,
        battery_voltage: 12.6,
        diagnostic_trouble_codes: "None"
      };

      const result = await performanceService.createVehicleDiagnostics(diagnosticsData);
      addResult("Create Vehicle Diagnostics", result);
    } catch (error) {
      addResult("Create Vehicle Diagnostics", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test getting vehicle diagnostics
  const testGetVehicleDiagnostics = async () => {
    setLoading(true);
    try {
      const result = await performanceService.getVehicleDiagnostics(1);
      addResult("Get Vehicle Diagnostics", result);
    } catch (error) {
      addResult("Get Vehicle Diagnostics", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test creating maintenance alert
  const testCreateMaintenanceAlert = async () => {
    setLoading(true);
    try {
      const alertData = {
        vehicle_id: 3,
        alert_title: "Low Tire Pressure Detected",
        alert_description: "Front left tire pressure is below recommended level at 26.5 PSI. Standard pressure should be 32-35 PSI.",
        severity: "medium" as const,
        recommended_action: "Inflate tire to manufacturer recommended pressure within 24 hours. Check for possible puncture or slow leak.",
        resolved: false
      };

      const result = await performanceService.createMaintenanceAlert(alertData);
      addResult("Create Maintenance Alert", result);
    } catch (error) {
      addResult("Create Maintenance Alert", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test getting maintenance alert by ID
  const testGetMaintenanceAlert = async () => {
    setLoading(true);
    try {
      // Assuming we have a maintenance alert with ID 1
      const result = await performanceService.getMaintenanceAlertById(1);
      addResult("Get Maintenance Alert by ID", result);
    } catch (error) {
      addResult("Get Maintenance Alert by ID", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test getting vehicle maintenance alerts
  const testGetVehicleMaintenanceAlerts = async () => {
    setLoading(true);
    try {
      const result = await performanceService.getVehicleMaintenanceAlerts(3, 0, 100);
      addResult("Get Vehicle Maintenance Alerts", result);
    } catch (error) {
      addResult("Get Vehicle Maintenance Alerts", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  // Test getting unresolved vehicle maintenance alerts
  const testGetUnresolvedVehicleMaintenanceAlerts = async () => {
    setLoading(true);
    try {
      const result = await performanceService.getUnresolvedVehicleMaintenanceAlerts(3);
      addResult("Get Unresolved Vehicle Maintenance Alerts", result);
    } catch (error) {
      addResult("Get Unresolved Vehicle Maintenance Alerts", error instanceof Error ? error.message : String(error), false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <PageBreadcrumb pageTitle="Performance API Test" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Performance API Test</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the performance management API endpoints
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Driver Performance Tests</h2>
          <div className="space-y-3">
            <Button 
              onClick={testCreateDriverPerformance} 
              disabled={loading}
              className="w-full"
            >
              Create Driver Performance
            </Button>
            <Button 
              onClick={testGetDriverPerformance} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Get Driver Performance by ID
            </Button>
            <Button 
              onClick={testGetDriverPerformances} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Get Driver Performances
            </Button>
            <Button 
              onClick={testGetDriverScorecard} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Get Driver Scorecard
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Behavior Event Tests</h2>
          <div className="space-y-3">
            <Button 
              onClick={testCreateBehaviorEvent} 
              disabled={loading}
              className="w-full"
            >
              Create Behavior Event
            </Button>
            <Button 
              onClick={testGetBehaviorEvent} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Get Behavior Event by ID
            </Button>
            <Button 
              onClick={testGetDriverBehaviorEvents} 
              disabled={loading}
              variant="outline"
               className="w-full"
            >
              Get Driver Behavior Events
            </Button>
            <Button 
              onClick={testGetUnresolvedDriverBehaviorEvents} 
              disabled={loading}
              variant="outline"
               className="w-full"
            >
              Get Unresolved Driver Behavior Events
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Vehicle Diagnostics Tests</h2>
          <div className="space-y-3">
            <Button 
              onClick={testCreateVehicleDiagnostics} 
              disabled={loading}
              className="w-full"
            >
              Create Vehicle Diagnostics
            </Button>
            <Button 
              onClick={testGetVehicleDiagnostics} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Get Vehicle Diagnostics
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Maintenance Alert Tests</h2>
          <div className="space-y-3">
            <Button 
              onClick={testCreateMaintenanceAlert} 
              disabled={loading}
              className="w-full"
            >
              Create Maintenance Alert
            </Button>
            <Button 
              onClick={testGetMaintenanceAlert} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Get Maintenance Alert by ID
            </Button>
            <Button 
              onClick={testGetVehicleMaintenanceAlerts} 
              disabled={loading}
              variant="outline"
               className="w-full"
            >
              Get Vehicle Maintenance Alerts
            </Button>
            <Button 
              onClick={testGetUnresolvedVehicleMaintenanceAlerts} 
              disabled={loading}
              variant="outline"
               className="w-full"
            >
              Get Unresolved Vehicle Maintenance Alerts
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Test Results</h2>
          <Button onClick={clearResults} variant="outline" size="sm">
            Clear Results
          </Button>
        </div>
        
        {testResults.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No test results yet. Run a test to see results here.</p>
        ) : (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  result.success 
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
                    : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                }`}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {result.testName}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <pre className="mt-2 text-sm overflow-x-auto bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceTestPage;