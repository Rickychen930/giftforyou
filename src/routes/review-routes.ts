/**
 * Review Routes
 * API endpoints for product reviews
 */

import { Router } from "express";
import { getReviews, createReview } from "../controllers/review-controller";

const router = Router();

// Public routes
router.get("/", getReviews);
router.post("/", createReview);

export default router;

