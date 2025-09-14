"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";
import { serviceService, ServiceRecord } from "@/services/serviceService";

interface ServiceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceRecord | null;
  onServiceUpdated: (service: ServiceRecord) => void;
  userRole?: "admin" | "driver" | string;
}

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

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

export default function ServiceStatusModal({
  isOpen,
  onClose,
  service,
  onServiceUpdated,
  // userRole, // userRole is unused
}: ServiceStatusModalProps) {
  const [current, setCurrent] = useState<ServiceRecord | null>(service);
  const [status, setStatus] = useState<string>(service?.status || "scheduled");
  const [duration, setDuration] = useState<string>(service?.actual_duration?.toString() || "");
  const [notes, setNotes] = useState<string>(service?.notes || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!service?.id || !isOpen) return;
      try {
        const fresh = await serviceService.getServiceById(service.id);
        if (cancelled) return;
        setCurrent(fresh);
        setStatus(fresh.status || "scheduled");
        setDuration(fresh.actual_duration != null ? String(fresh.actual_duration) : "");
        setNotes(fresh.notes || "");
      } catch {
        // keep existing values on failure
      }
    };
    setCurrent(service);
    setStatus(service?.status || "scheduled");
    setDuration(service?.actual_duration != null ? String(service.actual_duration) : "");
    setNotes(service?.notes || "");
    setError(null);
    setSuccess(null);
    load();
    return () => {
      cancelled = true;
    };
  }, [service, isOpen]);

  const handleSave = async () => {
    if (!service?.id) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await serviceService.updateServiceStatus(service.id, {
        status,
        actual_duration: duration === "" ? undefined : Number(duration),
        notes: notes.trim() || undefined,
      });

      const merged: ServiceRecord = {
        ...(current || service!),
        status: updated.status,
        actual_duration: updated.actual_duration,
        updated_at: updated.updated_at,
        notes,
      };

      onServiceUpdated(merged);
      setSuccess("Service updated successfully.");
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (e) {
      setError((e as Error).message || "Failed to update service");
    } finally {
      setIsLoading(false);
    }
  };

  const s = current || service;

  return (
    <Modal isOpen={isOpen} onClose={() => !isLoading && onClose()} className="max-w-xl mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Update Service</h2>
          <p className="text-gray-600 dark:text-gray-400">Service #{s?.id}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-200">
            {success}
          </div>
        )}

        <div className="space-y-5">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Vehicle ID</span>
                <p className="font-medium text-gray-900 dark:text-white">{s?.vehicle_id}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Service Type</span>
                <p className="font-medium text-gray-900 dark:text-white">{s?.service_type}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Assigned Mechanic</span>
                <p className="font-medium text-gray-900 dark:text-white">{s?.assigned_mechanic_id ?? "—"}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Current Status</span>
                <div className="mt-1">
                  <Badge size="sm" color={getStatusBadgeColor(s?.status)}>
                    {s?.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="status">New Status</Label>
            <select
              id="status"
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Actual Duration (minutes)</Label>
              <input
                id="duration"
                type="number"
                placeholder="e.g. 45"
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200 dark:placeholder:text-gray-500"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <input
                id="notes"
                type="text"
                placeholder="Add notes"
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200 dark:placeholder:text-gray-500"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
