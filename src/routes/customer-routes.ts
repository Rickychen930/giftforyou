import { Router } from "express";
import { createCustomer, getCustomerById, getCustomers } from "../controllers/customer-controller";
import { authenticate } from "../middleware/auth-middleware";

const router = Router();

// Protected routes - all customer operations require authentication
// Note: Order matters - specific routes before parameterized routes
router.get("/", authenticate, getCustomers);
router.post("/", authenticate, createCustomer);
router.get("/:id", authenticate, getCustomerById);

// Debug logging in development
if (process.env.NODE_ENV === "development") {
  router.use((req, res, next) => {
    console.log(`[Customer Routes] ${req.method} ${req.path}`);
    next();
  });
}

export default router;
