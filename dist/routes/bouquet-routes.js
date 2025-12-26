"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bouquet_controller_1 = require("../controllers/bouquet-controller");
const upload_1 = require("../middleware/upload");
const auth_middleware_1 = require("../middleware/auth-middleware");
const router = (0, express_1.Router)();
// Public routes (read-only)
router.get("/", bouquet_controller_1.getBouquets);
router.get("/:id", bouquet_controller_1.getBouquetById); // ✅ detail endpoint
// Protected routes (require authentication and admin role)
router.post("/", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, upload_1.upload.single("image"), bouquet_controller_1.createBouquet);
router.put("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, upload_1.upload.single("image"), bouquet_controller_1.updateBouquet);
router.delete("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, bouquet_controller_1.deleteBouquet);
exports.default = router;
//# sourceMappingURL=bouquet-routes.js.map