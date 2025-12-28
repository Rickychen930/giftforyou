import { Router } from "express";
import { createCustomer, getCustomerById, getCustomers } from "../controllers/customer-controller";
import { getCustomerProfile, updateCustomerProfile } from "../controllers/customer-profile-controller";
import {
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultAddress,
} from "../controllers/customer-addresses-controller";
import { changeCustomerPassword } from "../controllers/customer-change-password-controller";
import { authenticate } from "../middleware/auth-middleware";

const router = Router();

// Debug logging (always log for debugging)
router.use((req, res, next) => {
  console.log(`[Customer Routes] ${req.method} ${req.path}${req.url !== req.path ? ` (url: ${req.url})` : ""}`);
  next();
});

// Customer profile routes (authenticated)
router.get("/profile", authenticate, getCustomerProfile);
router.patch("/profile", authenticate, updateCustomerProfile);

// Customer addresses routes (authenticated)
router.get("/addresses", authenticate, getCustomerAddresses);
router.post("/addresses", authenticate, createCustomerAddress);
router.patch("/addresses/:id", authenticate, updateCustomerAddress);
router.delete("/addresses/:id", authenticate, deleteCustomerAddress);
router.patch("/addresses/:id/set-default", authenticate, setDefaultAddress);

// Customer change password route (authenticated)
router.post("/change-password", authenticate, changeCustomerPassword);

// Protected routes - all customer operations require authentication
// Note: Order matters - specific routes before parameterized routes
router.get("/", authenticate, getCustomers);
router.post("/", authenticate, createCustomer);
router.get("/:id", authenticate, getCustomerById);

export default router;
