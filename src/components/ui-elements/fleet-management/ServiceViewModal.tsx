"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";
import { serviceService, ServiceRecord } from "@/services/serviceService";

interface ServiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: number | null;
}

const getStatusBadgeColor = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "success";
    case "cancelled":
      return "error";
    case "in_progress":
      return "warning";
    case "scheduled":
    default:
      return "primary";
  }
};

export default function ServiceViewModal({ isOpen, onClose, serviceId }: ServiceViewModalProps) {
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isOpen || !serviceId) return;
      try {
        setIsLoading(true);
        const fresh = await serviceService.getServiceById(serviceId);
        if (!cancelled) setService(fresh);
      } catch (e) {
        if (!cancelled) setError((e as Error).message || "Failed to load service");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    setError(null);
    setService(null);
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, serviceId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Service Details</h2>
          <p className="text-gray-600 dark:text-gray-400">Service #{serviceId ?? "—"}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
        ) : service ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Vehicle ID</div>
                <div className="font-medium text-gray-900 dark:text-white">{service.vehicle_id}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Service Type</div>
                <div className="font-medium text-gray-900 dark:text-white">{service.service_type}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Status</div>
                <div className="mt-1"><Badge size="sm" color={getStatusBadgeColor(service.status)}>{service.status}</Badge></div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Priority</div>
                <div className="font-medium text-gray-900 dark:text-white">{service.priority}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Scheduled</div>
                <div className="font-medium text-gray-900 dark:text-white">{service.scheduled_date ? new Date(service.scheduled_date).toLocaleString() : "N/A"}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Estimated Duration</div>
                <div className="font-medium text-gray-900 dark:text-white">{service.estimated_duration ?? "—"} min</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Actual Duration</div>
                <div className="font-medium text-gray-900 dark:text-white">{service.actual_duration ?? "—"} min</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Cost</div>
                <div className="font-medium text-gray-900 dark:text-white">{service.cost != null ? service.cost : "—"}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Created</div>
                <div className="font-medium text-gray-900 dark:text-white">{service.created_at ? new Date(service.created_at).toLocaleString() : "N/A"}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Updated</div>
                <div className="font-medium text-gray-900 dark:text-white">{service.updated_at ? new Date(service.updated_at).toLocaleString() : "N/A"}</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Description</div>
              <div className="text-gray-900 dark:text-white/90 text-sm">{service.description || "—"}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Notes</div>
              <div className="text-gray-900 dark:text-white/90 text-sm">{service.notes || "—"}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">No data</div>
        )}

        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
