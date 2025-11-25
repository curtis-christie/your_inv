// src/config/db.js
import mongoose from "mongoose";

export async function connectDB(mongoUri) {
  try {
    await mongoose.connect(mongoUri);
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] MongoDB connection error:", err.message);
    process.exit(1); // crash fast if DB is not reachable
  }
}
