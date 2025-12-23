// src/routes/metrics-routes.ts
import { Router } from "express";
import { getMetrics, getVisitorStats } from "../controllers/metrics-controller";

const router = Router();

router.get("/", getMetrics);
router.get("/visitors", getVisitorStats);

export default router;
