"use client";
import React, { useEffect, useState } from "react";
import { performanceService, VehicleDiagnostics } from "@/services/performanceService";
import { vehicleService, Vehicle } from "@/services/vehicleService";
import { routeService, Route } from "@/services/routeService";
import { routeOptimizationService, RouteOptimizationRequest, RouteOptimizationResponse, RouteOptimizationHistory, TrafficData, WeatherData, FuelPrice } from "@/services/routeOptimizationService";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VehicleDiagnosticsForm from "@/components/performance/VehicleDiagnosticsForm";
import VehicleDiagnosticsCard from "@/components/performance/VehicleDiagnosticsCard";
import RouteOptimizationCard from "@/components/performance/RouteOptimizationCard";
import FuelPriceCard from "@/components/performance/FuelPriceCard";
import OptimizationHistoryCard from "@/components/performance/OptimizationHistoryCard";
import TrafficDataForm from "@/components/performance/TrafficDataForm";
import WeatherDataForm from "@/components/performance/WeatherDataForm";
import FuelPriceForm from "@/components/performance/FuelPriceForm";

const DiagnosticsPage = () => {
  const [diagnostics, setDiagnostics] = useState<VehicleDiagnostics[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [optimizationData, setOptimizationData] = useState<RouteOptimizationResponse | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [optimizationHistory, setOptimizationHistory] = useState<RouteOptimizationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTrafficForm, setShowTrafficForm] = useState(false);
  const [showWeatherForm, setShowWeatherForm] = useState(false);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"optimization" | "fuel" | "history">("optimization");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          diagnosticsData,
          vehiclesData,
          routesData
        ] = await Promise.all([
          performanceService.getVehicleDiagnostics(1).catch(() => null),
          vehicleService.getVehicles({ limit: 100 }),
          routeService.getRoutes({ limit: 100 })
        ]);
        
        // Handle the case where we get a single diagnostics object
        const diagnosticsArray = diagnosticsData ? [diagnosticsData] : [];
        setDiagnostics(diagnosticsArray);
        setVehicles(vehiclesData);
        setRoutes(routesData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching diagnostics data:", err);
        setError("Failed to load diagnostics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOptimizeRoute = async (routeId: number) => {
    try {
      setLoading(true);
      setSelectedRouteId(routeId);
      setActiveTab("optimization");
      
      // Prepare optimization request
      const optimizationRequest: RouteOptimizationRequest = {
        route_id: routeId,
        optimization_factors: ["traffic", "weather", "fuel"],
        consider_alternatives: true,
        max_alternatives: 3
      };
      
      // Fetch all data in parallel
      const [
        optimizationResult,
        trafficResult,
        weatherResult,
        fuelResult,
        historyResult
      ] = await Promise.all([
        routeOptimizationService.optimizeRoute(optimizationRequest),
        routeOptimizationService.getRouteTraffic(routeId, 0, 100),
        routeOptimizationService.getRouteWeather(routeId, 0, 100),
        routeOptimizationService.getRouteFuelPrices(routeId, 0, 100),
        routeOptimizationService.getRouteOptimizations(routeId, 0, 100)
      ]);
      
      setOptimizationData(optimizationResult);
      setTrafficData(trafficResult);
      setWeatherData(weatherResult);
      setFuelPrices(fuelResult);
      setOptimizationHistory(historyResult);
      
      setError(null);
    } catch (err) {
      console.error("Error optimizing route:", err);
      setError("Failed to optimize route. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setShowTrafficForm(false);
    setShowWeatherForm(false);
    setShowFuelForm(false);
    // Refresh the data
    fetchData();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        diagnosticsData,
        vehiclesData,
        routesData
      ] = await Promise.all([
        performanceService.getVehicleDiagnostics(1).catch(() => null),
        vehicleService.getVehicles({ limit: 100 }),
        routeService.getRoutes({ limit: 100 })
      ]);
      
      // Handle the case where we get a single diagnostics object
      const diagnosticsArray = diagnosticsData ? [diagnosticsData] : [];
      setDiagnostics(diagnosticsArray);
      setVehicles(vehiclesData);
      setRoutes(routesData);
      
      setError(null);
    } catch (err) {
      console.error("Error fetching diagnostics data:", err);
      setError("Failed to load diagnostics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !optimizationData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading diagnostics data...</div>
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
      <PageBreadcrumb pageTitle="Vehicle Diagnostics & Route Optimization" />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Vehicle Diagnostics & Route Optimization</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View vehicle diagnostics and optimize routes based on traffic and weather conditions
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Diagnostics
        </button>
      </div>

      {showForm ? (
        <div className="mb-6">
          <VehicleDiagnosticsForm 
            onSuccess={handleSuccess} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      ) : null}

      {showTrafficForm ? (
        <div className="mb-6">
          <TrafficDataForm 
            routes={routes}
            onSuccess={handleSuccess}
            onCancel={() => setShowTrafficForm(false)}
          />
        </div>
      ) : null}

      {showWeatherForm ? (
        <div className="mb-6">
          <WeatherDataForm 
            routes={routes}
            onSuccess={handleSuccess}
            onCancel={() => setShowWeatherForm(false)}
          />
        </div>
      ) : null}

      {showFuelForm ? (
        <div className="mb-6">
          <FuelPriceForm 
            routes={routes}
            onSuccess={handleSuccess}
            onCancel={() => setShowFuelForm(false)}
          />
        </div>
      ) : null}

      {/* Route Optimization Section */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Route Optimization</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Select a route to optimize based on current traffic and weather conditions
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {routes.map((route) => (
              <div 
                key={route.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRouteId === route.id 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
                onClick={() => handleOptimizeRoute(route.id!)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">{route.route_number}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {route.start_point} → {route.end_point}
                    </p>
                  </div>
                  {selectedRouteId === route.id && loading && (
                    <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  )}
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Distance: </span>
                  <span className="font-medium">{route.distance} km</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-600 dark:text-gray-400">Time: </span>
                  <span className="font-medium">{route.estimated_time} min</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Data Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowTrafficForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Traffic Data
            </button>
            <button
              onClick={() => setShowWeatherForm(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Add Weather Data
            </button>
            <button
              onClick={() => setShowFuelForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Add Fuel Price
            </button>
          </div>

          {/* Route Data Tabs */}
          {optimizationData && (
            <div className="mt-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("optimization")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "optimization"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Optimization Results
                  </button>
                  <button
                    onClick={() => setActiveTab("fuel")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "fuel"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Fuel Prices
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "history"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Optimization History
                  </button>
                </nav>
              </div>

              <div className="mt-6">
                {activeTab === "optimization" && (
                  <RouteOptimizationCard 
                    optimizationData={optimizationData}
                    trafficData={trafficData}
                    weatherData={weatherData}
                    routeName={routes.find(r => r.id === selectedRouteId)?.route_number}
                  />
                )}
                
                {activeTab === "fuel" && (
                  <FuelPriceCard 
                    fuelPrices={fuelPrices}
                    routeName={routes.find(r => r.id === selectedRouteId)?.route_number}
                  />
                )}
                
                {activeTab === "history" && (
                  <OptimizationHistoryCard 
                    optimizations={optimizationHistory}
                    routeName={routes.find(r => r.id === selectedRouteId)?.route_number}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Diagnostics Section */}
      <div className="grid grid-cols-1 gap-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Vehicle Diagnostics</h2>
        {diagnostics.length > 0 ? (
          diagnostics.map((diagnostic) => {
            const vehicle = vehicles.find(v => v.id === diagnostic.vehicle_id);
            const vehicleName = vehicle ? `${vehicle.model} (${vehicle.license_plate})` : undefined;
            
            return (
              <VehicleDiagnosticsCard 
                key={diagnostic.id} 
                diagnostics={diagnostic} 
                vehicleName={vehicleName} 
              />
            );
          })
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-800 dark:text-white">No diagnostics data</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              No vehicle diagnostics data has been added yet.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Diagnostics Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsPage;