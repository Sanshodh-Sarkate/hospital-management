const asyncHandler = require("../../common/utils/async-handler");
const notificationServices = require("./notification.services");
const { sendSuccess } = require("../../common/utils/response.util");

// 1. Get My Notifications
module.exports.getMyNotifications = asyncHandler(async (req, res, next) => {
  const notifications = (await notificationServices.getMyNotifications(req.user)) || [];
  return sendSuccess(res, 200, "Notifications retrieved successfully", {
    notifications,
    results: notifications.length,
  });
});


// 2. Get Unread Count
module.exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const data = await notificationServices.getUnreadCount(req.user);
  return sendSuccess(res, 200, "Unread count retrieved successfully", data);
});

// 3. Mark Single Notification as Read
module.exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await notificationServices.markNotificationAsRead(
    req.params.id,
    req.user
  );
  return sendSuccess(res, 200, "Notification marked as read", { notification });
});

// 4. Mark All Notifications as Read
module.exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  const result = await notificationServices.markAllNotificationsAsRead(req.user);
  return sendSuccess(res, 200, "All notifications marked as read", result);
});
