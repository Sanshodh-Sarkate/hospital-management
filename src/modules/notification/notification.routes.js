// CHANGED
const express = require("express");
const router = express.Router();
const notificationController = require("./notification.controller");
const notificationValidation = require("./notification.validation");
const authMiddleware = require("../auth/auth.middleware");
const validateRequest = require("../../common/middleware/validation.middleware");
const { validateQueryFeatures } = require("../../common/middleware/query-validation.middleware");

// Require authentication for all notification routes
router.use(authMiddleware.protect);

// CHANGED: 1. Get My Notifications (Supports APIFeatures query parameters)
router.get("/", validateQueryFeatures, validateRequest, notificationController.getMyNotifications);


// 2. Get Unread Notification Count (MUST be registered BEFORE dynamic /:id routes!)
router.get("/unread-count", notificationController.getUnreadCount);

// 3. Mark All Notifications as Read (MUST be registered BEFORE dynamic /:id routes!)
router.patch("/read-all", notificationController.markAllAsRead);

// 4. Mark Single Notification as Read
router.patch(
  "/:id/read",
  notificationValidation.markAsReadValidation,
  validateRequest,
  notificationController.markAsRead
);

module.exports = router;
