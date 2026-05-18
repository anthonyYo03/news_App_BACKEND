import express from 'express';
import { notificationControllers } from '../controllers/notificationController.js';
import { onlyJournalistAndReader,onlyJournalist } from '../middlewares/roles.js';
import { verifyToken } from '../middlewares/auth.js';
const router = express.Router(); 

// All notification routes require authentication
// Middleware needed: verifyToken from auth.js

// Get all notifications for current user
router.get('/all',verifyToken, notificationControllers.getNotifications);

// Get notification counts (unread and total)
router.get('/count',verifyToken, onlyJournalistAndReader ,notificationControllers.notificationCounter);

// Mark single notification as read
router.put('/:notificationId/read', verifyToken, onlyJournalistAndReader,notificationControllers.markAsRead);

// Mark all notifications as read
router.put('/read-all', verifyToken, onlyJournalistAndReader, notificationControllers.markAllAsRead);

// Clear all notifications
router.delete('/clear-all', verifyToken, onlyJournalistAndReader, notificationControllers.clearNotifications);

// Delete single notification
router.delete('/:notificationId', verifyToken, onlyJournalistAndReader, notificationControllers.clearNotifications);

export default router;


