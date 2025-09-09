"use client";

import React, { useState, useEffect } from "react";
import { serviceService, ServiceRecord, CreateServiceRecordRequest, CreateServiceResponse } from "@/services/serviceService";
import ServiceForm from "./ServiceForm";
import ServiceTable from "./ServiceTable";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import { PlusIcon } from "@/icons";

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getServices();
      setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (serviceData: CreateServiceRecordRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      
      const result: CreateServiceResponse = await serviceService.createService(serviceData);
      console.log("Service created:", result);
      
      // Hide form and refresh the service list
      setShowForm(false);
      fetchServices(); // Refresh the list
      
      // Show success message
      setSuccessMessage("Service record created successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Error creating service:", err);
      setError(err instanceof Error ? err.message : "Failed to create service record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setError(null);
  };

  return (
    <ComponentCard title="Service Management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Service Management
        </h2>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusIcon className="h-4 w-4" />
          {showForm ? "Cancel" : "Create Service Record"}
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Service Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Create New Service Record
          </h3>
          <ServiceForm 
            onSubmit={handleCreateService}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            showCancel={true}
            submitButtonText="Create Service Record"
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p>Loading services...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {services.length > 0 ? (
            <ServiceTable 
              services={services} 
              onEdit={(service) => console.log("Edit service:", service)}
              onDelete={(id) => console.log("Delete service:", id)}
            />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
                No Service Records Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first service record to get started.
              </p>
            </div>
          )}
        </div>
      )}
    </ComponentCard>
  );
};

export default ServiceManagement;