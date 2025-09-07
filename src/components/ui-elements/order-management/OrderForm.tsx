import React, { useState, useEffect } from "react";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import Label from "../../form/Label";
import Button from "../../ui/button/Button";
import { useModal } from "../../../hooks/useModal";
import { CreateOrderRequest, Order } from "../../../services/orderService";

interface OrderFormProps {
  order?: Order | null;
  onSubmit: (orderData: CreateOrderRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

const cargoTypeOptions = [
  { value: "general", label: "General Cargo" },
  { value: "fragile", label: "Fragile Items" },
  { value: "hazardous", label: "Hazardous Materials" },
  { value: "perishable", label: "Perishable Goods" },
  { value: "liquid", label: "Liquid Cargo" },
  { value: "bulk", label: "Bulk Cargo" },
];

export default function OrderForm({
  order,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}: OrderFormProps) {
  const [formData, setFormData] = useState<CreateOrderRequest>({
    pickup_location: "",
    drop_location: "",
    cargo_type: "general",
    cargo_weight: 0,
    cargo_description: "",
    pickup_time: "",
    estimated_delivery_time: "",
    total_amount: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    if (order && mode === "edit") {
      setFormData({
        pickup_location: order.pickup_location,
        drop_location: order.drop_location,
        cargo_type: order.cargo_type,
        cargo_weight: order.cargo_weight,
        cargo_description: order.cargo_description,
        pickup_time: order.pickup_time.slice(0, 16), // Format for datetime-local input
        estimated_delivery_time: order.estimated_delivery_time.slice(0, 16),
        total_amount: order.total_amount,
      });
    }
  }, [order, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.pickup_location.trim()) {
      newErrors.pickup_location = "Pickup location is required";
    }

    if (!formData.drop_location.trim()) {
      newErrors.drop_location = "Drop location is required";
    }

    if (!formData.cargo_description.trim()) {
      newErrors.cargo_description = "Cargo description is required";
    }

    if (formData.cargo_weight <= 0) {
      newErrors.cargo_weight = "Cargo weight must be greater than 0";
    }

    if (!formData.pickup_time) {
      newErrors.pickup_time = "Pickup time is required";
    }

    if (!formData.estimated_delivery_time) {
      newErrors.estimated_delivery_time = "Estimated delivery time is required";
    }

    if (formData.pickup_time && formData.estimated_delivery_time) {
      const pickupDate = new Date(formData.pickup_time);
      const deliveryDate = new Date(formData.estimated_delivery_time);
      
      if (deliveryDate <= pickupDate) {
        newErrors.estimated_delivery_time = "Delivery time must be after pickup time";
      }
    }

    if (formData.total_amount < 0) {
      newErrors.total_amount = "Total amount cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateOrderRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleCargoTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      cargo_type: value as CreateOrderRequest['cargo_type']
    }));
    
    if (errors.cargo_type) {
      setErrors(prev => ({
        ...prev,
        cargo_type: ""
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert datetime-local format to ISO string
      const submissionData = {
        ...formData,
        pickup_time: new Date(formData.pickup_time).toISOString(),
        estimated_delivery_time: new Date(formData.estimated_delivery_time).toISOString(),
      };
      onSubmit(submissionData);
    }
  };

  const handleCancel = () => {
    if (Object.keys(formData).some(key => {
      const originalValue = order?.[key as keyof Order];
      const currentValue = formData[key as keyof CreateOrderRequest];
      return currentValue !== originalValue;
    })) {
      openModal();
    } else {
      onCancel();
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getMinDeliveryTime = () => {
    if (!formData.pickup_time) return getCurrentDateTime();
    
    const pickupDate = new Date(formData.pickup_time);
    pickupDate.setHours(pickupDate.getHours() + 1); // Minimum 1 hour after pickup
    pickupDate.setMinutes(pickupDate.getMinutes() - pickupDate.getTimezoneOffset());
    return pickupDate.toISOString().slice(0, 16);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {mode === "create" ? "Create New Transport Order" : "Edit Transport Order"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {mode === "create" 
            ? "Fill in the details below to create a new transport order."
            : "Update the order information below."
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pickup Location */}
          <div>
            <Label htmlFor="pickup_location">Pickup Location *</Label>
            <Input
              id="pickup_location"
              name="pickup_location"
              type="text"
              placeholder="Enter pickup address"
              defaultValue={formData.pickup_location}
              onChange={(e) => handleInputChange("pickup_location", e.target.value)}
              error={!!errors.pickup_location}
              hint={errors.pickup_location}
            />
          </div>

          {/* Drop Location */}
          <div>
            <Label htmlFor="drop_location">Drop Location *</Label>
            <Input
              id="drop_location"
              name="drop_location"
              type="text"
              placeholder="Enter delivery address"
              defaultValue={formData.drop_location}
              onChange={(e) => handleInputChange("drop_location", e.target.value)}
              error={!!errors.drop_location}
              hint={errors.drop_location}
            />
          </div>

          {/* Cargo Type */}
          <div>
            <Label htmlFor="cargo_type">Cargo Type *</Label>
            <Select
              options={cargoTypeOptions}
              placeholder="Select cargo type"
              onChange={handleCargoTypeChange}
              defaultValue={formData.cargo_type}
            />
            {errors.cargo_type && (
              <p className="mt-1 text-xs text-error-500">{errors.cargo_type}</p>
            )}
          </div>

          {/* Cargo Weight */}
          <div>
            <Label htmlFor="cargo_weight">Cargo Weight (kg) *</Label>
            <Input
              id="cargo_weight"
              name="cargo_weight"
              type="number"
              placeholder="Enter weight in kg"
              min="0.1"
              step={0.1}
              defaultValue={formData.cargo_weight.toString()}
              onChange={(e) => handleInputChange("cargo_weight", parseFloat(e.target.value) || 0)}
              error={!!errors.cargo_weight}
              hint={errors.cargo_weight}
            />
          </div>

          {/* Cargo Description */}
          <div className="lg:col-span-2">
            <Label htmlFor="cargo_description">Cargo Description *</Label>
            <textarea
              id="cargo_description"
              name="cargo_description"
              rows={3}
              placeholder="Describe the cargo details, special handling requirements, etc."
              defaultValue={formData.cargo_description}
              onChange={(e) => handleInputChange("cargo_description", e.target.value)}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
                errors.cargo_description
                  ? 'text-error-800 border-error-500 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500'
                  : 'bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800'
              }`}
            />
            {errors.cargo_description && (
              <p className="mt-1 text-xs text-error-500">{errors.cargo_description}</p>
            )}
          </div>

          {/* Pickup Time */}
          <div>
            <Label htmlFor="pickup_time">Pickup Time *</Label>
            <Input
              id="pickup_time"
              name="pickup_time"
              type="datetime-local"
              min={getCurrentDateTime()}
              defaultValue={formData.pickup_time}
              onChange={(e) => handleInputChange("pickup_time", e.target.value)}
              error={!!errors.pickup_time}
              hint={errors.pickup_time}
            />
          </div>

          {/* Estimated Delivery Time */}
          <div>
            <Label htmlFor="estimated_delivery_time">Estimated Delivery Time *</Label>
            <Input
              id="estimated_delivery_time"
              name="estimated_delivery_time"
              type="datetime-local"
              min={getMinDeliveryTime()}
              defaultValue={formData.estimated_delivery_time}
              onChange={(e) => handleInputChange("estimated_delivery_time", e.target.value)}
              error={!!errors.estimated_delivery_time}
              hint={errors.estimated_delivery_time}
            />
          </div>

          {/* Total Amount */}
          <div className="lg:col-span-2">
            <Label htmlFor="total_amount">Total Amount (₹)</Label>
            <Input
              id="total_amount"
              name="total_amount"
              type="number"
              placeholder="Enter total amount"
              min="0"
              step={0.01}
              defaultValue={formData.total_amount.toString()}
              onChange={(e) => handleInputChange("total_amount", parseFloat(e.target.value) || 0)}
              error={!!errors.total_amount}
              hint={errors.total_amount}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Leave as 0 if amount will be calculated later
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
            {isLoading ? "Saving..." : mode === "create" ? "Create Order" : "Update Order"}
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Discard Changes?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have unsaved changes. Are you sure you want to discard them?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={closeModal}
              >
                Continue Editing
              </Button>
              <Button
                onClick={() => {
                  closeModal();
                  onCancel();
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}