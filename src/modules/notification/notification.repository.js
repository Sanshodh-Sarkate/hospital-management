const AppDataSource = require("../../config/db");
const Notification = require("./notification.entity");
const notificationEntity = require("./notification.entity");

const  notificationRepository  =  AppDataSource.getRepository(Notification);


// 1. Create Notification
const createNotification =  async(notficationData) => {
  const  notification =  await  notificationRepository.create(notficationData);
  return await  notificationRepository.save(notification);
} 

// 2. Get Notifications by Recipient ID
const getNotificationsByRecipientId = async (recipientId) => {
  return await notificationRepository.find({
    where: {
      recipient: { id: recipientId },
    },
    order: {
      createdAt: "DESC",
    },
  });
};



// 3. Find Notification by ID
const findNotificationById = async (notificationId) => {
  return await notificationRepository.findOne({
    where: { id: notificationId },
    relations: {
      recipient: true,
    },
  });
};

// 4. Mark Single Notification as Read
const markAsRead = async (notificationId) => {
  await notificationRepository.update(notificationId, { isRead: true });
  return await findNotificationById(notificationId);
};
// 5. Mark All Notifications as Read for Recipient
const markAllAsRead = async (recipientId) => {
  return await notificationRepository.update(
    {
      recipient: { id: recipientId },
      isRead: false,
    },
    { isRead: true }
  );
};
// 6. Get Unread Notification Count
const getUnreadCount = async (recipientId) => {
  return await notificationRepository.count({
    where: {
      recipient: { id: recipientId },
      isRead: false,
    },
  });
};
module.exports = {
  createNotification,
  getNotificationsByRecipientId,
  findNotificationById,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};