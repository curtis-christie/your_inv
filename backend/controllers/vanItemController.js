import mongoose from "mongoose";
import { VanItem } from "../models/vanItem.model.js";

export async function getVanItems(req, res, next) {
  try {
    const { vanId } = req.params;

    if (!mongoose.isValidObjectId(vanId)) {
      return res.status(400).json({ message: "Invalid vanId" });
    }

    const items = await VanItem.find({ vanId })
      .populate({
        path: "storeItemId",
        select: "name sku unit",
      })
      .sort({ "storeItemId.name": 1 })
      .lean();

    const transformed = items.map((item) => {
      const storeItem = item.storeItemId || {};
      const isLowStock =
        typeof item.threshold === "number" && item.threshold > 0 && item.quantity <= item.threshold;

      return {
        id: item._id,
        vanId: item.vanId,
        quantity: item.quantity,
        threshold: item.threshold,
        unit: item.unit || storeItem.unit || "pcs",
        storeItem: {
          id: storeItem._id,
          name: storeItem.name,
          sku: storeItem.sku,
        },
        isLowStock,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    res.json(transformed);
  } catch (err) {
    next(err);
  }
}
