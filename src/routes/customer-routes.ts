import { Router } from "express";
import { createCustomer, getCustomerById, getCustomers } from "../controllers/customer-controller";
import { authenticate } from "../middleware/auth-middleware";

const router = Router();

// Debug logging (always log for debugging)
router.use((req, res, next) => {
  console.log(`[Customer Routes] ${req.method} ${req.path}${req.url !== req.path ? ` (url: ${req.url})` : ""}`);
  next();
});

// Protected routes - all customer operations require authentication
// Note: Order matters - specific routes before parameterized routes
router.get("/", authenticate, getCustomers);
router.post("/", authenticate, createCustomer);
router.get("/:id", authenticate, getCustomerById);

export default router;
