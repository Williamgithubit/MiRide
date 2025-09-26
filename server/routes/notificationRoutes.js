import express from 'express';
import auth from '../middleware/auth.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getOwnerNotifications,
  getOwnerUnreadCount,
  markOwnerNotificationAsRead,
  markOwnerNotificationAsUnread,
  markAllOwnerNotificationsAsRead,
  deleteOwnerNotification,
  clearAllOwnerNotifications,
  createTestOwnerNotification
} from '../controllers/notificationController.js';

const notificationRouter = express.Router();

// All notification routes require authentication
notificationRouter.use(auth());

// Get notifications for the authenticated user
notificationRouter.get('/', getNotifications);

// Get unread notification count
notificationRouter.get('/unread-count', getUnreadCount);

// Mark notification as read
notificationRouter.put('/:id/read', markAsRead);

// Mark all notifications as read
notificationRouter.put('/mark-all-read', markAllAsRead);

// OWNER-SPECIFIC ROUTES
// Get owner notifications with advanced filtering
notificationRouter.get('/owner', getOwnerNotifications);

// Get owner unread notification count
notificationRouter.get('/owner/unread-count', getOwnerUnreadCount);

// Mark owner notification as read
notificationRouter.put('/owner/:id/read', markOwnerNotificationAsRead);

// Mark owner notification as unread
notificationRouter.put('/owner/:id/unread', markOwnerNotificationAsUnread);

// Mark all owner notifications as read
notificationRouter.put('/owner/mark-all-read', markAllOwnerNotificationsAsRead);

// Delete owner notification
notificationRouter.delete('/owner/:id', deleteOwnerNotification);

// Clear all owner notifications
notificationRouter.delete('/owner/clear-all', clearAllOwnerNotifications);

// Create test owner notification (development only)
notificationRouter.post('/owner/create-test', createTestOwnerNotification);

export default notificationRouter;
