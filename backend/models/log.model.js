import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    vanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Van",
      required: true,
      index: true,
    },
    vanItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VanItem",
      required: true,
      index: true,
    },
    storeItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreItem",
      required: true,
      index: true,
    },
    delta: {
      type: Number,
      required: true,
    },
    resultingQty: {
      type: Number,
      required: true,
    },
    actor: {
      type: String,
      trim: true,
      default: "van-user",
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // append only
  }
);

export const Log = mongoose.model("Log", logSchema);
