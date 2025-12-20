"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bouquet_controller_1 = require("../controllers/bouquet-controller");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.get("/", bouquet_controller_1.getBouquets);
router.get("/:id", bouquet_controller_1.getBouquetById); // ✅ detail endpoint
router.post("/", upload_1.upload.single("image"), bouquet_controller_1.createBouquet);
router.put("/:id", upload_1.upload.single("image"), bouquet_controller_1.updateBouquet);
router.delete("/:id", bouquet_controller_1.deleteBouquet);
exports.default = router;
//# sourceMappingURL=bouquet-routes.js.map