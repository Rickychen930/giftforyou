import { Router } from "express";
import {
  createBouquet,
  getBouquets,
  getBouquetById,
  updateBouquet,
  deleteBouquet,
} from "../controllers/bouquet-controller";
import { upload } from "../middleware/upload";
import { authenticate, requireAdmin } from "../middleware/auth-middleware";

const router = Router();

// Public routes (read-only)
router.get("/", getBouquets);
router.get("/:id", getBouquetById); // ✅ detail endpoint

// Protected routes (require authentication and admin role)
router.post("/", authenticate, requireAdmin, upload.single("image"), createBouquet);
router.put("/:id", authenticate, requireAdmin, upload.single("image"), updateBouquet);
router.delete("/:id", authenticate, requireAdmin, deleteBouquet);

export default router;
