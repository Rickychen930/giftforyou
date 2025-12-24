// src/routes/metrics-routes.ts
import { Router } from "express";
import { getMetrics, getVisitorStats } from "../controllers/metrics-controller";
import { getInsights, postAnalyticsEvent } from "../controllers/metrics-controller";

const router = Router();

router.get("/", getMetrics);
router.get("/visitors", getVisitorStats);

// Public tracking endpoint (must never fail loudly)
router.post("/events", postAnalyticsEvent);

// Admin-only analytics aggregates
router.get("/insights", getInsights);

export default router;
