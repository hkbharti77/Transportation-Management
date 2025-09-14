"use client";

import React, { useEffect, useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PartsInventoryStatus from "@/components/ui-elements/fleet-management/PartsInventoryStatus";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import { serviceService, PartCategory, CreatePartRequest, PartRecord, UpdatePartStockRequest, AddPartToServiceItem } from "@/services/serviceService";

export default function PartsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdPart, setCreatedPart] = useState<PartRecord | null>(null);
  const [parts, setParts] = useState<PartRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [adjustOpen, setAdjustOpen] = useState<boolean>(false);
  const [adjustTarget, setAdjustTarget] = useState<PartRecord | null>(null);
  const [adjustSubmitting, setAdjustSubmitting] = useState<boolean>(false);
  const [adjustForm, setAdjustForm] = useState<UpdatePartStockRequest>({ quantity_change: 0, reason: "", notes: "" });
  const [viewOpen, setViewOpen] = useState<boolean>(false);
  const [viewTarget, setViewTarget] = useState<PartRecord | null>(null);
  const [viewLoading, setViewLoading] = useState<boolean>(false);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [addSubmitting, setAddSubmitting] = useState<boolean>(false);
  const [addServiceId, setAddServiceId] = useState<number>(0);
  const [addItems, setAddItems] = useState<Array<{ part_id: number | ""; quantity_used: number; unit_cost_at_time: number; notes: string }>>([
    { part_id: "", quantity_used: 1, unit_cost_at_time: 0, notes: "" },
  ]);

  const categories: PartCategory[] = useMemo(
    () => [
      "engine",
      "transmission",
      "brakes",
      "tires",
      "electrical",
      "body",
      "interior",
      "fluids",
      "filters",
      "other",
    ],
    []
  );

  const [form, setForm] = useState<CreatePartRequest>({
    part_number: "",
    name: "",
    category: "engine",
    description: "",
    manufacturer: "",
    supplier: "",
    unit_cost: 0,
    current_stock: 0,
    min_stock_level: 0,
    max_stock_level: 0,
    location: "",
  });

  // Load parts on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await serviceService.getParts(0, 100);
        setParts(data);
      } catch (e) {
        console.error("Failed to fetch parts", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["unit_cost", "current_stock", "min_stock_level", "max_stock_level"].includes(name)
        ? Number(value)
        : value,
    } as CreatePartRequest));
  };

  const handleOpen = () => {
    setError(null);
    setSuccess(null);
    setCreatedPart(null);
    setIsCreateOpen(true);
  };

  const openAdjust = (part: PartRecord) => {
    setAdjustTarget(part);
    setAdjustForm({ quantity_change: 0, reason: "", notes: "" });
    setError(null);
    setSuccess(null);
    setAdjustOpen(true);
  };

  const openView = async (part: PartRecord) => {
    setViewTarget(null);
    setViewOpen(true);
    setViewLoading(true);
    try {
      const full = part.id ? await serviceService.getPartById(part.id) : part;
      setViewTarget(full);
    } catch (e) {
      console.error("Failed to load part details", e);
    } finally {
      setViewLoading(false);
    }
  };

  const submitAdjust = async () => {
    if (!adjustTarget?.id) return;
    setAdjustSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (!adjustForm.reason || adjustForm.reason.trim().length === 0) {
        throw new Error("Reason is required");
      }
      const updated = await serviceService.updatePartStock(adjustTarget.id, adjustForm);
      setParts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSuccess("Stock updated successfully");
      setTimeout(() => setAdjustOpen(false), 600);
    } catch (e: unknown) {
      // Properly handle the error with type checking
      if (e instanceof Error) {
        setError(e.message || "Failed to update stock");
      } else {
        setError("Failed to update stock");
      }
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      // Ensure category is valid to avoid 422
      if (!categories.includes(form.category as PartCategory)) {
        throw new Error(
          "Invalid category. Choose one of: " + categories.join(", ")
        );
      }
      const res = await serviceService.createPart(form);
      setCreatedPart(res);
      setSuccess(`Part created (ID: ${res.id})`);
      // Close shortly after success
      setTimeout(() => setIsCreateOpen(false), 900);
    } catch (e: unknown) {
      // Properly handle the error with type checking
      if (e instanceof Error) {
        setError(e.message || "Failed to create part");
      } else {
        setError("Failed to create part");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">Parts Inventory</h2>
          <div className="flex items-center gap-2">
            <Button className="flex items-center gap-2" onClick={() => setAddOpen(true)}>
              Add Parts to Service
            </Button>
            <Button className="flex items-center gap-2" onClick={handleOpen}>
              <PlusIcon className="h-4 w-4" />
              Add New Part
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <PartsInventoryStatus />
        </div>

        {createdPart ? (
          <ComponentCard title="Recently created">
            <div className="p-4 text-sm text-gray-700 dark:text-gray-300">
              Last created: <span className="font-medium">{createdPart.name}</span> (#{createdPart.id}) — {createdPart.category}
            </div>
          </ComponentCard>
        ) : null}

        <ComponentCard title="Parts Inventory">
          <div className="p-4 overflow-x-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Parts</h3>
              {loading && <span className="text-sm text-gray-500">Loading…</span>}
            </div>
            {parts.length === 0 && !loading ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No parts found.</div>
            ) : (
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/[0.08] text-xs uppercase text-gray-500 dark:text-gray-400">
                    <th className="py-2 pr-4">Part #</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Stock</th>
                    <th className="py-2 pr-4">Unit Cost</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((p) => (
                    <tr key={p.id || p.part_number} className="border-b border-gray-100 dark:border-white/[0.06] text-sm">
                      <td className="py-2 pr-4 font-medium text-gray-800 dark:text-gray-200">{p.part_number}</td>
                      <td className="py-2 pr-4">{p.name}</td>
                      <td className="py-2 pr-4">{p.category}</td>
                      <td className="py-2 pr-4">{p.current_stock}</td>
                      <td className="py-2 pr-4">{p.unit_cost}</td>
                      <td className="py-2 pr-4 capitalize">
                        <div className="flex items-center gap-3">
                          <span>{p.status || 'available'}</span>
                          {p.id && (
                            <Button size="sm" variant="outline" onClick={() => openAdjust(p)}>Adjust</Button>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <Button size="sm" onClick={() => openView(p)}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ComponentCard>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => !isSubmitting && setIsCreateOpen(false)} className="max-w-2xl mx-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Part</h3>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="part_number">Part Number</Label>
              <input id="part_number" name="part_number" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={form.part_number} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <input id="name" name="name" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={form.category} onChange={handleChange}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <input id="manufacturer" name="manufacturer" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={form.manufacturer} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <input id="supplier" name="supplier" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={form.supplier} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="unit_cost">Unit Cost</Label>
              <input id="unit_cost" name="unit_cost" type="number" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={form.unit_cost} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="current_stock">Current Stock</Label>
              <input id="current_stock" name="current_stock" type="number" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={form.current_stock} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="min_stock_level">Min Stock Level</Label>
              <input id="min_stock_level" name="min_stock_level" type="number" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={form.min_stock_level} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="max_stock_level">Max Stock Level</Label>
              <input id="max_stock_level" name="max_stock_level" type="number" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={form.max_stock_level} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <input id="location" name="location" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={form.location} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" name="description" rows={3} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={form.description} onChange={handleChange} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Part"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} className="max-w-2xl mx-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Part Details</h3>
          {viewLoading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading…</div>
          ) : viewTarget ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">ID:</span> {viewTarget.id}</div>
              <div><span className="font-medium">Part #:</span> {viewTarget.part_number}</div>
              <div><span className="font-medium">Name:</span> {viewTarget.name}</div>
              <div><span className="font-medium">Category:</span> {viewTarget.category}</div>
              <div className="md:col-span-2"><span className="font-medium">Description:</span> {viewTarget.description || '-'}</div>
              <div><span className="font-medium">Manufacturer:</span> {viewTarget.manufacturer || '-'}</div>
              <div><span className="font-medium">Supplier:</span> {viewTarget.supplier || '-'}</div>
              <div><span className="font-medium">Unit Cost:</span> {viewTarget.unit_cost}</div>
              <div><span className="font-medium">Current Stock:</span> {viewTarget.current_stock}</div>
              <div><span className="font-medium">Min Stock:</span> {viewTarget.min_stock_level}</div>
              <div><span className="font-medium">Max Stock:</span> {viewTarget.max_stock_level}</div>
              <div className="md:col-span-2"><span className="font-medium">Location:</span> {viewTarget.location || '-'}</div>
              <div><span className="font-medium">Status:</span> {viewTarget.status}</div>
              <div><span className="font-medium">Active:</span> {String(viewTarget.is_active)}</div>
              <div><span className="font-medium">Created At:</span> {viewTarget.created_at}</div>
              <div><span className="font-medium">Updated At:</span> {viewTarget.updated_at || '-'}</div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-500">No data</div>
          )}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button variant="outline" type="button" onClick={() => setViewOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal isOpen={adjustOpen} onClose={() => !adjustSubmitting && setAdjustOpen(false)} className="max-w-md mx-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Adjust Stock{adjustTarget ? ` — ${adjustTarget.name}` : ""}</h3>
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
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="quantity_change">Quantity Change</Label>
              <input id="quantity_change" name="quantity_change" type="number" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={adjustForm.quantity_change} onChange={(e) => setAdjustForm({ ...adjustForm, quantity_change: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <input id="reason" name="reason" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea id="notes" name="notes" rows={3} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={adjustForm.notes} onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button variant="outline" type="button" onClick={() => setAdjustOpen(false)} disabled={adjustSubmitting}>Cancel</Button>
            <Button type="button" onClick={submitAdjust} disabled={adjustSubmitting}>{adjustSubmitting ? "Updating..." : "Update Stock"}</Button>
          </div>
        </div>
      </Modal>

      {/* Add Parts to Service Modal */}
      <Modal isOpen={addOpen} onClose={() => !addSubmitting && setAddOpen(false)} className="max-w-3xl mx-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Parts to Service</h3>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">{error}</div>
          )}
          {success && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-200">{success}</div>
          )}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <Label htmlFor="service_id">Service ID</Label>
              <input id="service_id" type="number" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={addServiceId} onChange={(e) => setAddServiceId(Number(e.target.value))} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/[0.08] text-xs uppercase text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-4">Part</th>
                  <th className="py-2 pr-4">Quantity</th>
                  <th className="py-2 pr-4">Unit Cost</th>
                  <th className="py-2 pr-4">Notes</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {addItems.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-white/[0.06] text-sm">
                    <td className="py-2 pr-4">
                      <select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200"
                        value={row.part_id}
                        onChange={(e) => {
                          const partId = e.target.value ? Number(e.target.value) : "";
                          setAddItems((prev) => prev.map((r, i) => i === idx ? {
                            ...r,
                            part_id: partId,
                            unit_cost_at_time: typeof partId === 'number' ? (parts.find(p => p.id === partId)?.unit_cost || 0) : 0,
                          } : r));
                        }}>
                        <option value="">Select part…</option>
                        {parts.map((p) => (
                          <option key={p.id || p.part_number} value={p.id || ""}>{p.name} {p.part_number ? `(#${p.part_number})` : ""}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-4">
                      <input type="number" min={1} className="w-24 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={row.quantity_used}
                        onChange={(e) => setAddItems((prev) => prev.map((r, i) => i === idx ? { ...r, quantity_used: Number(e.target.value) } : r))} />
                    </td>
                    <td className="py-2 pr-4">
                      <input type="number" className="w-28 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={row.unit_cost_at_time}
                        onChange={(e) => setAddItems((prev) => prev.map((r, i) => i === idx ? { ...r, unit_cost_at_time: Number(e.target.value) } : r))} />
                    </td>
                    <td className="py-2 pr-4">
                      <input className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-200" value={row.notes}
                        onChange={(e) => setAddItems((prev) => prev.map((r, i) => i === idx ? { ...r, notes: e.target.value } : r))} />
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setAddItems((prev) => prev.filter((_, i) => i !== idx))}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => setAddItems((prev) => [...prev, { part_id: "", quantity_used: 1, unit_cost_at_time: 0, notes: "" }])}>Add Row</Button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button variant="outline" type="button" onClick={() => setAddOpen(false)} disabled={addSubmitting}>Cancel</Button>
            <Button type="button" disabled={addSubmitting} onClick={async () => {
              setError(null);
              setSuccess(null);
              try {
                if (!addServiceId || addServiceId <= 0) throw new Error("Valid service ID is required");
                const prepared: AddPartToServiceItem[] = addItems
                  .filter((r) => typeof r.part_id === 'number')
                  .map((r) => ({
                    service_id: addServiceId,
                    part_id: r.part_id as number,
                    quantity_used: r.quantity_used,
                    unit_cost_at_time: r.unit_cost_at_time,
                    notes: r.notes,
                  }));
                if (prepared.length === 0) throw new Error("Add at least one valid part row");
                setAddSubmitting(true);
                const res = await serviceService.addPartsToService(addServiceId, prepared);
                setSuccess(`${res.message} (Total: ${res.total_cost})`);
                // Optionally refresh parts to reflect stock changes
                try {
                  const refreshed = await serviceService.getParts(0, 100);
                  setParts(refreshed);
                } catch {}
                setTimeout(() => setAddOpen(false), 900);
              } catch (e: unknown) {
                // Properly handle the error with type checking
                if (e instanceof Error) {
                  setError(e.message || "Failed to add parts to service");
                } else {
                  setError("Failed to add parts to service");
                }
              } finally {
                setAddSubmitting(false);
              }
            }}>{addSubmitting ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
