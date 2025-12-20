"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/metrics-routes.ts
const express_1 = require("express");
const metrics_controller_1 = require("../controllers/metrics-controller");
const router = (0, express_1.Router)();
router.get("/", metrics_controller_1.getMetrics);
exports.default = router;
//# sourceMappingURL=metrics-routes.js.map