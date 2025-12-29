"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order-controller");
const auth_middleware_1 = require("../middleware/auth-middleware");
const order_model_1 = require("../models/order-model");
const router = (0, express_1.Router)();
// Debug logging (always log for debugging)
router.use((req, res, next) => {
    console.log(`[Order Routes] ${req.method} ${req.path}${req.url !== req.path ? ` (url: ${req.url})` : ""}`);
    next();
});
// Protected routes - all order operations require authentication
router.get("/", auth_middleware_1.authenticate, order_controller_1.getOrders);
router.get("/stats", getOrderStats); // Public endpoint for order stats
router.get("/stats/recent", getRecentOrderStats); // Public endpoint for recent order stats
router.post("/", order_controller_1.createOrder); // Public for customers to create orders
router.patch("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, order_controller_1.updateOrder);
router.delete("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, order_controller_1.deleteOrder);
// Order stats endpoints (public for social proof)
async function getOrderStats(req, res) {
    try {
        const { bouquetId } = req.query;
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const query = { createdAt: { $gte: oneDayAgo } };
        if (bouquetId && typeof bouquetId === "string") {
            query.bouquetId = bouquetId;
        }
        const count = await order_model_1.OrderModel.countDocuments(query).exec();
        const lastOrder = await order_model_1.OrderModel.findOne(query)
            .sort({ createdAt: -1 })
            .select({ createdAt: 1 })
            .lean()
            .exec();
        res.json({
            count,
            lastOrderTime: lastOrder?.createdAt,
        });
    }
    catch (error) {
        console.error("Error fetching order stats:", error);
        res.status(500).json({ error: "Failed to fetch order stats" });
    }
}
async function getRecentOrderStats(req, res) {
    try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const count = await order_model_1.OrderModel.countDocuments({
            createdAt: { $gte: oneDayAgo },
        }).exec();
        const lastOrder = await order_model_1.OrderModel.findOne({ createdAt: { $gte: oneDayAgo } })
            .sort({ createdAt: -1 })
            .select({ createdAt: 1 })
            .lean()
            .exec();
        res.json({
            count,
            lastOrderTime: lastOrder?.createdAt,
        });
    }
    catch (error) {
        console.error("Error fetching recent order stats:", error);
        res.status(500).json({ error: "Failed to fetch recent order stats" });
    }
}
exports.default = router;
//# sourceMappingURL=order-routes.js.map