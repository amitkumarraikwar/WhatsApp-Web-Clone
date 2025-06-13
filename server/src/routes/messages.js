import express from 'express';
import { body } from 'express-validator';
import { 
  sendMessage, 
  getMessages, 
  markMessageAsRead 
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All message routes require authentication
router.use(authenticateToken);

// Send message
router.post('/', [
  body('chatId')
    .notEmpty()
    .withMessage('Chat ID is required')
    .isMongoId()
    .withMessage('Invalid chat ID'),
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'emoji'])
    .withMessage('Invalid message type')
], sendMessage);

// Get messages for a chat
router.get('/:chatId', getMessages);

// Mark message as read
router.put('/:messageId/read', markMessageAsRead);

export default router;