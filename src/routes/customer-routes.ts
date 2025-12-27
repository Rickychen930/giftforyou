import { Router } from "express";
import { createCustomer, getCustomerById, getCustomers } from "../controllers/customer-controller";
import { authenticate } from "../middleware/auth-middleware";

const router = Router();

// Protected routes - all customer operations require authentication
router.get("/", authenticate, getCustomers);
router.post("/", authenticate, createCustomer);
router.get("/:id", authenticate, getCustomerById);

export default router;
