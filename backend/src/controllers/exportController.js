//yourInv/backend/src/controllers/exportController.js
import { VanItem } from "../models/vanItem.model.js";
import { StoreItem } from "../models/storeItem.model.js";
import mongoose from "mongoose";

export async function exportVanItemsCSV(req, res, next) {
  try {
    const { vanId } = req.params;
    const { lowStock } = req.query;

    if (!mongoose.isValidObjectId(vanId)) {
      return res.status(400).json({ message: "Invalid vanId" });
    }

    let items = await VanItem.find({ vanId })
      .populate({ path: "storeItemId", select: "name sku unit" })
      .lean();

    if (lowStock === "true") {
      items = items.filter((item) => item.threshold > 0 && item.quantity <= item.threshold);
    }

    // CSV headers
    const headers = ["Name", "SKU", "Quantity", "Threshold", "Unit", "LowStock"];

    // Build CSV rows
    const rows = items.map((item) => {
      const store = item.storeItemId;
      const isLow = item.threshold > 0 && item.quantity <= item.threshold;

      return [
        store?.name || "",
        store?.sku || "",
        item.quantity,
        item.threshold,
        item.unit || store?.unit || "pcs",
        isLow ? "YES" : "NO",
      ].join(",");
    });

    const csvText = [headers.join(","), ...rows].join("\n");

    // Set file name
    const timestamp = new Date().toISOString().split("T")[0];
    const fileName = `van_${vanId}_inventory_${timestamp}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(csvText);
  } catch (err) {
    next(err);
  }
}
