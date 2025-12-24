import { Router } from "express";
import { createOrder, deleteOrder, getOrders, updateOrder } from "../controllers/order-controller";

const router = Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.patch("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;
