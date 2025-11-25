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
