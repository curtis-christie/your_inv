// src/pages/VanInventoryPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import InventoryTable from "../components/inventory/InventoryTable.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function VanInventoryPage() {
  const { vanId } = useParams();
  const [items, setItems] = useState([]);
  const [vanName, setVanName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState("");
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState("");
  const [logsSearch, setLogsSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    quantity: "0",
    threshold: "0",
    unit: "",
  });

  function handleAdjustClick(item, presetDelta) {
    setAdjustingItem(item);
    setAdjustDelta(presetDelta);
    setAdjustNote("");
    setAdjustError("");
  }

  async function handleSubmitAdjust(e) {
    e.preventDefault();
    if (!adjustingItem) return;

    setAdjustLoading(true);
    setAdjustError("");

    try {
      const payload = {
        delta: Number(adjustDelta),
        note: adjustNote,
      };

      const res = await axios.post(`${API_BASE_URL}/items/${adjustingItem.id}/adjust`, payload);

      const updatedItem = res.data;

      // Update the items array in-place
      setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));

      // Close dialog
      setAdjustingItem(null);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to adjust quantity.";
      setAdjustError(msg);
    } finally {
      setAdjustLoading(false);
    }
  }

  function handleCloseAdjust() {
    setAdjustingItem(null);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const payload = {
        name: form.name,
        sku: form.sku || undefined,
        quantity: Number(form.quantity),
        threshold: Number(form.threshold),
        unit: form.unit || undefined,
      };

      await axios.post(`${API_BASE_URL}/vans/${vanId}/items`, payload);

      // Clear form after success
      setForm({
        name: "",
        sku: "",
        quantity: "0",
        threshold: "0",
        unit: "",
      });

      // Reload items
      const res = await axios.get(`${API_BASE_URL}/vans/${vanId}/items`);
      setItems(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create item.";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  }

  // Fetch van list to show the van name
  useEffect(() => {
    async function loadVan() {
      try {
        const res = await axios.get(`${API_BASE_URL}/vans`);
        const van = res.data.find((v) => v._id === vanId);
        setVanName(van?.name || "Unknown Van");
      } catch {
        setVanName("Unknown Van");
      }
    }

    loadVan();
  }, [vanId]);

  // Fetch items for this van
  useEffect(() => {
    async function loadItems() {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_BASE_URL}/vans/${vanId}/items`);
        setItems(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [vanId]);

  // Fetch Logs for this van
  useEffect(() => {
    async function loadLogs() {
      try {
        setLogsLoading(true);
        setLogsError("");

        const res = await axios.get(`${API_BASE_URL}/vans/${vanId}/logs`, {
          params: { limit: 50 },
        });

        setLogs(res.data);
      } catch (err) {
        console.error(err);
        setLogsError("Failed to load activity log.");
      } finally {
        setLogsLoading(false);
      }
    }

    loadLogs();
  }, [vanId]);

  const filteredItems = items.filter((item) => {
    const store = item.storeItem || {};
    const matchesSearch =
      store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const passesLowStock = showLowStock ? item.isLowStock : true;

    return matchesSearch && passesLowStock;
  });

  const filteredLogs = logs.filter((log) => {
    if (!logsSearch) return true;
    const term = logsSearch.toLowerCase();

    const name = (log.storeItem?.name || "").toLowerCase();
    const sku = String(log.storeItem?.sku || "").toLowerCase();
    const note = (log.note || "").toLowerCase();

    return name.includes(term) || sku.includes(term) || note.includes(term);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">{vanName}</h2>
        <p className="text-sm text-text-muted">Inventory overview for this van</p>
      </div>
      {loading && <div className="text-text-muted">Loading inventory…</div>}
      {error && <div className="text-danger text-sm bg-danger/20 p-3 rounded-xl">{error}</div>}

      {/* FORM */}
      <div className="bg-card/60 border border-white/5 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-semibold">Add item to van</h3>

        {createError && (
          <div className="text-danger text-xs bg-danger/20 px-3 py-2 rounded-xl">{createError}</div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {/* NAME */}
          <div className="space-y-1">
            <label className="block text-text-muted text-xs uppercase">Name *</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 focus:outline-none focus:border-primary text-text-main"
            />
          </div>

          {/* SKU */}
          <div className="space-y-1">
            <label className="block text-text-muted text-xs uppercase">SKU</label>
            <input
              type="text"
              name="sku"
              value={form.sku}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 focus:outline-none focus:border-primary text-text-main"
            />
          </div>

          {/* QUANTITY */}
          <div className="space-y-1">
            <label className="block text-text-muted text-xs uppercase">Quantity *</label>
            <input
              type="number"
              min="0"
              name="quantity"
              value={form.quantity}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 focus:outline-none focus:border-primary text-text-main"
            />
          </div>

          {/* THRESHOLD */}
          <div className="space-y-1">
            <label className="block text-text-muted text-xs uppercase">Threshold</label>
            <input
              type="number"
              min="0"
              name="threshold"
              value={form.threshold}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 focus:outline-none focus:border-primary text-text-main"
            />
          </div>

          {/* UNIT */}
          <div className="space-y-1">
            <label className="block text-text-muted text-xs uppercase">Unit</label>
            <input
              type="text"
              name="unit"
              value={form.unit}
              onChange={handleFormChange}
              placeholder="pcs, box, ft"
              className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 focus:outline-none focus:border-primary text-text-main"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {creating ? "Adding…" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or SKU…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-xl bg-surface border border-white/10 text-sm focus:outline-none focus:border-primary text-text-main placeholder:text-text-muted flex-1"
        />

        {/* Low stock toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="text-sm text-text-muted">Low stock only</span>
        </label>
      </div>
      {!loading && !error && (
        <InventoryTable items={filteredItems} onAdjustClick={handleAdjustClick} />
      )}

      {/* Log History */}
      <div className="space-y-3 mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Recent activity</h3>
          <input
            type="text"
            value={logsSearch}
            onChange={(e) => setLogsSearch(e.target.value)}
            placeholder="Search logs (name, SKU, note)…"
            className="px-3 py-1.5 rounded-xl bg-surface border border-white/10 text-xs focus:outline-none focus:border-primary text-text-main placeholder:text-text-muted max-w-xs"
          />
        </div>

        <div className="bg-card/60 border border-white/5 rounded-2xl p-4 min-h-20">
          {logsLoading && <p className="text-xs text-text-muted">Loading activity…</p>}

          {logsError && (
            <p className="text-xs text-danger bg-danger/20 px-2 py-1 rounded-lg inline-block">
              {logsError}
            </p>
          )}

          {!logsLoading && !logsError && filteredLogs.length === 0 && (
            <p className="text-xs text-text-muted">No activity logged yet.</p>
          )}

          {!logsLoading && !logsError && filteredLogs.length > 0 && (
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {filteredLogs.map((log) => {
                const store = log.storeItem || {};
                const isIncrease = log.delta > 0;
                const deltaSign = isIncrease ? "+" : "";
                const deltaColor = isIncrease ? "text-success" : "text-danger";

                const date = new Date(log.createdAt);
                const formattedTime = date.toLocaleString();

                return (
                  <li
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-2 last:border-b-0"
                  >
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className={deltaColor}>
                          {deltaSign}
                          {log.delta}
                        </span>
                        <span className="text-text-main">{store.name || "Unknown item"}</span>
                        {store.sku && (
                          <span className="text-text-muted font-mono text-[10px]">
                            [{store.sku}]
                          </span>
                        )}
                      </div>
                      {log.note && (
                        <div className="text-[11px] text-text-muted mt-1">{log.note}</div>
                      )}
                    </div>

                    <div className="text-right text-[10px] text-text-muted">
                      <div>Qty: {log.resultingQty}</div>
                      <div>{formattedTime}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {adjustingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-card border border-white/10 rounded-2xl p-4 w-full max-w-md">
            <h3 className="text-sm font-semibold mb-2">Adjust quantity</h3>

            <p className="text-xs text-text-muted mb-3">
              {adjustingItem.storeItem?.name} (
              <span className="font-mono">{adjustingItem.storeItem?.sku}</span>)
            </p>

            <form onSubmit={handleSubmitAdjust} className="space-y-3 text-sm">
              {adjustError && (
                <div className="text-danger text-xs bg-danger/20 px-3 py-2 rounded-xl">
                  {adjustError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-text-muted text-xs uppercase">
                  Delta (e.g. -1, +1)
                </label>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 focus:outline-none focus:border-primary text-text-main"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-text-muted text-xs uppercase">Note (optional)</label>
                <textarea
                  rows={3}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 focus:outline-none focus:border-primary text-text-main resize-none"
                  placeholder="Installed at customer site, returned to store, etc."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAdjust}
                  className="px-3 py-2 rounded-xl bg-surface border border-white/10 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-60 active:scale-95 transition-transform"
                >
                  {adjustLoading ? "Saving…" : "Apply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
