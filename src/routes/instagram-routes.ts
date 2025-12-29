// src/routes/instagram-routes.ts

import { Router } from "express";
import { getInstagramPosts, getInstagramProfile } from "../controllers/instagram-controller";

const router = Router();

// Debug logging
router.use((req, res, next) => {
  console.log(`[Instagram Routes] ${req.method} ${req.path}${req.url !== req.path ? ` (url: ${req.url})` : ""}`);
  next();
});

// Public routes - Instagram feed is public
router.get("/posts", getInstagramPosts);
router.get("/profile", getInstagramProfile);

export default router;

