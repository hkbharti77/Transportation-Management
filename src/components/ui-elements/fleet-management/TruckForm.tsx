"use client";

import React, { useState, useEffect } from "react";
import { Truck, CreateTruckRequest, UpdateTruckRequest, Fleet } from "@/services/fleetService";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { fleetService } from "@/services/fleetService";

interface TruckFormProps {
  truck?: Truck | null;
  onSubmit: (truckData: CreateTruckRequest | UpdateTruckRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export default function TruckForm({
  truck,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}: TruckFormProps) {
  const [formData, setFormData] = useState<CreateTruckRequest>({
    fleet_id: 0, // Will be set after fleets are loaded
    truck_number: "",
    number_plate: "",
    truck_type: "small_truck",
    capacity_kg: 0,
    length_m: 0,
    width_m: 0,
    height_m: 0,
    fuel_type: "Diesel",
    fuel_capacity_l: 0,
    year_of_manufacture: new Date().getFullYear(),
    manufacturer: "",
    model: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [isLoadingFleets, setIsLoadingFleets] = useState(true);

  // Fetch available fleets on component mount
  useEffect(() => {
    const fetchFleets = async () => {
      setIsLoadingFleets(true);
      try {
        const availableFleets = await fleetService.getActiveFleets();
        setFleets(availableFleets);
        
        // Set default fleet_id to first available fleet
        if (availableFleets.length > 0 && !formData.fleet_id) {
          setFormData(prev => ({ ...prev, fleet_id: availableFleets[0].id || 0 }));
        }
      } catch (error) {
        console.error('Failed to fetch fleets:', error);
        // If no fleets available, try to create a default one
        try {
          const defaultFleet = await fleetService.createFleet({
            name: "Default Fleet",
            description: "Auto-created default fleet"
          });
          setFleets([defaultFleet]);
          setFormData(prev => ({ ...prev, fleet_id: defaultFleet.id || 0 }));
        } catch (createError) {
          console.error('Failed to create default fleet:', createError);
          // Show user-friendly error message
          setErrors(prev => ({
            ...prev,
            fleet_id: "No fleets available. Please create a fleet first."
          }));
        }
      } finally {
        setIsLoadingFleets(false);
      }
    };

    fetchFleets();
  }, [formData.fleet_id]);

  useEffect(() => {
    if (truck && mode === "edit") {
      setFormData({
        fleet_id: truck.fleet_id,
        truck_number: truck.truck_number,
        number_plate: truck.number_plate,
        truck_type: truck.truck_type,
        capacity_kg: truck.capacity_kg,
        length_m: truck.length_m,
        width_m: truck.width_m,
        height_m: truck.height_m,
        fuel_type: truck.fuel_type,
        fuel_capacity_l: truck.fuel_capacity_l,
        year_of_manufacture: truck.year_of_manufacture,
        manufacturer: truck.manufacturer,
        model: truck.model
      });
    }
  }, [truck, mode]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fleet_id || formData.fleet_id === 0) {
      newErrors.fleet_id = "Please select a fleet";
    }

    if (!formData.truck_number.trim()) {
      newErrors.truck_number = "Truck number is required";
    }

    if (!formData.number_plate.trim()) {
      newErrors.number_plate = "Number plate is required";
    }

    if (formData.capacity_kg <= 0) {
      newErrors.capacity_kg = "Capacity must be greater than 0";
    }

    if (formData.length_m <= 0) {
      newErrors.length_m = "Length must be greater than 0";
    }

    if (formData.width_m <= 0) {
      newErrors.width_m = "Width must be greater than 0";
    }

    if (formData.height_m <= 0) {
      newErrors.height_m = "Height must be greater than 0";
    }

    if (formData.fuel_capacity_l <= 0) {
      newErrors.fuel_capacity_l = "Fuel capacity must be greater than 0";
    }

    if (formData.year_of_manufacture < 1900 || formData.year_of_manufacture > new Date().getFullYear() + 1) {
      newErrors.year_of_manufacture = "Invalid year of manufacture";
    }

    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "Manufacturer is required";
    }

    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const fleetOptions = fleets.map(fleet => ({
    value: fleet.id?.toString() || "0",
    label: fleet.name
  }));

  const truckTypeOptions = [
    { value: "small_truck", label: "Small Truck" },
    { value: "medium_truck", label: "Medium Truck" },
    { value: "large_truck", label: "Large Truck" },
    { value: "container_truck", label: "Container Truck" }
  ];

  const fuelTypeOptions = [
    { value: "Diesel", label: "Diesel" },
    { value: "Petrol", label: "Petrol" },
    { value: "Electric", label: "Electric" },
    { value: "Hybrid", label: "Hybrid" }
  ];

  const yearOptions = Array.from({ length: 30 }, (_, i) => {
    const year = new Date().getFullYear() - 15 + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
                <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fleet *
            </label>
            <Select
              options={fleetOptions}
              placeholder={isLoadingFleets ? "Loading fleets..." : "Select a fleet"}
              onChange={(value) => handleInputChange("fleet_id", parseInt(value) || 0)}
              defaultValue={formData.fleet_id?.toString() || "0"}
              disabled={isLoadingFleets}
            />
            {errors.fleet_id && (
              <p className="mt-1 text-xs text-red-500">{errors.fleet_id}</p>
            )}
          </div>
          
                      <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Truck Number *
             </label>
             <Input
               name="truck_number"
               type="text"
               defaultValue={formData.truck_number}
               onChange={(e) => handleInputChange("truck_number", e.target.value)}
               error={!!errors.truck_number}
               hint={errors.truck_number}
               placeholder="e.g., TRK-001"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Number Plate *
             </label>
             <Input
               name="number_plate"
               type="text"
               defaultValue={formData.number_plate}
               onChange={(e) => handleInputChange("number_plate", e.target.value)}
               error={!!errors.number_plate}
               hint={errors.number_plate}
               placeholder="e.g., KA-01-AB-1234"
             />
           </div>

                     <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Truck Type *
             </label>
             <Select
               options={truckTypeOptions}
               placeholder="Select truck type"
               onChange={(value) => handleSelectChange("truck_type", value)}
               defaultValue={formData.truck_type}
             />
             {errors.truck_type && (
               <p className="mt-1 text-xs text-red-500">{errors.truck_type}</p>
             )}
           </div>

                     <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Capacity (kg) *
             </label>
             <Input
               name="capacity_kg"
               type="number"
               defaultValue={formData.capacity_kg}
               onChange={(e) => handleInputChange("capacity_kg", parseInt(e.target.value) || 0)}
               error={!!errors.capacity_kg}
               hint={errors.capacity_kg}
               placeholder="e.g., 5000"
             />
           </div>
        </div>

        {/* Vehicle Specifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vehicle Specifications</h3>
          
          <div className="grid grid-cols-3 gap-4">
                         <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Length (m) *
               </label>
               <Input
                 name="length_m"
                 type="number"
                 step={0.1}
                 defaultValue={formData.length_m}
                 onChange={(e) => handleInputChange("length_m", parseFloat(e.target.value) || 0)}
                 error={!!errors.length_m}
                 hint={errors.length_m}
                 placeholder="e.g., 6.5"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Width (m) *
               </label>
               <Input
                 name="width_m"
                 type="number"
                 step={0.1}
                 defaultValue={formData.width_m}
                 onChange={(e) => handleInputChange("width_m", parseFloat(e.target.value) || 0)}
                 error={!!errors.width_m}
                 hint={errors.width_m}
                 placeholder="e.g., 2.4"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Height (m) *
               </label>
               <Input
                 name="height_m"
                 type="number"
                 step={0.1}
                 defaultValue={formData.height_m}
                 onChange={(e) => handleInputChange("height_m", parseFloat(e.target.value) || 0)}
                 error={!!errors.height_m}
                 hint={errors.height_m}
                 placeholder="e.g., 2.8"
               />
             </div>
          </div>

                     <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Fuel Type *
             </label>
             <Select
               options={fuelTypeOptions}
               placeholder="Select fuel type"
               onChange={(value) => handleSelectChange("fuel_type", value)}
               defaultValue={formData.fuel_type}
             />
             {errors.fuel_type && (
               <p className="mt-1 text-xs text-red-500">{errors.fuel_type}</p>
             )}
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Fuel Capacity (L) *
             </label>
             <Input
               name="fuel_capacity_l"
               type="number"
               defaultValue={formData.fuel_capacity_l}
               onChange={(e) => handleInputChange("fuel_capacity_l", parseInt(e.target.value) || 0)}
               error={!!errors.fuel_capacity_l}
               hint={errors.fuel_capacity_l}
               placeholder="e.g., 150"
             />
           </div>
        </div>
      </div>

      {/* Manufacturer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manufacturer Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Year of Manufacture *
             </label>
             <Select
               options={yearOptions}
               placeholder="Select year"
               onChange={(value) => handleSelectChange("year_of_manufacture", value)}
               defaultValue={formData.year_of_manufacture.toString()}
             />
             {errors.year_of_manufacture && (
               <p className="mt-1 text-xs text-red-500">{errors.year_of_manufacture}</p>
             )}
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Manufacturer *
             </label>
             <Input
               name="manufacturer"
               type="text"
               defaultValue={formData.manufacturer}
               onChange={(e) => handleInputChange("manufacturer", e.target.value)}
               error={!!errors.manufacturer}
               hint={errors.manufacturer}
               placeholder="e.g., Tata Motors"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Model *
             </label>
             <Input
               name="model"
               type="text"
               defaultValue={formData.model}
               onChange={(e) => handleInputChange("model", e.target.value)}
               error={!!errors.model}
               hint={errors.model}
               placeholder="e.g., Tata 407"
             />
           </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isLoadingFleets}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === "create" ? "Creating..." : "Updating..."}
            </div>
          ) : (
            mode === "create" ? "Create Truck" : "Update Truck"
          )}
        </Button>
      </div>
    </form>
  );
}
