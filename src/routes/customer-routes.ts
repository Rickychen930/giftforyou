import { Router } from "express";
import { createCustomer, getCustomerById, getCustomers } from "../controllers/customer-controller";

const router = Router();

router.get("/", getCustomers);
router.post("/", createCustomer);
router.get("/:id", getCustomerById);

export default router;
