"use client";

import React, { useEffect, useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import { serviceService } from "@/services/serviceService";

type SummaryResponse = {
  period: { start_date: string; end_date: string };
  summary: { total_services: number; total_cost: number; average_duration_minutes: number };
  by_status: Array<{ status: string; count: number }>;
  by_type: Array<{ type: string; count: number }>;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);

export default function ServiceSummary() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [range, setRange] = useState<"7" | "30" | "90">("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SummaryResponse | null>(null);

  const { startISO, endISO } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    const days = range === "7" ? 7 : range === "90" ? 90 : 30;
    start.setDate(end.getDate() - days);
    return { startISO: start.toISOString(), endISO: end.toISOString() };
  }, [range]);

  const load = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      setError(null);
      const res = await serviceService.getServiceSummary(startISO, endISO);
      setData(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load service summary";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, startISO, endISO]);

  if (!isAdmin) return null;

  return (
    <ComponentCard title="Service Summary (Admin)">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {data ? (
            <span>
              Period: {new Date(data.period.start_date).toLocaleDateString()} – {" "}
              {new Date(data.period.end_date).toLocaleDateString()}
            </span>
          ) : (
            <span>Select a range to view summary</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="border border-gray-300 dark:border-white/10 rounded px-2 py-1 bg-white dark:bg-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.summary.total_services ?? (loading ? "…" : 0)}</p>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data ? formatCurrency(data.summary.total_cost) : loading ? "…" : formatCurrency(0)}</p>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Duration</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.summary.average_duration_minutes ?? (loading ? "…" : 0)} min</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm font-semibold mb-3">By Status</p>
          <div className="space-y-2">
            {(data?.by_status || []).map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-700 dark:text-gray-300">{s.status.replace(/_/g, " ")}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{s.count}</span>
              </div>
            ))}
            {!data && !loading && (
              <p className="text-gray-500 dark:text-gray-400">No data</p>
            )}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm font-semibold mb-3">By Type</p>
          <div className="space-y-2">
            {(data?.by_type || []).map((t) => (
              <div key={t.type} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-700 dark:text-gray-300">{t.type.replace(/_/g, " ")}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{t.count}</span>
              </div>
            ))}
            {!data && !loading && (
              <p className="text-gray-500 dark:text-gray-400">No data</p>
            )}
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}


