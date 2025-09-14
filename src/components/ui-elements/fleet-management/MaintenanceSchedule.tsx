"use client";

import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import { serviceService } from "@/services/serviceService";

type Schedule = {
  period_days: number;
  total_upcoming_services: number;
  services_by_date: Record<string, Array<{
    service_id: number;
    vehicle_id: number;
    service_type: string;
    description?: string;
    priority?: string;
    estimated_duration?: number;
    cost?: number;
  }>>;
  maintenance_schedules: Array<{
    schedule_id: number;
    vehicle_id: number;
    service_type: string;
    scheduled_date: string;
    priority: string;
    estimated_duration: number;
    cost: number;
  }>;
};

export default function MaintenanceSchedule() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Schedule | null>(null);

  const load = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      setError(null);
      const res = await serviceService.getMaintenanceSchedule(days);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load maintenance schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) return null;

  const dates = Object.keys(data?.services_by_date || {}).sort();

  return (
    <ComponentCard title="Upcoming Maintenance Schedule (Admin)">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {data ? `${data.total_upcoming_services} upcoming service(s) in next ${data.period_days} days` : "Select period to view schedule"}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(Math.min(Math.max(Number(e.target.value || 1), 1), 365))}
            className="w-28 border border-gray-300 dark:border-white/10 rounded px-2 py-1 bg-white dark:bg-transparent"
          />
          <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {dates.length === 0 && !loading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">No upcoming services found.</div>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => (
            <div key={date} className="rounded-lg border border-gray-200 dark:border-white/[0.05] overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 dark:bg-white/[0.03] text-sm font-semibold">
                {new Date(date).toLocaleDateString()}
              </div>
              <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                {(data?.services_by_date[date] || []).map((item) => (
                  <div key={item.service_id} className="px-4 py-3 text-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium">#{item.service_id} • {item.service_type.replace(/_/g, ' ')}</div>
                      <div className="text-gray-600 dark:text-gray-400">Vehicle ID: {item.vehicle_id}{item.description ? ` — ${item.description}` : ''}</div>
                    </div>
                    <div className="text-right">
                      {item.priority && <div className="capitalize">Priority: {item.priority}</div>}
                      {typeof item.estimated_duration === 'number' && <div>{item.estimated_duration} min</div>}
                      {typeof item.cost === 'number' && <div>${'{'}item.cost{'}'}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ComponentCard>
  );
}


