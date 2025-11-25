// src/routes/devRoutes.js
import { Router } from "express";
import { Van } from "../models/van.model.js";
import { StoreItem } from "../models/storeItem.model.js";
import { VanItem } from "../models/vanItem.model.js";

const router = Router();

// WARNING: dev-only seed route
router.post("/seed", async (req, res, next) => {
  try {
    await Promise.all([Van.deleteMany({}), StoreItem.deleteMany({}), VanItem.deleteMany({})]);

    const van = await Van.create({ name: "Curtis Van 1", code: "van-1" });

    const thermostat = await StoreItem.create({
      sku: "TH-100",
      name: "Smart Thermostat X",
      unit: "pcs",
      storeQty: 50,
      storeThreshold: 10,
      tags: ["hvac"],
    });

    const hdmi = await StoreItem.create({
      sku: "HDMI-01",
      name: "HDMI Cable 6ft",
      unit: "pcs",
      storeQty: 100,
      storeThreshold: 20,
      tags: ["cable"],
    });

    await VanItem.create([
      {
        vanId: van._id,
        storeItemId: thermostat._id,
        quantity: 3,
        threshold: 2,
        unit: "pcs",
        bin: "Bin A1",
      },
      {
        vanId: van._id,
        storeItemId: hdmi._id,
        quantity: 5,
        threshold: 3,
        unit: "pcs",
        bin: "Bin B2",
      },
    ]);

    res.json({ message: "Seeded dev data", vanId: van._id });
  } catch (err) {
    next(err);
  }
});

export default router;
