// frontend\src\components\inventory\InventoryTable.jsx
export default function InventoryTable({ items, onAdjustClick }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-card p-4 rounded-2xl border border-white/5 text-text-muted">
        No items on this van yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead className="bg-surface/60 text-text-muted uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">SKU</th>
            <th className="px-4 py-3 text-left">Qty</th>
            <th className="px-4 py-3 text-left">Unit</th>
            <th className="px-4 py-3 text-left">Bin</th>
            <th className="px-4 py-3 text-left">Tags</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const store = item.storeItem || {};
            const isLow = item.isLowStock;

            return (
              <tr key={item.id} className="hover:bg-surface/40 transition border-b border-white/5">
                <td className="px-4 py-3">{store.name}</td>
                <td className="px-4 py-3 text-text-muted">{store.sku}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{item.unit}</td>
                <td className="px-4 py-3">{item.bin || "-"}</td>
                <td className="px-4 py-3 text-text-muted">
                  {item.tags?.length > 0 ? item.tags.join(", ") : "-"}
                </td>
                <td className="px-4 py-3">
                  {isLow ? (
                    <span className="text-warning font-medium bg-warning/20 px-2 py-1 rounded-xl text-xs">
                      Low
                    </span>
                  ) : (
                    <span className="text-success font-medium bg-success/20 px-2 py-1 rounded-xl text-xs">
                      OK
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onAdjustClick(item, -1)}
                      className="px-2 py-1 rounded-lg text-xs bg-surface border border-white/10 hover:border-danger/70 hover:text-danger"
                    >
                      −1
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustClick(item, 1)}
                      className="px-2 py-1 rounded-lg text-xs bg-surface border border-white/10 hover:border-success/70 hover:text-success"
                    >
                      +1
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
