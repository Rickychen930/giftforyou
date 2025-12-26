// src/routes/metrics-routes.ts
import { Router } from "express";
import { getMetrics, getVisitorStats } from "../controllers/metrics-controller";
import { getInsights, postAnalyticsEvent } from "../controllers/metrics-controller";
import { authenticate, requireAdmin } from "../middleware/auth-middleware";

const router = Router();

// Protected routes - require authentication
router.get("/", authenticate, requireAdmin, getMetrics);
router.get("/visitors", authenticate, requireAdmin, getVisitorStats);

// Public tracking endpoint (must never fail loudly)
router.post("/events", postAnalyticsEvent);

// Admin-only analytics aggregates
router.get("/insights", authenticate, requireAdmin, getInsights);

export default router;
