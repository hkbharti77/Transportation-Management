"use client";

import React, { useEffect, useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useAuth } from "@/context/AuthContext";
import { serviceService } from "@/services/serviceService";

type PartsStatus = {
  summary: { total_parts: number; total_inventory_value: number };
  by_status: Array<{ status: string; count: number; value: number }>;
  by_category: Array<{ category: string; count: number; total_stock: number }>;
  low_stock_alerts: Array<{
    part_id?: number;
    part_number?: string;
    name?: string;
    current_stock?: number;
    min_stock_level?: number;
    category?: string;
  }>;
};

const currency = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);

export default function PartsInventoryStatus() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PartsStatus | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isAdmin) return;
      try {
        setLoading(true);
        setError(null);
        const res = await serviceService.getPartsInventoryStatus();
        setData(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load parts inventory status');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <ComponentCard title="Parts Inventory Status (Admin)">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Parts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.summary.total_parts ?? (loading ? '…' : 0)}</p>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Inventory Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data ? currency(data.summary.total_inventory_value) : (loading ? '…' : currency(0))}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm font-semibold mb-3">By Status</p>
          <div className="space-y-2">
            {(data?.by_status || []).map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-700 dark:text-gray-300">{s.status.replace(/_/g, ' ')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{s.count} ({currency(s.value)})</span>
              </div>
            ))}
            {!data && !loading && <p className="text-gray-500 dark:text-gray-400">No data</p>}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <p className="text-sm font-semibold mb-3">By Category</p>
          <div className="space-y-2">
            {(data?.by_category || []).map((c) => (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-700 dark:text-gray-300">{c.category}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{c.count} parts • {c.total_stock} in stock</span>
              </div>
            ))}
            {!data && !loading && <p className="text-gray-500 dark:text-gray-400">No data</p>}
          </div>
        </div>
      </div>

      {data?.low_stock_alerts?.length ? (
        <div className="mt-6 p-4 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-900/40 dark:bg-yellow-900/10">
          <p className="text-sm font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Low Stock Alerts</p>
          <ul className="list-disc pl-5 text-sm text-yellow-900 dark:text-yellow-100 space-y-1">
            {data.low_stock_alerts.map((a, i) => (
              <li key={i}>
                {(a.name || a.part_number || `Part ${a.part_id}`) + ` — ${a.current_stock ?? 0}/${a.min_stock_level ?? 0} (${a.category || '-'})`}
              </li>)
            )}
          </ul>
        </div>
      ) : null}
    </ComponentCard>
  );
}


