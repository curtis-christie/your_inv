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

  const [form, setForm] = useState({
    name: "",
    sku: "",
    quantity: "0",
    threshold: "0",
    unit: "",
  });

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

  const filteredItems = items.filter((item) => {
    const store = item.storeItem || {};
    const matchesSearch =
      store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const passesLowStock = showLowStock ? item.isLowStock : true;

    return matchesSearch && passesLowStock;
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
      {!loading && !error && <InventoryTable items={filteredItems} />}
    </div>
  );
}
