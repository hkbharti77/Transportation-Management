"use client";
import React, { useState, useEffect } from "react";
import { routeService, Route } from "@/services/routeService";
import { routeOptimizationService } from "@/services/routeOptimizationService";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const TestOptimizationPage = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{ testName: string; data: unknown; success: boolean; timestamp: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const routesData = await routeService.getRoutes({ limit: 100 });
        setRoutes(routesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching routes:", err);
        setError("Failed to load routes");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const addResult = (testName: string, data: unknown, success: boolean = true) => {
    setResults(prev => [...prev, { testName, data, success, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testOptimizeRoute = async (routeId: number) => {
    try {
      const optimizationRequest = {
        route_id: routeId,
        optimization_factors: ["traffic", "weather", "fuel"],
        consider_alternatives: true,
        max_alternatives: 3
      };

      const result = await routeOptimizationService.optimizeRoute(optimizationRequest);
      addResult("Optimize Route", result);
    } catch (error) {
      addResult("Optimize Route", error instanceof Error ? error.message : String(error), false);
    }
  };

  const testGetTrafficData = async (routeId: number) => {
    try {
      const result = await routeOptimizationService.getRouteTraffic(routeId, 0, 100);
      addResult("Get Traffic Data", result);
    } catch (error) {
      addResult("Get Traffic Data", error instanceof Error ? error.message : String(error), false);
    }
  };

  const testAddTrafficData = async (routeId: number) => {
    try {
      const trafficData = {
        route_id: routeId,
        congestion_level: 3,
        average_speed: 42,
        travel_time: 35,
        road_conditions: "Moderate traffic, occasional slowdowns",
        raw_data: {
          source: "Google Maps API",
          timestamp: new Date().toISOString()
        }
      };

      const result = await routeOptimizationService.addRouteTraffic(routeId, trafficData);
      addResult("Add Traffic Data", result);
    } catch (error) {
      addResult("Add Traffic Data", error instanceof Error ? error.message : String(error), false);
    }
  };

  const testGetWeatherData = async (routeId: number) => {
    try {
      const result = await routeOptimizationService.getRouteWeather(routeId, 0, 100);
      addResult("Get Weather Data", result);
    } catch (error) {
      addResult("Get Weather Data", error instanceof Error ? error.message : String(error), false);
    }
  };

  const testAddWeatherData = async (routeId: number) => {
    try {
      const weatherData = {
        route_id: routeId,
        temperature: 28.5,
        feels_like: 32.1,
        pressure: 1013.25,
        humidity: 65,
        precipitation: 2.3,
        wind_speed: 3.5,
        wind_deg: 180,
        wind_gust: 5.2,
        visibility: 10000,
        weather_condition: "Light rain",
        weather_description: "Light rain with scattered clouds",
        clouds: 40,
        raw_data: {
          source: "OpenWeatherMap API",
          timestamp: new Date().toISOString()
        }
      };

      const result = await routeOptimizationService.addRouteWeather(routeId, weatherData);
      addResult("Add Weather Data", result);
    } catch (error) {
      addResult("Add Weather Data", error instanceof Error ? error.message : String(error), false);
    }
  };

  const testGetFuelPrices = async (routeId: number) => {
    try {
      const result = await routeOptimizationService.getRouteFuelPrices(routeId, 0, 100);
      addResult("Get Fuel Prices", result);
    } catch (error) {
      addResult("Get Fuel Prices", error instanceof Error ? error.message : String(error), false);
    }
  };

  const testAddFuelPrice = async (routeId: number) => {
    try {
      const fuelPriceData = {
        route_id: routeId,
        fuel_type: "Diesel",
        price_per_liter: 92.4,
        location: "Patna, Bihar",
        raw_data: {
          source: "FuelAPI.in",
          timestamp: new Date().toISOString()
        }
      };

      const result = await routeOptimizationService.addRouteFuelPrice(routeId, fuelPriceData);
      addResult("Add Fuel Price", result);
    } catch (error) {
      addResult("Add Fuel Price", error instanceof Error ? error.message : String(error), false);
    }
  };

  const testGetOptimizationHistory = async (routeId: number) => {
    try {
      const result = await routeOptimizationService.getRouteOptimizations(routeId, 0, 100);
      addResult("Get Optimization History", result);
    } catch (error) {
      addResult("Get Optimization History", error instanceof Error ? error.message : String(error), false);
    }
  };

  const testAddOptimizationHistory = async (routeId: number) => {
    try {
      const optimizationData = {
        route_id: routeId,
        optimization_type: "time",
        original_time: 90,
        optimized_time: 65,
        original_distance: 78.5,
        optimized_distance: 74.2,
        original_cost: 520,
        optimized_cost: 460,
        alternative_routes: [
          {
            route_id: 103,
            time: 70,
            distance: 76,
            cost: 470
          },
          {
            route_id: 104,
            time: 68,
            distance: 75.5,
            cost: 465
          }
        ],
        factors_considered: {
          traffic: "Moderate",
          weather: "Light rain",
          fuel_prices: "High",
          road_condition: "Good"
        },
        confidence_score: 0.92
      };

      const result = await routeOptimizationService.addRouteOptimization(routeId, optimizationData);
      addResult("Add Optimization History", result);
    } catch (error) {
      addResult("Add Optimization History", error instanceof Error ? error.message : String(error), false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading routes...</div>
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
      <PageBreadcrumb pageTitle="Route Optimization Test" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Route Optimization Test</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test all route optimization API endpoints
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Route Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Select Route</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map((route) => (
              <div key={route.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 dark:text-white">{route.route_number}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {route.start_point} → {route.end_point}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => testOptimizeRoute(route.id!)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Optimize
                  </button>
                  <button
                    onClick={() => testGetTrafficData(route.id!)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Get Traffic
                  </button>
                  <button
                    onClick={() => testAddTrafficData(route.id!)}
                    className="px-3 py-1 bg-green-700 text-white text-sm rounded hover:bg-green-800"
                  >
                    Add Traffic
                  </button>
                  <button
                    onClick={() => testGetWeatherData(route.id!)}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                  >
                    Get Weather
                  </button>
                  <button
                    onClick={() => testAddWeatherData(route.id!)}
                    className="px-3 py-1 bg-yellow-700 text-white text-sm rounded hover:bg-yellow-800"
                  >
                    Add Weather
                  </button>
                  <button
                    onClick={() => testGetFuelPrices(route.id!)}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                  >
                    Get Fuel
                  </button>
                  <button
                    onClick={() => testAddFuelPrice(route.id!)}
                    className="px-3 py-1 bg-purple-700 text-white text-sm rounded hover:bg-purple-800"
                  >
                    Add Fuel
                  </button>
                  <button
                    onClick={() => testGetOptimizationHistory(route.id!)}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                  >
                    Get History
                  </button>
                  <button
                    onClick={() => testAddOptimizationHistory(route.id!)}
                    className="px-3 py-1 bg-indigo-700 text-white text-sm rounded hover:bg-indigo-800"
                  >
                    Add History
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Test Results</h2>
            <button
              onClick={() => setResults([])}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Clear Results
            </button>
          </div>
          
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No test results yet. Select a route and run tests above.
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 ${
                    result.success 
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" 
                      : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                  }`}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      {result.testName}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {result.timestamp}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestOptimizationPage;