import { Router } from "express";
import {
  createBouquet,
  getBouquets,
  getBouquetById,
  updateBouquet,
  deleteBouquet,
} from "../controllers/bouquet-controller";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getBouquets);
router.get("/:id", getBouquetById); // ✅ detail endpoint

router.post("/", upload.single("image"), createBouquet);
router.put("/:id", upload.single("image"), updateBouquet);
router.delete("/:id", deleteBouquet);

export default router;
