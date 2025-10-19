import React from "react";
import { VehicleDiagnostics } from "@/services/performanceService";

interface VehicleDiagnosticsCardProps {
  diagnostics: VehicleDiagnostics;
  vehicleName?: string;
}

const VehicleDiagnosticsCard: React.FC<VehicleDiagnosticsCardProps> = ({ diagnostics, vehicleName }) => {
  // Function to determine color based on value
  const getLevelColor = (level: number) => {
    if (level >= 80) return "text-green-600 dark:text-green-400";
    if (level >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Function to determine progress bar color
  const getProgressColor = (level: number) => {
    if (level >= 80) return "bg-green-500";
    if (level >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Function to determine engine health color
  const getEngineHealthColor = (health: number) => {
    if (health >= 70) return "text-green-600 dark:text-green-400";
    if (health >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Function to determine battery voltage status
  const getBatteryStatus = (voltage: number) => {
    if (voltage >= 12.4) return { text: "Good", color: "text-green-600 dark:text-green-400" };
    if (voltage >= 12.0) return { text: "Fair", color: "text-yellow-600 dark:text-yellow-400" };
    return { text: "Poor", color: "text-red-600 dark:text-red-400" };
  };

  const batteryStatus = getBatteryStatus(diagnostics.battery_voltage);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {vehicleName ? `Vehicle Diagnostics - ${vehicleName}` : "Vehicle Diagnostics"}
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last Updated: {new Date(diagnostics.last_updated || "").toLocaleString()}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Engine Health */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Engine Health</h3>
            <span className={`text-3xl font-bold ${getEngineHealthColor(diagnostics.engine_health)}`}>
              {diagnostics.engine_health}<span className="text-lg">/100</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div 
              className={`h-4 rounded-full ${getProgressColor(diagnostics.engine_health)}`} 
              style={{ width: `${diagnostics.engine_health}%` }}
            ></div>
          </div>
        </div>
        
        {/* Fluid Levels */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Fluid Levels</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Oil Level</span>
                <span className={`text-sm font-medium ${getLevelColor(diagnostics.oil_level)}`}>
                  {diagnostics.oil_level}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(diagnostics.oil_level)}`} 
                  style={{ width: `${diagnostics.oil_level}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Coolant Level</span>
                <span className={`text-sm font-medium ${getLevelColor(diagnostics.coolant_level)}`}>
                  {diagnostics.coolant_level}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(diagnostics.coolant_level)}`} 
                  style={{ width: `${diagnostics.coolant_level}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Brake Fluid</span>
                <span className={`text-sm font-medium ${getLevelColor(diagnostics.brake_fluid_level)}`}>
                  {diagnostics.brake_fluid_level}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(diagnostics.brake_fluid_level)}`} 
                  style={{ width: `${diagnostics.brake_fluid_level}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Transmission Fluid</span>
                <span className={`text-sm font-medium ${getLevelColor(diagnostics.transmission_fluid_level)}`}>
                  {diagnostics.transmission_fluid_level}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(diagnostics.transmission_fluid_level)}`} 
                  style={{ width: `${diagnostics.transmission_fluid_level}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tire Pressure */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Tire Pressure (PSI)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 border border-gray-200 dark:border-gray-700 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">Front Left</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {diagnostics.tire_pressure_front_left}
              </p>
            </div>
            <div className="text-center p-2 border border-gray-200 dark:border-gray-700 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">Front Right</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {diagnostics.tire_pressure_front_right}
              </p>
            </div>
            <div className="text-center p-2 border border-gray-200 dark:border-gray-700 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">Rear Left</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {diagnostics.tire_pressure_rear_left}
              </p>
            </div>
            <div className="text-center p-2 border border-gray-200 dark:border-gray-700 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">Rear Right</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {diagnostics.tire_pressure_rear_right}
              </p>
            </div>
          </div>
        </div>
        
        {/* Battery Status */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Battery</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Voltage</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {diagnostics.battery_voltage} <span className="text-sm">V</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className={`text-lg font-bold ${batteryStatus.color}`}>
                {batteryStatus.text}
              </p>
            </div>
          </div>
        </div>
        
        {/* Diagnostic Trouble Codes */}
        <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 dark:text-white mb-2">Diagnostic Trouble Codes</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <p className="text-gray-800 dark:text-white">
              {diagnostics.diagnostic_trouble_codes || "No trouble codes detected"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDiagnosticsCard;