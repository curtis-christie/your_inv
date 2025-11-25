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

    const {
      name,
      sku,
      quantity,
      threshold,
      unit,
      bin,
      tags, // can be array or comma-separated string on frontend
    } = req.body;

    // Basic validation
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

    // Normalize tags: accept array or comma-separated string
    let normalizedTags = [];
    if (Array.isArray(tags)) {
      normalizedTags = tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof tags === "string") {
      normalizedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    // 1) Find or create StoreItem
    let storeItem;

    if (sku) {
      storeItem = await StoreItem.findOne({ sku });
    }

    if (!storeItem) {
      const finalSku = sku || generateSkuFromName(name);

      storeItem = await StoreItem.create({
        sku: finalSku,
        name,
        unit: unit || "pcs",
        tags: normalizedTags,
        storeQty: 0,
        storeThreshold: 0,
      });
    }

    // 2) Find existing VanItem for this van + store item (upsert behavior)
    let vanItem = await VanItem.findOne({
      vanId,
      storeItemId: storeItem._id,
    });

    if (vanItem) {
      vanItem.quantity += qtyNum;
      if (threshold !== undefined && threshold !== null) {
        vanItem.threshold = thresholdNum;
      }
      if (unit) vanItem.unit = unit;
      if (bin) vanItem.bin = bin;
      if (normalizedTags.length > 0) vanItem.tags = normalizedTags;

      await vanItem.save();
    } else {
      vanItem = await VanItem.create({
        vanId,
        storeItemId: storeItem._id,
        quantity: qtyNum,
        threshold: thresholdNum,
        unit: unit || storeItem.unit,
        bin: bin || "",
        tags: normalizedTags.length > 0 ? normalizedTags : storeItem.tags,
      });
    }

    // 3) Populate and transform to same shape as getVanItems
    const populated = await vanItem
      .populate({ path: "storeItemId", select: "name sku unit tags" })
      .execPopulate?.(); // older mongoose
    const doc = populated || vanItem;

    const store = doc.storeItemId || {};
    const isLowStock =
      typeof doc.threshold === "number" && doc.threshold > 0 && doc.quantity <= doc.threshold;

    const responseItem = {
      id: doc._id,
      vanId: doc.vanId,
      quantity: doc.quantity,
      threshold: doc.threshold,
      unit: doc.unit || store.unit || "pcs",
      bin: doc.bin || "",
      tags: doc.tags && doc.tags.length > 0 ? doc.tags : store.tags || [],
      storeItem: {
        id: store._id,
        name: store.name,
        sku: store.sku,
      },
      isLowStock,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    res.status(201).json(responseItem);
  } catch (err) {
    next(err);
  }
}
