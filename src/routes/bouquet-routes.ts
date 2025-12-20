import { Router } from "express";
import {
  createBouquet,
  getBouquets,
  updateBouquet,
  deleteBouquet,
} from "../controllers/bouquet-controller";

import getBouquetById from "../controllers/bouquet-detail-controller";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getBouquets);
router.get("/:id", getBouquetById); // ✅ new detail endpoint

router.post("/", upload.single("image"), createBouquet);
router.put("/:id", upload.single("image"), updateBouquet);
router.delete("/:id", deleteBouquet);

export default router;
