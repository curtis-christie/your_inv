// src/routes/vanRoutes.js
import { Router } from "express";
import { getVans } from "../controllers/vanController.js";
import { getVanItems } from "../controllers/vanItemController.js";

const router = Router();

// GET /api/vans
router.get("/", getVans);

// GET /api/vans/:vanId/items
router.get("/:vanId/items", getVanItems);

export default router;
