import { Router } from "express";
import vansRouter from "./vanRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount vans router under /api/vans
router.use("/vans", vansRouter);

export default router;
