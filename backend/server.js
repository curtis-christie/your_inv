import express from "express";
import itemRoutes from "./routes/items.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const app = express();

// middleware
app.use(express.json()); // parses incoming requests with json data

// routes
app.use("/api/items", itemRoutes);

// connect to database and start listening
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to Database");
    app.listen(process.env.PORT, () => console.log(`Server running on Port ${process.env.PORT}`));
  })
  .catch((err) => {
    console.error("Connection Error: ", err.message);
    process.exit(1);
  });
