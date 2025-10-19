import React from "react";
import { RouteOptimizationResponse, TrafficData, WeatherData } from "@/services/routeOptimizationService";

interface RouteOptimizationCardProps {
  optimizationData: RouteOptimizationResponse;
  trafficData: TrafficData[];
  weatherData: WeatherData[];
  routeName?: string;
}

const RouteOptimizationCard: React.FC<RouteOptimizationCardProps> = ({ 
  optimizationData, 
  trafficData, 
  weatherData,
  routeName 
}) => {
  // Function to determine optimization status color
  const getOptimizationStatusColor = (saved: number) => {
    if (saved > 0) return "text-green-600 dark:text-green-400";
    if (saved < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  // Get latest traffic data
  const latestTraffic = trafficData.length > 0 ? trafficData[0] : null;
  
  // Get latest weather data
  const latestWeather = weatherData.length > 0 ? weatherData[0] : null;

  // Function to get congestion level description
  const getCongestionLevel = (level: number) => {
    if (level >= 4) return { text: "Heavy", color: "text-red-600 dark:text-red-400" };
    if (level >= 3) return { text: "Moderate", color: "text-yellow-600 dark:text-yellow-400" };
    if (level >= 2) return { text: "Light", color: "text-green-600 dark:text-green-400" };
    return { text: "Clear", color: "text-blue-600 dark:text-blue-400" };
  };

  // Function to get weather condition color
  const getWeatherConditionColor = (condition: string | null) => {
    if (!condition) return "text-gray-600 dark:text-gray-400";
    
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("rain") || conditionLower.includes("storm")) 
      return "text-blue-600 dark:text-blue-400";
    if (conditionLower.includes("snow") || conditionLower.includes("ice")) 
      return "text-gray-600 dark:text-gray-400";
    if (conditionLower.includes("cloud")) 
      return "text-gray-500 dark:text-gray-400";
    return "text-yellow-500 dark:text-yellow-400";
  };

  const congestionInfo = latestTraffic ? getCongestionLevel(latestTraffic.congestion_level) : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {routeName ? `Route Optimization - ${routeName}` : "Route Optimization"}
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Confidence: {(optimizationData.confidence_score * 100).toFixed(0)}%
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Time Optimization */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <h3 className="font-medium text-gray-800 dark:text-white mb-2">Time</h3>
          <div className="flex items-baseline justify-center">
            <span className={`text-2xl font-bold ${getOptimizationStatusColor(optimizationData.time_saved)}`}>
              {optimizationData.optimized_time} min
            </span>
            {optimizationData.time_saved !== 0 && (
              <span className={`ml-2 text-sm ${getOptimizationStatusColor(optimizationData.time_saved)}`}>
                ({optimizationData.time_saved > 0 ? '-' : '+'}{Math.abs(optimizationData.time_saved)} min)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Original: {optimizationData.original_time} min
          </p>
        </div>
        
        {/* Distance Optimization */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <h3 className="font-medium text-gray-800 dark:text-white mb-2">Distance</h3>
          <div className="flex items-baseline justify-center">
            <span className={`text-2xl font-bold ${getOptimizationStatusColor(optimizationData.distance_saved)}`}>
              {optimizationData.optimized_distance} km
            </span>
            {optimizationData.distance_saved !== 0 && (
              <span className={`ml-2 text-sm ${getOptimizationStatusColor(optimizationData.distance_saved)}`}>
                ({optimizationData.distance_saved > 0 ? '-' : '+'}{Math.abs(optimizationData.distance_saved)} km)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Original: {optimizationData.original_distance} km
          </p>
        </div>
        
        {/* Cost Optimization */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <h3 className="font-medium text-gray-800 dark:text-white mb-2">Cost</h3>
          <div className="flex items-baseline justify-center">
            <span className={`text-2xl font-bold ${getOptimizationStatusColor(optimizationData.cost_saved)}`}>
              ${optimizationData.optimized_cost}
            </span>
            {optimizationData.cost_saved !== 0 && (
              <span className={`ml-2 text-sm ${getOptimizationStatusColor(optimizationData.cost_saved)}`}>
                ({optimizationData.cost_saved > 0 ? '-' : '+'}${Math.abs(optimizationData.cost_saved)})
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Original: ${optimizationData.original_cost}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Traffic Conditions */}
        {latestTraffic && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Current Traffic</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Congestion Level</span>
                <span className={`font-medium ${congestionInfo?.color}`}>
                  {congestionInfo?.text} ({latestTraffic.congestion_level}/5)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average Speed</span>
                <span className="font-medium">{latestTraffic.average_speed} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Travel Time</span>
                <span className="font-medium">{latestTraffic.travel_time} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Road Conditions</span>
                <span className="font-medium">{latestTraffic.road_conditions}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Updated: {new Date(latestTraffic.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}
        
        {/* Current Weather Conditions */}
        {latestWeather && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Current Weather</h3>
            <div className="space-y-3">
              {latestWeather.weather_condition && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Condition</span>
                  <span className={`font-medium ${getWeatherConditionColor(latestWeather.weather_condition)}`}>
                    {latestWeather.weather_condition}
                  </span>
                </div>
              )}
              {latestWeather.weather_description && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Description</span>
                  <span className="font-medium">{latestWeather.weather_description}</span>
                </div>
              )}
              {latestWeather.temperature !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Temperature</span>
                  <span className="font-medium">{latestWeather.temperature}°C</span>
                </div>
              )}
              {latestWeather.feels_like !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Feels Like</span>
                  <span className="font-medium">{latestWeather.feels_like}°C</span>
                </div>
              )}
              {latestWeather.humidity !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Humidity</span>
                  <span className="font-medium">{latestWeather.humidity}%</span>
                </div>
              )}
              {latestWeather.precipitation !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Precipitation</span>
                  <span className="font-medium">{latestWeather.precipitation} mm</span>
                </div>
              )}
              {latestWeather.wind_speed !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Wind Speed</span>
                  <span className="font-medium">{latestWeather.wind_speed} m/s</span>
                </div>
              )}
              {latestWeather.wind_deg !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Wind Direction</span>
                  <span className="font-medium">{latestWeather.wind_deg}°</span>
                </div>
              )}
              {latestWeather.visibility !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Visibility</span>
                  <span className="font-medium">{latestWeather.visibility} m</span>
                </div>
              )}
              {latestWeather.pressure !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pressure</span>
                  <span className="font-medium">{latestWeather.pressure} hPa</span>
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Updated: {new Date(latestWeather.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Recommendations */}
      {optimizationData.recommendations && optimizationData.recommendations.length > 0 && (
        <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {optimizationData.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-gray-700 dark:text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Factors Used */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-800 dark:text-white mb-2">Optimization Factors</h3>
        <div className="flex flex-wrap gap-2">
          {optimizationData.factors_used.map((factor, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-sm rounded-full"
            >
              {factor}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Note: Weather data including wind speed is automatically detected and collected during optimization
        </p>
      </div>
    </div>
  );
};

export default RouteOptimizationCard;