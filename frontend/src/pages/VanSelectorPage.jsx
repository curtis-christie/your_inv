import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function VanSelectorPage() {
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchVans() {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_BASE_URL}/vans`);
        setVans(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load vans. Check if the backend is running.");
      } finally {
        setLoading(false);
      }
    }

    fetchVans();
  }, []);

  function handleSelectVan(vanId) {
    navigate(`/van/${vanId}`);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">Select a van</h2>
      <p className="text-sm text-textMuted mb-4">Choose a van to view and manage its inventory.</p>

      <Card className="p-4">
        {loading && <p className="text-sm text-textMuted">Loading vans...</p>}

        {error && <p className="text-sm text-danger mb-3">{error}</p>}

        {!loading && !error && vans.length === 0 && (
          <p className="text-sm text-textMuted">No vans found. Try seeding the backend first.</p>
        )}

        {!loading && vans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vans.map((van) => (
              <button
                key={van._id}
                onClick={() => handleSelectVan(van._id)}
                className="text-left bg-surface/80 border border-white/5 rounded-2xl px-4 py-3 hover:border-primary/60 hover:bg-surface transition-colors"
              >
                <div className="text-sm font-medium">{van.name}</div>
                {van.code && <div className="text-xs text-textMuted mt-1">{van.code}</div>}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
