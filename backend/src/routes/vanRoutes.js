import { Router } from "express";
import { getVans } from "../controllers/vanController.js";
import {
  createVanItem,
  deleteVanItem,
  getVanItems,
  updateVanItem,
} from "../controllers/vanItemController.js";
import { getVanLogs } from "../controllers/logController.js";
import { exportVanItemsCSV } from "../controllers/exportController.js";

const router = Router();

// GET /api/vans
router.get("/", getVans);

// /api/vans/:vanId/items
router.get("/:vanId/items", getVanItems);
router.post("/:vanId/items", createVanItem);

// /api/:vanId/logs
router.get("/:vanId/logs", getVanLogs);

router.get("/:vanId/items.csv", exportVanItemsCSV);

// /api/items/:vanItemId
router.patch("/items/:vanItemId", updateVanItem);
router.delete("/items/:vanItemId", deleteVanItem);

export default router;
