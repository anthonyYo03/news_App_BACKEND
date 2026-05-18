import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { getIo } from "../utils/socketManager.js";
import { Op } from 'sequelize';

export const sendNotification = 
async ({ recipients, type = "DEFAULT", title, message, relatedId = null, relatedModel = null }) => {
  try {
    const notifications = recipients.map(user_id => ({
      user_id,              // was 'recipients: user_id' (wrong field name)
      notification_type: type, // was 'type' but model expects 'notification_type'
      message,
      news_id: relatedId    // was 'news_id' (undefined variable), use relatedId instead
    }));

    const saved = await Notification.bulkCreate(notifications);

    const io = getIo();
    if (io) {
      saved.forEach((notification) => {
        io.to(notification.user_id.toString()).emit('new-notification', {
          notification_id: notification.notification_id,
          notification_type: notification.notification_type,
          message: notification.message,
          user_id: notification.user_id,
          news_id: notification.news_id,
          is_read: notification.is_read,
          createdAt: notification.createdAt
        });
      });
    }

  } catch (error) {
    console.error("Notification error:", error);
  }
};

export const allUsers= async()=>{

  const users = await User.findAll({where: { user_type_id: { [Op.in]: [1, 2] } } });
  return users.map(user => user.user_id);
}

export const justJournalists = async () => {
  const users = await User.findAll({ where: { user_type_id: 1 } });
  return users.map(user => user.user_id); 
};