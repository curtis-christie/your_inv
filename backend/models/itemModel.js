import mongoose from "mongoose";

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: Number,
    trim: true,
    required: true,
    unique: true,
    maxlength: 6,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

export default mongoose.model("Item", itemSchema);
