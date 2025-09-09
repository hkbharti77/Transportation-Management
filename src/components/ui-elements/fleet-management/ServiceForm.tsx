"use client";

import React, { useState } from "react";
import { ServiceRecord, CreateServiceRecordRequest } from "@/services/serviceService";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";

interface ServiceFormProps {
  onSubmit: (serviceData: CreateServiceRecordRequest) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ServiceRecord>;
  isSubmitting?: boolean;
  showCancel?: boolean;
  submitButtonText?: string;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ 
  onSubmit, 
  onCancel,
  initialData = {},
  isSubmitting = false,
  showCancel = true,
  submitButtonText = "Create Service Record"
}) => {
  const [formData, setFormData] = useState<CreateServiceRecordRequest>({
    vehicle_id: initialData.vehicle_id || 0,
    service_type: initialData.service_type || "",
    description: initialData.description || "",
    scheduled_date: initialData.scheduled_date || new Date().toISOString().slice(0, 16),
    estimated_duration: initialData.estimated_duration || 0,
    cost: initialData.cost || 0,
    priority: initialData.priority || "medium",
    notes: initialData.notes || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === "vehicle_id" || name === "estimated_duration" || name === "cost" 
        ? Number(value) 
        : value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicle_id || formData.vehicle_id <= 0) {
      newErrors.vehicle_id = "Vehicle ID is required and must be greater than 0";
    }

    if (!formData.service_type) {
      newErrors.service_type = "Service type is required";
    }

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = "Scheduled date is required";
    }

    if (formData.estimated_duration !== undefined && formData.estimated_duration < 0) {
      newErrors.estimated_duration = "Duration cannot be negative";
    }

    if (formData.cost !== undefined && formData.cost < 0) {
      newErrors.cost = "Cost cannot be negative";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle ID */}
        <div className="md:col-span-1">
          <Label htmlFor="vehicle_id">Vehicle ID *</Label>
          <Input
            type="number"
            id="vehicle_id"
            name="vehicle_id"
            placeholder="Enter vehicle ID"
            defaultValue={formData.vehicle_id.toString()}
            onChange={(e) => handleChange("vehicle_id", e.target.value)}
            min="1"
          />
          {errors.vehicle_id && (
            <p className="mt-1 text-sm text-error-500">{errors.vehicle_id}</p>
          )}
        </div>

        {/* Service Type */}
        <div className="md:col-span-1">
          <Label htmlFor="service_type">Service Type *</Label>
          <Select
            options={[
              { value: "", label: "Select Service Type" },
              { value: "maintenance", label: "Maintenance" },
              { value: "repair", label: "Repair" },
              { value: "inspection", label: "Inspection" },
              { value: "cleaning", label: "Cleaning" },
              { value: "fuel_refill", label: "Fuel Refill" },
              { value: "tire_change", label: "Tire Change" },
              { value: "oil_change", label: "Oil Change" }
            ]}
            value={formData.service_type}
            onChange={(value) => handleChange("service_type", value)}
          />
          {errors.service_type && (
            <p className="mt-1 text-sm text-error-500">{errors.service_type}</p>
          )}
        </div>

        {/* Priority */}
        <div className="md:col-span-1">
          <Label htmlFor="priority">Priority</Label>
          <Select
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" }
            ]}
            placeholder="Select Priority"
            value={formData.priority}
            onChange={(value) => handleChange("priority", value)}
          />
        </div>

        {/* Scheduled Date */}
        <div className="md:col-span-1">
          <Label htmlFor="scheduled_date">Scheduled Date *</Label>
          <Input
            type="datetime-local"
            id="scheduled_date"
            name="scheduled_date"
            defaultValue={formData.scheduled_date}
            onChange={(e) => handleChange("scheduled_date", e.target.value)}
          />
          {errors.scheduled_date && (
            <p className="mt-1 text-sm text-error-500">{errors.scheduled_date}</p>
          )}
        </div>

        {/* Estimated Duration */}
        <div className="md:col-span-1">
          <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
          <Input
            type="number"
            id="estimated_duration"
            name="estimated_duration"
            placeholder="Enter estimated duration"
            defaultValue={formData.estimated_duration?.toString() || ""}
            onChange={(e) => handleChange("estimated_duration", e.target.value)}
            min="0"
          />
          {errors.estimated_duration && (
            <p className="mt-1 text-sm text-error-500">{errors.estimated_duration}</p>
          )}
        </div>

        {/* Cost */}
        <div className="md:col-span-1">
          <Label htmlFor="cost">Cost ($)</Label>
          <Input
            type="number"
            id="cost"
            name="cost"
            placeholder="Enter cost"
            defaultValue={formData.cost?.toString() || ""}
            onChange={(e) => handleChange("cost", e.target.value)}
            min="0"
            step={0.01}
          />
          {errors.cost && (
            <p className="mt-1 text-sm text-error-500">{errors.cost}</p>
          )}
        </div>

        {/* Description - Full Width */}
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            type="text"
            id="description"
            name="description"
            placeholder="Enter description"
            defaultValue={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        {/* Notes - Full Width */}
        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <TextArea
            placeholder="Enter additional notes"
            value={formData.notes || ""}
            onChange={(value) => handleChange("notes", value)}
            rows={4}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {showCancel && onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="px-6"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;