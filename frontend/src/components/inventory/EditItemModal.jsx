//yourInv/frontend/src/components/inventory/EditItemModal.jsx
export default function EditItemModal({
  isOpen,
  item, // the selected item (for display)
  form, // { name, sku, threshold, unit }
  onChange, // (e) => void
  onSubmit, // (e) => void
  onClose, // () => void
  saving = false,
  error = "",
}) {
  if (!isOpen || !item) return null;

  const store = item.storeItem || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Edit item</h3>
            <p className="text-xs text-text-muted mt-1">
              {store.name || "Unknown item"}{" "}
              {store.sku ? (
                <span className="font-mono text-[10px] text-text-muted">[{store.sku}]</span>
              ) : null}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded-lg bg-surface border border-white/10 text-xs text-text-muted hover:border-white/20"
            aria-label="Close edit modal"
          >
            ✕
          </button>
        </div>

        {error ? (
          <div className="mt-3 text-danger text-xs bg-danger/20 px-3 py-2 rounded-xl">{error}</div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-4 space-y-3 text-sm">
          <div className="space-y-1">
            <label className="block text-text-muted text-xs uppercase tracking-wide">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10
                        focus:outline-none focus:border-primary text-text-main"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-text-muted text-xs uppercase tracking-wide">SKU</label>
            <input
              name="sku"
              value={form.sku}
              onChange={onChange}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10
                        focus:outline-none focus:border-primary text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-text-muted text-xs uppercase tracking-wide">
                Threshold
              </label>
              <input
                type="number"
                min="0"
                name="threshold"
                value={form.threshold}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10
                          focus:outline-none focus:border-primary text-text-main"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-text-muted text-xs uppercase tracking-wide">Unit</label>
              <input
                name="unit"
                value={form.unit}
                onChange={onChange}
                placeholder="pcs"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10
                          focus:outline-none focus:border-primary text-text-main"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-surface border border-white/10 text-xs"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium
                        hover:bg-primary/90 disabled:opacity-60 active:scale-95 transition-transform"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
