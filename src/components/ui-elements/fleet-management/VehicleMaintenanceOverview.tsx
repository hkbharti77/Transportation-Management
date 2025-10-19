"use client";

import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useAuth } from "@/context/AuthContext";
import { serviceService } from "@/services/serviceService";

type Overview = {
  total_vehicles: number;
  vehicles_requiring_maintenance: number;
  vehicles_overdue: number;
  vehicle_details: Array<{
    vehicle_id: number;
    license_plate: string;
    type: string;
    status: string;
    pending_services: number;
    overdue_services: number;
    last_service_date: string | null;
    assigned_driver: string | null;
  }>;
};

export default function VehicleMaintenanceOverview() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isAdmin) return;
      try {
        setLoading(true);
        setError(null);
        const res = await serviceService.getVehicleMaintenanceOverview();
        setData(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load maintenance overview");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <ComponentCard title="Vehicle Maintenance Overview (Admin)">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.total_vehicles ?? (loading ? "…" : 0)}</p>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm text-gray-600 dark:text-gray-400">Requiring Maintenance</p>
          <p className="text-2xl font-bold text-yellow-600">{data?.vehicles_requiring_maintenance ?? (loading ? "…" : 0)}</p>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{data?.vehicles_overdue ?? (loading ? "…" : 0)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 dark:text-gray-400">
              <th className="py-2 pr-4">Vehicle</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Pending</th>
              <th className="py-2 pr-4">Overdue</th>
              <th className="py-2 pr-4">Last Service</th>
              <th className="py-2 pr-4">Driver</th>
            </tr>
          </thead>
          <tbody>
            {(data?.vehicle_details || []).map((v) => (
              <tr key={v.vehicle_id} className="border-t border-gray-100 dark:border-white/5">
                <td className="py-2 pr-4 font-medium">{v.license_plate}</td>
                <td className="py-2 pr-4 capitalize">{v.type}</td>
                <td className="py-2 pr-4 capitalize">{v.status}</td>
                <td className="py-2 pr-4">{v.pending_services}</td>
                <td className="py-2 pr-4">{v.overdue_services}</td>
                <td className="py-2 pr-4">{v.last_service_date ? new Date(v.last_service_date).toLocaleDateString() : "—"}</td>
                <td className="py-2 pr-4">{v.assigned_driver || "—"}</td>
              </tr>
            ))}
            {!data && !loading && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500 dark:text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ComponentCard>
  );
}


