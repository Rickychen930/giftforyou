"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer-controller");
const customer_profile_controller_1 = require("../controllers/customer-profile-controller");
const customer_addresses_controller_1 = require("../controllers/customer-addresses-controller");
const customer_change_password_controller_1 = require("../controllers/customer-change-password-controller");
const auth_middleware_1 = require("../middleware/auth-middleware");
const router = (0, express_1.Router)();
// Debug logging (always log for debugging)
router.use((req, res, next) => {
    console.log(`[Customer Routes] ${req.method} ${req.path}${req.url !== req.path ? ` (url: ${req.url})` : ""}`);
    next();
});
// Customer profile routes (authenticated)
router.get("/profile", auth_middleware_1.authenticate, customer_profile_controller_1.getCustomerProfile);
router.patch("/profile", auth_middleware_1.authenticate, customer_profile_controller_1.updateCustomerProfile);
// Customer addresses routes (authenticated)
router.get("/addresses", auth_middleware_1.authenticate, customer_addresses_controller_1.getCustomerAddresses);
router.post("/addresses", auth_middleware_1.authenticate, customer_addresses_controller_1.createCustomerAddress);
router.patch("/addresses/:id", auth_middleware_1.authenticate, customer_addresses_controller_1.updateCustomerAddress);
router.delete("/addresses/:id", auth_middleware_1.authenticate, customer_addresses_controller_1.deleteCustomerAddress);
router.patch("/addresses/:id/set-default", auth_middleware_1.authenticate, customer_addresses_controller_1.setDefaultAddress);
// Customer change password route (authenticated)
router.post("/change-password", auth_middleware_1.authenticate, customer_change_password_controller_1.changeCustomerPassword);
// Protected routes - all customer operations require authentication
// Note: Order matters - specific routes before parameterized routes
router.get("/", auth_middleware_1.authenticate, customer_controller_1.getCustomers);
router.post("/", auth_middleware_1.authenticate, customer_controller_1.createCustomer);
router.get("/:id", auth_middleware_1.authenticate, customer_controller_1.getCustomerById);
exports.default = router;
//# sourceMappingURL=customer-routes.js.map