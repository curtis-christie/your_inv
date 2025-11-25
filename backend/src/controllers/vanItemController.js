import mongoose from "mongoose";
import { VanItem } from "../models/vanItem.model.js";
import { StoreItem } from "../models/storeItem.model.js";

function generateSkuFromName(name) {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 12);

  const suffix = Math.floor(Math.random() * 900 + 100); // 3-digit
  return `${base || "ITEM"}-${suffix}`;
}

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

export async function createVanItem(req, res, next) {
  try {
    const { vanId } = req.params;

    if (!mongoose.isValidObjectId(vanId)) {
      return res.status(400).json({ message: "Invalid vanId" });
    }

    const { name, sku, quantity, threshold, unit } = req.body;

    // Validate
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Name is required" });
    }

    const qtyNum = Number(quantity);
    if (!Number.isFinite(qtyNum) || qtyNum < 0) {
      return res.status(400).json({ message: "Quantity must be a non-negative number" });
    }

    const thresholdNum = threshold === undefined || threshold === null ? 0 : Number(threshold);

    if (!Number.isFinite(thresholdNum) || thresholdNum < 0) {
      return res.status(400).json({ message: "Threshold must be a non-negative number" });
    }

    // 1. Find or create StoreItem
    let storeItem = null;

    if (sku) {
      storeItem = await StoreItem.findOne({ sku });
    }

    if (!storeItem) {
      const finalSku = sku || generateSkuFromName(name);

      storeItem = await StoreItem.create({
        sku: finalSku,
        name,
        unit: unit || "pcs",
        storeQty: 0,
        storeThreshold: 0,
        tags: [], // unused now
      });
    }

    // 2. Upsert the VanItem
    let vanItem = await VanItem.findOne({
      vanId,
      storeItemId: storeItem._id,
    });

    if (vanItem) {
      vanItem.quantity += qtyNum;
      vanItem.threshold = thresholdNum;
      if (unit) vanItem.unit = unit;

      await vanItem.save();
    } else {
      vanItem = await VanItem.create({
        vanId,
        storeItemId: storeItem._id,
        quantity: qtyNum,
        threshold: thresholdNum,
        unit: unit || storeItem.unit,
      });
    }

    // 3. Populate and respond
    const populated = await VanItem.findById(vanItem._id)
      .populate({ path: "storeItemId", select: "name sku unit" })
      .lean();

    const store = populated.storeItemId;

    const isLowStock = populated.threshold > 0 && populated.quantity <= populated.threshold;

    const responseItem = {
      id: populated._id,
      vanId: populated.vanId,
      quantity: populated.quantity,
      threshold: populated.threshold,
      unit: populated.unit || store.unit,
      storeItem: {
        id: store._id,
        name: store.name,
        sku: store.sku,
      },
      isLowStock,
      createdAt: populated.createdAt,
      updatedAt: populated.updatedAt,
    };

    res.status(201).json(responseItem);
  } catch (err) {
    next(err);
  }
}
