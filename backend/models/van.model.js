import mongoose from "mongoose";

const Schema = mongoose.Schema;

const vanSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export const Van = mongoose.model("Van", vanSchema);
