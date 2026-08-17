//
const AppDataSource = require("../../config/db");
const Notification = require("./notification.entity");
const APIFeatures = require("../../common/utils/api-features.util");

const notificationRepository = AppDataSource.getRepository(Notification);


// 1. Create Notification
const createNotification = async (notficationData) => {
  const notification = await notificationRepository.create(notficationData);
  return await notificationRepository.save(notification);
}

//: 2. Get Notifications by Recipient ID (With APIFeatures Query Builder)
const getNotificationsByRecipientId = async (recipientId, queryString = {}) => {
  const features = new APIFeatures(queryString)
    .filter(["isRead", "type"])
    .search(["title", "message"])
    .sort(["createdAt", "isRead", "type"], { field: "createdAt", order: "DESC" })
    .limitFields()
    .paginate(10);

  const findOptions = features.getFindOptions({ recipient: { id: recipientId } });
  const [notifications, total] = await notificationRepository.findAndCount(findOptions);

  return features.formatResponse(notifications, total);
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