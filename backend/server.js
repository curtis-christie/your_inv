const express = require("express");
const itemRoutes = require("./routes/items.js");

const app = express();

// middleware
app.use(express.json()); // parses incoming requests with json data

// routes
app.use("/api/items", itemRoutes);
