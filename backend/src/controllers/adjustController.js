// src/controllers/adjustController.js
import mongoose from "mongoose";
import { VanItem } from "../models/vanItem.model.js";
import { StoreItem } from "../models/storeItem.model.js";
import { Log } from "../models/log.model.js";

export async function adjustVanItem(req, res, next) {
  try {
    const { vanItemId } = req.params;

    if (!mongoose.isValidObjectId(vanItemId)) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const { delta, note } = req.body;

    const deltaNum = Number(delta);
    if (!Number.isFinite(deltaNum) || deltaNum === 0) {
      return res.status(400).json({ message: "Delta must be a non-zero number" });
    }

    const vanItem = await VanItem.findById(vanItemId);
    if (!vanItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const newQty = vanItem.quantity + deltaNum;
    if (newQty < 0) {
      return res.status(400).json({ message: "Resulting quantity cannot be negative" });
    }

    // Update quantity
    vanItem.quantity = newQty;
    await vanItem.save();

    // Fetch store item for logging + response
    const storeItem = await StoreItem.findById(vanItem.storeItemId).select("name sku unit");

    // Create log entry
    await Log.create({
      vanId: vanItem.vanId,
      vanItemId: vanItem._id,
      storeItemId: vanItem.storeItemId,
      delta: deltaNum,
      resultingQty: newQty,
      actor: "van-user",
      note: note || "",
    });

    // Compute low stock
    const isLowStock = vanItem.threshold > 0 && vanItem.quantity <= vanItem.threshold;

    // Respond with updated item in same shape as list endpoint
    const responseItem = {
      id: vanItem._id,
      vanId: vanItem.vanId,
      quantity: vanItem.quantity,
      threshold: vanItem.threshold,
      unit: vanItem.unit || storeItem?.unit || "pcs",
      storeItem: storeItem
        ? {
            id: storeItem._id,
            name: storeItem.name,
            sku: storeItem.sku,
          }
        : null,
      isLowStock,
      createdAt: vanItem.createdAt,
      updatedAt: vanItem.updatedAt,
    };

    res.json(responseItem);
  } catch (err) {
    next(err);
  }
}
