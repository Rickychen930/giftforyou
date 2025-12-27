import { Router } from "express";
import { createOrder, deleteOrder, getOrders, updateOrder } from "../controllers/order-controller";
import { authenticate, requireAdmin } from "../middleware/auth-middleware";

const router = Router();

// Debug logging (always log for debugging)
router.use((req, res, next) => {
  console.log(`[Order Routes] ${req.method} ${req.path}${req.url !== req.path ? ` (url: ${req.url})` : ""}`);
  next();
});

// Protected routes - all order operations require authentication
router.get("/", authenticate, getOrders);
router.post("/", createOrder); // Public for customers to create orders
router.patch("/:id", authenticate, requireAdmin, updateOrder);
router.delete("/:id", authenticate, requireAdmin, deleteOrder);

export default router;
