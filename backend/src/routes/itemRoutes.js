// src/routes/itemRoutes.js
import { Router } from "express";
import { adjustVanItem } from "../controllers/adjustController.js";

const router = Router();

// POST /api/items/:vanItemId/adjust
router.post("/:vanItemId/adjust", adjustVanItem);

export default router;
