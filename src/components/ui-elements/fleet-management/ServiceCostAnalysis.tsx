"use client";

import React, { useEffect, useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import { serviceService } from "@/services/serviceService";

type GroupBy = 'month' | 'week' | 'day' | 'vehicle' | 'service_type';

type CostAnalysis = {
  period: { start_date: string; end_date: string };
  group_by: string;
  total_cost: number;
  total_services: number;
  cost_breakdown: Array<{
    period?: string;
    vehicle_id?: number;
    service_type?: string;
    total_cost: number;
    service_count: number;
    average_cost: number;
  }>;
};

const currency = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);

export default function ServiceCostAnalysis() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [groupBy, setGroupBy] = useState<GroupBy>('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CostAnalysis | null>(null);

  const { startISO, endISO } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 3);
    return { startISO: start.toISOString(), endISO: end.toISOString() };
  }, []);

  const load = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      setError(null);
      const res = await serviceService.getServiceCostAnalysis({ startDate: startISO, endDate: endISO, groupBy });
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load cost analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <ComponentCard title="Service Cost Analysis (Admin)">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {data ? (
            <span>
              Period: {new Date(data.period.start_date).toLocaleDateString()} – {new Date(data.period.end_date).toLocaleDateString()} | Group by: {data.group_by}
            </span>
          ) : (
            <span>Select grouping to view analysis</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="border border-gray-300 dark:border-white/10 rounded px-2 py-1 bg-white dark:bg-transparent"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
            <option value="vehicle">Vehicle</option>
            <option value="service_type">Service Type</option>
          </select>
          <Button onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</Button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {data ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currency(data.total_cost)}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.total_services}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 dark:text-gray-400">
                  <th className="py-2 pr-4">Group</th>
                  <th className="py-2 pr-4">Total Cost</th>
                  <th className="py-2 pr-4">Service Count</th>
                  <th className="py-2 pr-4">Average Cost</th>
                </tr>
              </thead>
              <tbody>
                {data.cost_breakdown.map((row, idx) => {
                  const label = row.period || (row.vehicle_id != null ? `Vehicle ${row.vehicle_id}` : (row.service_type || '—'));
                  return (
                    <tr key={idx} className="border-t border-gray-100 dark:border-white/5">
                      <td className="py-2 pr-4">{label}</td>
                      <td className="py-2 pr-4">{currency(row.total_cost)}</td>
                      <td className="py-2 pr-4">{row.service_count}</td>
                      <td className="py-2 pr-4">{currency(row.average_cost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400">No data yet.</div>
      )}
    </ComponentCard>
  );
}


