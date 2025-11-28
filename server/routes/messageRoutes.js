import express from 'express';
import auth from '../middleware/auth.js';
import {
  sendMessage,
  getOwnerMessages,
  getSentMessages,
  markMessageAsRead,
  getUnreadCount,
  deleteMessage
} from '../controllers/messageController.js';

const messageRouter = express.Router();

// All message routes require authentication
messageRouter.use(auth());

// Send a message to car owner
messageRouter.post('/send', sendMessage);

// Get messages received by the owner
messageRouter.get('/owner', getOwnerMessages);

// Get messages sent by the user
messageRouter.get('/sent', getSentMessages);

// Get unread message count for owner
messageRouter.get('/owner/unread-count', getUnreadCount);

// Mark a message as read
messageRouter.put('/:id/read', markMessageAsRead);

// Delete a message (owner only)
messageRouter.delete('/:id', deleteMessage);

export default messageRouter;
