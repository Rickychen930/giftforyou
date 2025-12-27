"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order-controller");
const auth_middleware_1 = require("../middleware/auth-middleware");
const router = (0, express_1.Router)();
// Debug logging (always log for debugging)
router.use((req, res, next) => {
    console.log(`[Order Routes] ${req.method} ${req.path}${req.url !== req.path ? ` (url: ${req.url})` : ""}`);
    next();
});
// Protected routes - all order operations require authentication
router.get("/", auth_middleware_1.authenticate, order_controller_1.getOrders);
router.post("/", order_controller_1.createOrder); // Public for customers to create orders
router.patch("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, order_controller_1.updateOrder);
router.delete("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, order_controller_1.deleteOrder);
exports.default = router;
//# sourceMappingURL=order-routes.js.map