const notificationRepository = require("./notification.repository");
const userRepository = require("../user/user.repository");
const AppError = require("../../common/errors/app.error");

// DTO Formatter for Notification Response (Cleans up nested recipient object)
const formatNotification = (notification) => {
  if (!notification) return null;
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    metadata: notification.metadata || null,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
};

// 1. Create Notification (Internal use by other modules)
const createNotification = async (notificationData) => {
  const { recipientId, title, message, type, metadata } = notificationData;

  if (!recipientId || !title || !message || !type) {
    throw new AppError("Missing required notification fields", 400);
  }

  const recipient = await userRepository.findUserById(recipientId);
  if (!recipient) {
    throw new AppError("Recipient user not found", 404);
  }

  const savedNotification = await notificationRepository.createNotification({
    title,
    message,
    type,
    metadata: metadata || null,
    isRead: false,
    recipient: { id: recipientId },
  });

  return formatNotification(savedNotification);
};

// CHANGED: 2. Get My Notifications (Authenticated User with APIFeatures)
const getMyNotifications = async (user, queryString = {}) => {
  const result = await notificationRepository.getNotificationsByRecipientId(user.id, queryString);
  result.items = (result.items || []).map(formatNotification);
  return result;
};


// 3. Get Unread Count (Authenticated User)
const getUnreadCount = async (user) => {
  const unreadCount = await notificationRepository.getUnreadCount(user.id);
  return { unreadCount };
};

// 4. Mark Single Notification as Read
const markNotificationAsRead = async (notificationId, user) => {
  const notification = await notificationRepository.findNotificationById(notificationId);
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  // Ownership Authorization Check
  if (notification.recipient?.id !== user.id) {
    throw new AppError("You are not authorized to access this notification", 403);
  }

  if (notification.isRead) {
    return formatNotification(notification);
  }

  const updatedNotification = await notificationRepository.markAsRead(notificationId);
  return formatNotification(updatedNotification);
};

// 5. Mark All Notifications as Read
const markAllNotificationsAsRead = async (user) => {
  await notificationRepository.markAllAsRead(user.id);
  return { message: "All notifications marked as read" };
};


// 6. Helper: Notify Single User (Safe & Clean Wrapper)
const notifyUser = async (recipientId, title, message, type, metadata = null) => {
  if (!recipientId) return null;
  try {
    return await createNotification({
      recipientId,
      title,
      message,
      type,
      metadata,
    });
  } catch (error) {
    console.error(`Failed to send notification to user ${recipientId}:`, error.message);
    return null;
  }
};

// 7. Helper: Broadcast Notification to All Users of a Specific Role
const notifyRole = async (role, title, message, type, metadata = null) => {
  try {
    const roleUsers = await userRepository.findUsersByRole(role);
    const notifications = [];
    for (const u of roleUsers || []) {
      const notif = await notifyUser(u.id, title, message, type, metadata);
      if (notif) notifications.push(notif);
    }
    return notifications;
  } catch (error) {
    console.error(`Failed to broadcast notification to role ${role}:`, error.message);
    return [];
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  notifyUser,
  notifyRole,
};

