"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer-controller");
const auth_middleware_1 = require("../middleware/auth-middleware");
const router = (0, express_1.Router)();
// Debug logging (always log for debugging)
router.use((req, res, next) => {
    console.log(`[Customer Routes] ${req.method} ${req.path}${req.url !== req.path ? ` (url: ${req.url})` : ""}`);
    next();
});
// Protected routes - all customer operations require authentication
// Note: Order matters - specific routes before parameterized routes
router.get("/", auth_middleware_1.authenticate, customer_controller_1.getCustomers);
router.post("/", auth_middleware_1.authenticate, customer_controller_1.createCustomer);
router.get("/:id", auth_middleware_1.authenticate, customer_controller_1.getCustomerById);
exports.default = router;
//# sourceMappingURL=customer-routes.js.map