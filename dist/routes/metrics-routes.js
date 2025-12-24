"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/metrics-routes.ts
const express_1 = require("express");
const metrics_controller_1 = require("../controllers/metrics-controller");
const metrics_controller_2 = require("../controllers/metrics-controller");
const router = (0, express_1.Router)();
router.get("/", metrics_controller_1.getMetrics);
router.get("/visitors", metrics_controller_1.getVisitorStats);
// Public tracking endpoint (must never fail loudly)
router.post("/events", metrics_controller_2.postAnalyticsEvent);
// Admin-only analytics aggregates
router.get("/insights", metrics_controller_2.getInsights);
exports.default = router;
//# sourceMappingURL=metrics-routes.js.map