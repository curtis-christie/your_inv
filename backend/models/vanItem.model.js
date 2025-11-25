// src/models/vanItem.model.js
import mongoose from "mongoose";

const vanItemSchema = new mongoose.Schema(
  {
    vanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Van",
      required: true,
      index: true,
    },
    storeItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreItem",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    threshold: {
      type: Number,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optionally, enforce one van+storeItem combo per document
vanItemSchema.index({ vanId: 1, storeItemId: 1 }, { unique: true });

export const VanItem = mongoose.model("VanItem", vanItemSchema);
