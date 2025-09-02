"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { fleetService, CreateFleetRequest } from "@/services/fleetService";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";

export default function CreateFleetPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setIsLoading(true);
    try {
      await fleetService.createFleet(formData);
      alert("Fleet created successfully!");
      router.push('/fleets');
    } catch (error) {
      console.error("Failed to create fleet:", error);
      alert("Failed to create fleet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/fleets');
  };

  const handleCreateDefaultFleet = async () => {
    if (!confirm('This will create a default fleet for the system. Continue?')) return;

    setIsLoading(true);
    try {
      await fleetService.createDefaultFleet();
      alert('Default fleet created successfully!');
      router.push('/fleets');
    } catch (error) {
      console.error('Failed to create default fleet:', error);
      alert('Failed to create default fleet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Create New Fleet
          </h2>
          <Button
            onClick={handleCreateDefaultFleet}
            variant="outline"
            disabled={isLoading}
          >
            Create Default Fleet
          </Button>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fleet Name *
                </label>
                <Input
                  name="name"
                  type="text"
                  defaultValue={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Metro Logistics Fleet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <Input
                  name="description"
                  type="text"
                  defaultValue={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Fleet dedicated to city-wide transportation"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  "Create Fleet"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
