// src/controllers/logController.js
import mongoose from "mongoose";
import { Log } from "../models/log.model.js";
import { StoreItem } from "../models/storeItem.model.js";

export async function getVanLogs(req, res, next) {
  try {
    const { vanId } = req.params;
    const { limit = 50, q } = req.query;

    if (!mongoose.isValidObjectId(vanId)) {
      return res.status(400).json({ message: "Invalid vanId" });
    }

    const limitNum = Math.min(Number(limit) || 50, 200);

    // Base query: logs for this van
    const query = { vanId };

    // We will keep search filtering simple: do it in memory after populate
    let logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .populate({ path: "storeItemId", select: "name sku" })
      .lean();

    if (q && typeof q === "string" && q.trim() !== "") {
      const term = q.toLowerCase();
      logs = logs.filter((log) => {
        const store = log.storeItemId || {};
        const name = (store.name || "").toLowerCase();
        const sku = String(store.sku || "").toLowerCase();
        const note = (log.note || "").toLowerCase();
        return name.includes(term) || sku.includes(term) || note.includes(term);
      });
    }

    const transformed = logs.map((log) => {
      const store = log.storeItemId || {};
      return {
        id: log._id,
        vanId: log.vanId,
        vanItemId: log.vanItemId,
        storeItem: store
          ? {
              id: store._id,
              name: store.name,
              sku: store.sku,
            }
          : null,
        delta: log.delta,
        resultingQty: log.resultingQty,
        actor: log.actor,
        note: log.note,
        createdAt: log.createdAt,
      };
    });

    res.json(transformed);
  } catch (err) {
    next(err);
  }
}
