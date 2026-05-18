import Notification from '../models/notification.model.js';
import { Op } from 'sequelize';

const getNotifications = async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  try {
    // Get notifications for the authenticated user only
    const notifications = await Notification.findAll({
      where: { user_id: req.userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get total count of notifications for the user
    const totalCount = await Notification.count({
      where: { user_id: req.userId }
    });

    res.status(200).json({
      message: 'Notifications retrieved successfully',
      totalCount: totalCount,
      notifications: notifications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while fetching notifications: ${error.message}` 
    });
  }
};

const notificationCounter = async (req, res) => {
  try {
    // Count unread notifications for the authenticated user only
    const unreadCount = await Notification.count({
      where: {
        user_id: req.userId,
        is_read: false
      }
    });

    // Count all notifications for the user
    const totalCount = await Notification.count({
      where: { user_id: req.userId }
    });

    res.status(200).json({
      message: 'Notification count retrieved successfully',
      unreadCount: unreadCount,
      totalCount: totalCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while counting notifications: ${error.message}` 
    });
  }
};

const markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    // Validate that notificationId is provided
    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    // Find the notification (must belong to the authenticated user)
    const notification = await Notification.findOne({
      where: {
        notification_id: notificationId,
        user_id: req.userId
      }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Mark as read
    await Notification.update(
      { is_read: true },
      {
        where: {
          notification_id: notificationId,
          user_id: req.userId
        }
      }
    );

    // Get updated notification
    const updatedNotification = await Notification.findByPk(notificationId);

    res.status(200).json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while marking notification as read: ${error.message}` 
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    // Mark all unread notifications as read for the authenticated user
    await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: req.userId,
          is_read: false
        }
      }
    );

    // Count how many were marked
    const allNotifications = await Notification.count({
      where: { user_id: req.userId }
    });

    res.status(200).json({
      message: 'All notifications marked as read',
      totalNotifications: allNotifications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while marking all notifications as read: ${error.message}` 
    });
  }
};

const clearNotifications = async (req, res) => {
  try {
    // Count notifications before deletion
    const countBeforeDeletion = await Notification.count({
      where: { user_id: req.userId }
    });

    // Delete all notifications for the authenticated user only
    await Notification.destroy({
      where: { user_id: req.userId }
    });

    res.status(200).json({
      message: 'All notifications cleared successfully',
      deletedCount: countBeforeDeletion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: `An error occurred while clearing notifications: ${error.message}` 
    });
  }
};

export const notificationControllers = {
  getNotifications,
  notificationCounter,
  markAsRead,
  markAllAsRead,
  clearNotifications
};
