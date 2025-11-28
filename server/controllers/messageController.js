import db from '../models/index.js';

const { Message, User, Car } = db;

// Send a message to car owner
export const sendMessage = async (req, res) => {
  try {
    const { carId, ownerId, messageText } = req.body;
    const senderId = req.user.id; // From JWT middleware

    // Validate required fields
    if (!carId || !ownerId || !messageText) {
      return res.status(400).json({ 
        error: 'Missing required fields: carId, ownerId, and messageText are required' 
      });
    }

    // Validate message text length
    if (messageText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message text cannot be empty' 
      });
    }

    if (messageText.length > 5000) {
      return res.status(400).json({ 
        error: 'Message text is too long (max 5000 characters)' 
      });
    }

    // Verify the car exists and belongs to the specified owner
    const car = await Car.findOne({
      where: { id: carId, ownerId: ownerId }
    });

    if (!car) {
      return res.status(404).json({ 
        error: 'Car not found or does not belong to the specified owner' 
      });
    }

    // Prevent sending message to yourself
    if (senderId === ownerId) {
      return res.status(400).json({ 
        error: 'You cannot send a message to yourself' 
      });
    }

    // Create the message
    const message = await Message.create({
      carId,
      ownerId,
      senderId,
      messageText: messageText.trim(),
      isRead: false
    });

    // Fetch the created message with associations
    const createdMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Car,
          as: 'car',
          attributes: ['id', 'brand', 'model', 'year']
        }
      ]
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: createdMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
};

// Get all messages for the owner
export const getOwnerMessages = async (req, res) => {
  try {
    const ownerId = req.user.id; // From JWT middleware
    const { limit = 50, offset = 0, unreadOnly = false, carId } = req.query;

    const whereClause = { ownerId };
    
    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }

    if (carId) {
      whereClause.carId = parseInt(carId);
    }

    const messages = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Car,
          as: 'car',
          attributes: ['id', 'brand', 'model', 'year']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      messages: messages.rows,
      total: messages.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching owner messages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch messages',
      details: error.message 
    });
  }
};

// Get messages sent by the user
export const getSentMessages = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.findAndCountAll({
      where: { senderId },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Car,
          as: 'car',
          attributes: ['id', 'brand', 'model', 'year']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      messages: messages.rows,
      total: messages.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sent messages',
      details: error.message 
    });
  }
};

// Mark a message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const message = await Message.findOne({
      where: { id, ownerId }
    });

    if (!message) {
      return res.status(404).json({ 
        error: 'Message not found or you do not have permission to mark it as read' 
      });
    }

    await message.update({
      isRead: true,
      readAt: new Date()
    });

    res.json({
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ 
      error: 'Failed to mark message as read',
      details: error.message 
    });
  }
};

// Get unread message count for owner
export const getUnreadCount = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const count = await Message.count({
      where: { 
        ownerId,
        isRead: false 
      }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ 
      error: 'Failed to fetch unread count',
      details: error.message 
    });
  }
};

// Delete a message (owner only)
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const message = await Message.findOne({
      where: { id, ownerId }
    });

    if (!message) {
      return res.status(404).json({ 
        error: 'Message not found or you do not have permission to delete it' 
      });
    }

    await message.destroy();

    res.json({
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      error: 'Failed to delete message',
      details: error.message 
    });
  }
};
