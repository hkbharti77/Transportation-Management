import React, { useState } from "react";
import { routeOptimizationService, CreateWeatherDataRequest } from "@/services/routeOptimizationService";
import { Route } from "@/services/routeService";

interface WeatherDataFormProps {
  routes: Route[];
  onSuccess: () => void;
  onCancel: () => void;
}

const WeatherDataForm: React.FC<WeatherDataFormProps> = ({ routes, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateWeatherDataRequest>({
    route_id: routes.length > 0 ? routes[0].id! : 0,
    temperature: null,
    feels_like: null,
    pressure: null,
    humidity: null,
    precipitation: null,
    wind_speed: null,
    wind_deg: null,
    wind_gust: null,
    visibility: null,
    weather_condition: null,
    weather_description: null,
    clouds: null,
    raw_data: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle special cases for null values
    let processedValue: string | number | null = value;
    if (name === "temperature" || name === "feels_like" || name === "pressure" || 
        name === "humidity" || name === "precipitation" || name === "wind_speed" || 
        name === "wind_deg" || name === "wind_gust" || name === "visibility" || 
        name === "clouds") {
      processedValue = value === "" || value === "null" ? null : Number(value);
    } else if (name === "route_id") {
      processedValue = Number(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    } as CreateWeatherDataRequest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await routeOptimizationService.addRouteWeather(formData.route_id, formData);
      onSuccess();
    } catch (err) {
      console.error("Error adding weather data:", err);
      setError(err instanceof Error ? err.message : "Failed to add weather data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add Weather Data</h2>
      
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
              Temperature (°C)
            </label>
            <input
              type="number"
              name="temperature"
              step="0.1"
              value={formData.temperature === null ? "" : formData.temperature}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Feels Like (°C)
            </label>
            <input
              type="number"
              name="feels_like"
              step="0.1"
              value={formData.feels_like === null ? "" : formData.feels_like}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pressure (hPa)
            </label>
            <input
              type="number"
              name="pressure"
              step="0.1"
              value={formData.pressure === null ? "" : formData.pressure}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Humidity (%)
            </label>
            <input
              type="number"
              name="humidity"
              min="0"
              max="100"
              step="0.1"
              value={formData.humidity === null ? "" : formData.humidity}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Precipitation (mm)
            </label>
            <input
              type="number"
              name="precipitation"
              min="0"
              step="0.1"
              value={formData.precipitation === null ? "" : formData.precipitation}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wind Speed (m/s)
            </label>
            <input
              type="number"
              name="wind_speed"
              min="0"
              step="0.1"
              value={formData.wind_speed === null ? "" : formData.wind_speed}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wind Direction (degrees)
            </label>
            <input
              type="number"
              name="wind_deg"
              min="0"
              max="360"
              step="0.1"
              value={formData.wind_deg === null ? "" : formData.wind_deg}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wind Gust (m/s)
            </label>
            <input
              type="number"
              name="wind_gust"
              min="0"
              step="0.1"
              value={formData.wind_gust === null ? "" : formData.wind_gust}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Visibility (meters)
            </label>
            <input
              type="number"
              name="visibility"
              min="0"
              step="1"
              value={formData.visibility === null ? "" : formData.visibility}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Weather Condition
            </label>
            <input
              type="text"
              name="weather_condition"
              value={formData.weather_condition || ""}
              onChange={handleChange}
              placeholder="e.g., Clear, Rain, Snow"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Weather Description
            </label>
            <input
              type="text"
              name="weather_description"
              value={formData.weather_description || ""}
              onChange={handleChange}
              placeholder="e.g., Light rain, Overcast clouds"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cloud Coverage (%)
            </label>
            <input
              type="number"
              name="clouds"
              min="0"
              max="100"
              step="0.1"
              value={formData.clouds === null ? "" : formData.clouds}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Raw Data (JSON)
            </label>
            <textarea
              name="raw_data"
              value={typeof formData.raw_data === 'object' ? JSON.stringify(formData.raw_data) : (formData.raw_data || '')}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    raw_data: parsed
                  } as CreateWeatherDataRequest));
                } catch {
                  // If JSON parsing fails, store as empty object
                  setFormData(prev => ({
                    ...prev,
                    raw_data: {}
                  } as CreateWeatherDataRequest));
                }
              }}
              placeholder='{"source": "OpenWeatherMap API", "timestamp": "2025-10-12T09:50:00Z"}'
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
            {loading ? "Adding..." : "Add Weather Data"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WeatherDataForm;