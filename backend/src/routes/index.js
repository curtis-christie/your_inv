import { Router } from "express";
import vansRouter from "./vanRoutes.js";
import devRouter from "./devRoutes.js";
import itemsRouter from "./itemRoutes.js";

const router = Router();

// /api/health
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount vans router under /api/vans
router.use("/vans", vansRouter);
router.use("/items", itemsRouter);

if (process.env.NODE_ENV === "development") {
  // api/dev
  router.use("/dev", devRouter);
}

export default router;
