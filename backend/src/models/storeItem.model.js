import mongoose from "mongoose";

const storeItemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      trim: true,
      default: "pcs",
    },
    storeQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    storeThreshold: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const StoreItem = mongoose.model("StoreItem", storeItemSchema);
