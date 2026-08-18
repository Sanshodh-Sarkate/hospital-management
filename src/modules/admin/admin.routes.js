const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const authMiddleware = require("../auth/auth.middleware");

// Require authentication & ADMIN role restriction
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo("ADMIN"));

// Executive Admin Dashboard Metrics
router.get("/dashboard-metrics", adminController.getAdminDashboardMetrics);

module.exports = router;
