"use strict";
// src/api/routes/instagram-routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const instagram_controller_1 = require("../controllers/instagram-controller");
const router = (0, express_1.Router)();
// Debug logging
router.use((req, res, next) => {
    console.log(`[Instagram Routes] ${req.method} ${req.path}${req.url !== req.path ? ` (url: ${req.url})` : ""}`);
    next();
});
// Public routes - Instagram feed is public
router.get("/posts", instagram_controller_1.getInstagramPosts);
router.get("/profile", instagram_controller_1.getInstagramProfile);
exports.default = router;
//# sourceMappingURL=instagram-routes.js.map