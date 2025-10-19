import React, { useState } from "react";
import { routeOptimizationService, CreateFuelPriceRequest } from "@/services/routeOptimizationService";
import { Route } from "@/services/routeService";

interface FuelPriceFormProps {
  routes: Route[];
  onSuccess: () => void;
  onCancel: () => void;
}

const FuelPriceForm: React.FC<FuelPriceFormProps> = ({ routes, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateFuelPriceRequest>({
    route_id: routes.length > 0 ? routes[0].id! : 0,
    fuel_type: "",
    price_per_liter: 0,
    location: "",
    raw_data: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "route_id" || name === "price_per_liter" 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await routeOptimizationService.addRouteFuelPrice(formData.route_id, formData);
      onSuccess();
    } catch (err) {
      console.error("Error adding fuel price data:", err);
      setError(err instanceof Error ? err.message : "Failed to add fuel price data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add Fuel Price Data</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Route
            </label>
            <select
              name="route_id"
              value={formData.route_id}
              onChange={handleChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            >
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.route_number} - {route.start_point} → {route.end_point}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fuel Type
            </label>
            <input
              type="text"
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleChange}
              placeholder="e.g., Diesel, Petrol, CNG"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price per Liter (₹)
            </label>
            <input
              type="number"
              name="price_per_liter"
              min="0"
              step="0.01"
              value={formData.price_per_liter}
              onChange={handleChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., City name, Station name"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Raw Data (JSON)
            </label>
            <textarea
              name="raw_data"
              value={typeof formData.raw_data === 'object' ? JSON.stringify(formData.raw_data) : formData.raw_data}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    raw_data: parsed
                  }));
                } catch {
                  // If JSON parsing fails, store as empty object
                  setFormData(prev => ({
                    ...prev,
                    raw_data: {}
                  }));
                }
              }}
              placeholder='{"source": "FuelAPI", "timestamp": "2025-10-12T09:55:00Z"}'
              rows={3}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Fuel Price"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FuelPriceForm;