import NotificationService from '../services/notificationService.js';

// Get notifications for the authenticated user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const result = await NotificationService.getUserNotifications(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true'
    });

    res.json({
      notifications: result.rows,
      total: result.count,
      unreadCount: unreadOnly === 'true' ? result.count : undefined
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await NotificationService.getUserNotifications(userId, {
      limit: 1,
      unreadOnly: true
    });

    res.json({ unreadCount: result.count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const success = await NotificationService.markAsRead(id, userId);
    
    if (success) {
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedCount = await NotificationService.markAllAsRead(userId);
    
    res.json({ 
      message: 'All notifications marked as read',
      updatedCount 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// OWNER-SPECIFIC ENDPOINTS

// Get owner notifications with advanced filtering
export const getOwnerNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      type, 
      status, 
      priority, 
      limit = 10, 
      offset = 0, 
      search 
    } = req.query;

    const filters = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      type: type !== 'all' ? type : undefined,
      priority: priority !== 'all' ? priority : undefined,
      search: search || undefined
    };

    // Handle status filter
    if (status === 'read') {
      filters.readOnly = true;
    } else if (status === 'unread') {
      filters.unreadOnly = true;
    }

    const result = await NotificationService.getUserNotifications(userId, filters);

    // Transform notifications to match frontend interface
    const transformedNotifications = result.rows.map(notification => ({
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      relatedItem: notification.data?.relatedItem || null,
      data: notification.data,
      isRead: notification.isRead,
      priority: notification.priority || 'medium',
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    }));

    res.json({
      notifications: transformedNotifications,
      total: result.count,
      unreadCount: status === 'unread' ? result.count : undefined
    });
  } catch (error) {
    console.error('Error fetching owner notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get owner unread notification count
export const getOwnerUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await NotificationService.getUserNotifications(userId, {
      limit: 1,
      unreadOnly: true
    });

    res.json({ unreadCount: result.count });
  } catch (error) {
    console.error('Error fetching owner unread count:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark owner notification as read
export const markOwnerNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const success = await NotificationService.markAsRead(id, userId);
    
    if (success) {
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking owner notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark owner notification as unread
export const markOwnerNotificationAsUnread = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const success = await NotificationService.markAsUnread(id, userId);
    
    if (success) {
      res.json({ message: 'Notification marked as unread' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking owner notification as unread:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark all owner notifications as read
export const markAllOwnerNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedCount = await NotificationService.markAllAsRead(userId);
    
    res.json({ 
      message: 'All notifications marked as read',
      updatedCount 
    });
  } catch (error) {
    console.error('Error marking all owner notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete owner notification
export const deleteOwnerNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const success = await NotificationService.deleteNotification(id, userId);
    
    if (success) {
      res.json({ message: 'Notification deleted successfully' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error deleting owner notification:', error);
    res.status(500).json({ error: error.message });
  }
};

// Clear all owner notifications
export const clearAllOwnerNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('Clearing all notifications for user:', userId);

    const deletedCount = await NotificationService.clearAllNotifications(userId);
    
    console.log('Successfully deleted notifications:', deletedCount);
    
    res.json({ 
      message: 'All notifications cleared',
      deletedCount 
    });
  } catch (error) {
    console.error('Error clearing all owner notifications:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

// Create test notification for development
export const createTestOwnerNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const testTypes = [
      'booking_request',
      'payment_received', 
      'booking_approved',
      'booking_cancelled',
      'customer_review',
      'system_alert',
      'maintenance_reminder'
    ];
    
    const randomType = testTypes[Math.floor(Math.random() * testTypes.length)];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    
    const testNotifications = {
      booking_request: {
        title: 'New Booking Request',
        message: 'You have a new booking request for your Toyota Camry 2022',
        relatedItem: { type: 'car', id: '1', name: 'Toyota Camry 2022' }
      },
      payment_received: {
        title: 'Payment Received',
        message: 'Payment of $150 received for booking #1234',
        relatedItem: { type: 'booking', id: '1234', name: 'Booking #1234' }
      },
      booking_approved: {
        title: 'Booking Approved',
        message: 'Your booking approval has been confirmed',
        relatedItem: { type: 'booking', id: '1235', name: 'Booking #1235' }
      },
      booking_cancelled: {
        title: 'Booking Cancelled',
        message: 'A booking for your Honda Civic has been cancelled',
        relatedItem: { type: 'car', id: '2', name: 'Honda Civic 2021' }
      },
      customer_review: {
        title: 'New Customer Review',
        message: 'You received a 5-star review from John Doe',
        relatedItem: { type: 'customer', id: '123', name: 'John Doe' }
      },
      system_alert: {
        title: 'System Alert',
        message: 'Your account verification is pending',
        relatedItem: null
      },
      maintenance_reminder: {
        title: 'Maintenance Reminder',
        message: 'Your BMW X5 is due for maintenance check',
        relatedItem: { type: 'car', id: '3', name: 'BMW X5 2023' }
      }
    };
    
    const testData = testNotifications[randomType];
    
    const notification = await NotificationService.createNotification({
      userId,
      type: randomType,
      title: testData.title,
      message: testData.message,
      data: { relatedItem: testData.relatedItem },
      priority: randomPriority
    });
    
    res.json({ 
      message: 'Test notification created',
      type: randomType,
      priority: randomPriority,
      notification 
    });
  } catch (error) {
    console.error('Error creating test owner notification:', error);
    res.status(500).json({ error: error.message });
  }
};
