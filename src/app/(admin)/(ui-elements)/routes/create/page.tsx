"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { routeService, CreateRouteRequest } from "@/services/routeService";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

const CreateRoutePage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateRouteRequest>({
    route_number: "",
    start_point: "",
    end_point: "",
    stops: [],
    estimated_time: 0,
    distance: 0,
    base_fare: 0,
    description: "",
    is_active: true,
  });

  const [stopInput, setStopInput] = useState("");

  const isAdmin = user?.role === "admin";

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      router.push("/routes");
    }
  }, [isAdmin, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev: CreateRouteRequest) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : 
              type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addStop = () => {
    if (stopInput.trim() && !formData.stops.includes(stopInput.trim())) {
      setFormData((prev: CreateRouteRequest) => ({
        ...prev,
        stops: [...prev.stops, stopInput.trim()]
      }));
      setStopInput("");
    }
  };

  const removeStop = (index: number) => {
    setFormData((prev: CreateRouteRequest) => ({
      ...prev,
      stops: prev.stops.filter((_: string, i: number) => i !== index)
    }));
  };

  const handleStopKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addStop();
    }
  };

  const validateForm = (): boolean => {
    const errors = routeService.validateRouteData(formData);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await routeService.createRoute(formData);
      router.push("/routes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create route");
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { name: "Dashboard", path: "/" },
    { name: "Routes", path: "/routes" },
    { name: "Create Route", path: "/routes/create" },
  ];

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <PageBreadCrumb pageTitle="Create Route" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Route
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add a new transportation route to the system
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <strong className="font-bold">Please fix the following errors:</strong>
          <ul className="mt-2 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <ComponentCard title="Route Information" desc="Fill in the details below to create a new transportation route">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="route_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Route Number *
              </label>
              <input
                type="text"
                id="route_number"
                name="route_number"
                value={formData.route_number}
                onChange={handleInputChange}
                placeholder="e.g., B12, A45"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Route
                </span>
              </label>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Active routes are available for bookings
              </p>
            </div>
          </div>

          {/* Start and End Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_point" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Point *
              </label>
              <input
                type="text"
                id="start_point"
                name="start_point"
                value={formData.start_point}
                onChange={handleInputChange}
                placeholder="e.g., Central Bus Station"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="end_point" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Point *
              </label>
              <input
                type="text"
                id="end_point"
                name="end_point"
                value={formData.end_point}
                onChange={handleInputChange}
                placeholder="e.g., Airport Terminal 3"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Stops Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stops *
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={stopInput}
                onChange={(e) => setStopInput(e.target.value)}
                onKeyPress={handleStopKeyPress}
                placeholder="Add a stop..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                type="button"
                onClick={addStop}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add
              </button>
            </div>
            
            {formData.stops.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Route stops (in order):
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.stops.map((stop: string, index: number) => (
                    <div
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      <span className="mr-1 text-xs">{index + 1}.</span>
                      {stop}
                      <button
                        type="button"
                        onClick={() => removeStop(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Route Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="distance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Distance (km) *
              </label>
              <input
                type="number"
                id="distance"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="estimated_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Time (minutes) *
              </label>
              <input
                type="number"
                id="estimated_time"
                name="estimated_time"
                value={formData.estimated_time}
                onChange={handleInputChange}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="base_fare" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Fare (₹) *
              </label>
              <input
                type="number"
                id="base_fare"
                name="base_fare"
                value={formData.base_fare}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe this route, e.g., Express bus service from Central Bus Station to Airport Terminal 3 with 4 major stops."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Route Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Route Preview
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {formData.start_point || "Start Point"}
              </span>
              {formData.stops.map((stop: string, index: number) => (
                <React.Fragment key={index}>
                  <span>→</span>
                  <span>{stop}</span>
                </React.Fragment>
              ))}
              {formData.end_point && (
                <>
                  <span>→</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formData.end_point}
                  </span>
                </>
              )}
            </div>
            {formData.distance > 0 && formData.estimated_time > 0 && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {formData.distance} km • {Math.floor(formData.estimated_time / 60)}h {formData.estimated_time % 60}m • ₹{formData.base_fare}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Route"
              )}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default CreateRoutePage;