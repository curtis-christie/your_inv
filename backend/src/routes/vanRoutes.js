import { Router } from "express";
import { getVans } from "../controllers/vanController.js";
import { createVanItem, getVanItems } from "../controllers/vanItemController.js";

const router = Router();

// GET /api/vans
router.get("/", getVans);

// GET /api/vans/:vanId/items
router.get("/:vanId/items", getVanItems);

router.post("/:vanId/items", createVanItem);

export default router;
