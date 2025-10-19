import React, { useState } from "react";
import { performanceService, CreateVehicleDiagnosticsRequest } from "@/services/performanceService";

interface VehicleDiagnosticsFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const VehicleDiagnosticsForm: React.FC<VehicleDiagnosticsFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateVehicleDiagnosticsRequest>({
    vehicle_id: 0,
    engine_health: 0,
    tire_pressure_front_left: 0,
    tire_pressure_front_right: 0,
    tire_pressure_rear_left: 0,
    tire_pressure_rear_right: 0,
    oil_level: 0,
    coolant_level: 0,
    brake_fluid_level: 0,
    transmission_fluid_level: 0,
    battery_voltage: 0,
    diagnostic_trouble_codes: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "vehicle_id" || name.includes("pressure") || name.includes("level") || name === "battery_voltage"
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await performanceService.createVehicleDiagnostics(formData);
      onSuccess?.();
    } catch (err) {
      console.error("Error creating vehicle diagnostics:", err);
      setError("Failed to create vehicle diagnostics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add Vehicle Diagnostics</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vehicle ID
            </label>
            <input
              type="number"
              name="vehicle_id"
              value={formData.vehicle_id || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Engine Health (0-100)
            </label>
            <input
              type="number"
              name="engine_health"
              min="0"
              max="100"
              value={formData.engine_health || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tire Pressure - Front Left (PSI)
            </label>
            <input
              type="number"
              name="tire_pressure_front_left"
              step="0.1"
              value={formData.tire_pressure_front_left || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tire Pressure - Front Right (PSI)
            </label>
            <input
              type="number"
              name="tire_pressure_front_right"
              step="0.1"
              value={formData.tire_pressure_front_right || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tire Pressure - Rear Left (PSI)
            </label>
            <input
              type="number"
              name="tire_pressure_rear_left"
              step="0.1"
              value={formData.tire_pressure_rear_left || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tire Pressure - Rear Right (PSI)
            </label>
            <input
              type="number"
              name="tire_pressure_rear_right"
              step="0.1"
              value={formData.tire_pressure_rear_right || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Oil Level (0-100)
            </label>
            <input
              type="number"
              name="oil_level"
              min="0"
              max="100"
              value={formData.oil_level || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Coolant Level (0-100)
            </label>
            <input
              type="number"
              name="coolant_level"
              min="0"
              max="100"
              value={formData.coolant_level || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Brake Fluid Level (0-100)
            </label>
            <input
              type="number"
              name="brake_fluid_level"
              min="0"
              max="100"
              value={formData.brake_fluid_level || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transmission Fluid Level (0-100)
            </label>
            <input
              type="number"
              name="transmission_fluid_level"
              min="0"
              max="100"
              value={formData.transmission_fluid_level || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Battery Voltage (V)
            </label>
            <input
              type="number"
              name="battery_voltage"
              step="0.1"
              value={formData.battery_voltage || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Diagnostic Trouble Codes
            </label>
            <textarea
              name="diagnostic_trouble_codes"
              value={formData.diagnostic_trouble_codes || ""}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter any diagnostic trouble codes or 'None' if no issues"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Diagnostics"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleDiagnosticsForm;