import NotificationService from '../services/notificationService.js';
import db from '../models/index.js';

/**
 * Get all notifications for admin dashboard
 */
export const getAllNotifications = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      type, 
      recipient, 
      status,
      search 
    } = req.query;

    const whereClause = {};

    // Type filter
    if (type && type !== 'all') {
      whereClause.type = type;
    }

    // Status filter (isRead)
    if (status && status !== 'all') {
      whereClause.isRead = status === 'Read';
    }

    // Search filter
    if (search) {
      const { Op } = await import('sequelize');
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Fetch notifications with user info
    const result = await db.Notification.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Transform notifications to match frontend interface
    const transformedNotifications = result.rows.map(notification => {
      const recipientRole = notification.user?.role || 'Unknown';
      let recipient = 'Customer';
      if (recipientRole === 'owner') recipient = 'Owner';
      else if (recipientRole === 'admin') recipient = 'Admin';

      // Map notification type to frontend type
      let notificationType = 'System';
      if (notification.type.includes('booking')) notificationType = 'Booking';
      else if (notification.type.includes('payment')) notificationType = 'Payment';
      else if (notification.type.includes('review')) notificationType = 'Review';

      return {
        id: notification.id.toString(),
        title: notification.title,
        message: notification.message,
        recipient,
        type: notificationType,
        status: notification.isRead ? 'Read' : 'Unread',
        link: notification.data?.link || null,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        userId: notification.userId,
        userName: notification.user?.name || 'Unknown User',
        userEmail: notification.user?.email || ''
      };
    });

    // Apply recipient filter on transformed data
    let filteredNotifications = transformedNotifications;
    if (recipient && recipient !== 'all') {
      filteredNotifications = transformedNotifications.filter(
        n => n.recipient === recipient
      );
    }

    // Count unread notifications
    const unreadCount = await db.Notification.count({
      where: { isRead: false }
    });

    res.json({
      notifications: filteredNotifications,
      totalCount: result.count,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send notification to users (platform-wide)
 */
export const sendNotification = async (req, res) => {
  try {
    const { title, message, recipient, type, link } = req.body;

    // Validate input
    if (!title || !message || !recipient || !type) {
      return res.status(400).json({ 
        error: 'Title, message, recipient, and type are required' 
      });
    }

    // Determine target users based on recipient
    let targetUsers = [];
    if (recipient === 'All') {
      targetUsers = await db.User.findAll({
        where: { role: ['customer', 'owner'] },
        attributes: ['id']
      });
    } else if (recipient === 'Owner') {
      targetUsers = await db.User.findAll({
        where: { role: 'owner' },
        attributes: ['id']
      });
    } else if (recipient === 'Customer') {
      targetUsers = await db.User.findAll({
        where: { role: 'customer' },
        attributes: ['id']
      });
    } else {
      return res.status(400).json({ error: 'Invalid recipient type' });
    }

    // Map frontend type to backend type
    let notificationType = 'system_message';
    if (type === 'Booking') notificationType = 'booking_request';
    else if (type === 'Payment') notificationType = 'payment_received';
    else if (type === 'Review') notificationType = 'customer_review';

    // Create notifications for all target users
    const notifications = await Promise.all(
      targetUsers.map(user =>
        NotificationService.createNotification({
          userId: user.id,
          type: notificationType,
          title,
          message,
          data: link ? { link } : null,
          priority: 'medium'
        })
      )
    );

    res.json({
      message: `Notification sent to ${notifications.length} user(s)`,
      count: notifications.length,
      notification: notifications[0] // Return first notification as sample
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const [updatedRows] = await db.Notification.update(
      { isRead: true },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mark notification as unread
 */
export const markNotificationAsUnread = async (req, res) => {
  try {
    const { id } = req.params;

    const [updatedRows] = await db.Notification.update(
      { isRead: false },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as unread' });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await db.Notification.destroy({
      where: { id }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Bulk delete notifications
 */
export const bulkDeleteNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'Invalid notification IDs' });
    }

    const deletedRows = await db.Notification.destroy({
      where: { id: notificationIds }
    });

    res.json({ 
      message: `${deletedRows} notification(s) deleted successfully`,
      deletedCount: deletedRows
    });
  } catch (error) {
    console.error('Error bulk deleting notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (req, res) => {
  try {
    const deletedRows = await db.Notification.destroy({
      where: {},
      truncate: false
    });

    res.json({ 
      message: 'All notifications cleared',
      deletedCount: deletedRows
    });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get notification statistics
 */
export const getNotificationStats = async (req, res) => {
  try {
    const totalCount = await db.Notification.count();
    const unreadCount = await db.Notification.count({ where: { isRead: false } });
    const readCount = await db.Notification.count({ where: { isRead: true } });

    // Count by type
    const typeStats = await db.Notification.findAll({
      attributes: [
        'type',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['type']
    });

    res.json({
      totalCount,
      unreadCount,
      readCount,
      typeStats
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: error.message });
  }
};
