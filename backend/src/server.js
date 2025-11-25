// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import apiRouter from "./routes/index.js";

dotenv.config();
console.log("[server] NODE_ENV:", JSON.stringify(process.env.NODE_ENV));

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/van_inventory_dev";

// Global middleware
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.send("Van Inventory API is running.");
});

// Start server only after DB connection
async function startServer() {
  await connectDB(MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[server] Failed to start:", err);
});
