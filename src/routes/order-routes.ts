import { Router } from "express";
import type { Request, Response } from "express";
import { createOrder, deleteOrder, getOrders, updateOrder } from "../controllers/order-controller";
import { authenticate, requireAdmin } from "../middleware/auth-middleware";
import { OrderModel } from "../models/order-model";

const router = Router();

// Debug logging (always log for debugging)
router.use((req, res, next) => {
  console.log(`[Order Routes] ${req.method} ${req.path}${req.url !== req.path ? ` (url: ${req.url})` : ""}`);
  next();
});

// Protected routes - all order operations require authentication
router.get("/", authenticate, getOrders);
router.get("/stats", getOrderStats); // Public endpoint for order stats
router.get("/stats/recent", getRecentOrderStats); // Public endpoint for recent order stats
router.post("/", createOrder); // Public for customers to create orders
router.patch("/:id", authenticate, requireAdmin, updateOrder);
router.delete("/:id", authenticate, requireAdmin, deleteOrder);

// Order stats endpoints (public for social proof)
async function getOrderStats(req: Request, res: Response): Promise<void> {
  try {
    const { bouquetId } = req.query;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const query: any = { createdAt: { $gte: oneDayAgo } };
    if (bouquetId && typeof bouquetId === "string") {
      query.bouquetId = bouquetId;
    }

    const count = await OrderModel.countDocuments(query).exec();
    const lastOrder = await OrderModel.findOne(query)
      .sort({ createdAt: -1 })
      .select({ createdAt: 1 })
      .lean()
      .exec();

    res.json({
      count,
      lastOrderTime: lastOrder?.createdAt,
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({ error: "Failed to fetch order stats" });
  }
}

async function getRecentOrderStats(req: Request, res: Response): Promise<void> {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const count = await OrderModel.countDocuments({
      createdAt: { $gte: oneDayAgo },
    }).exec();

    const lastOrder = await OrderModel.findOne({ createdAt: { $gte: oneDayAgo } })
      .sort({ createdAt: -1 })
      .select({ createdAt: 1 })
      .lean()
      .exec();

    res.json({
      count,
      lastOrderTime: lastOrder?.createdAt,
    });
  } catch (error) {
    console.error("Error fetching recent order stats:", error);
    res.status(500).json({ error: "Failed to fetch recent order stats" });
  }
}

export default router;
