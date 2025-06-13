import express from 'express';
import { body } from 'express-validator';
import { 
  createChat, 
  getChats, 
  getChatById, 
  markChatAsRead 
} from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All chat routes require authentication
router.use(authenticateToken);

// Create new chat
router.post('/', [
  body('participantId')
    .notEmpty()
    .withMessage('Participant ID is required')
    .isMongoId()
    .withMessage('Invalid participant ID')
], createChat);

// Get all chats for current user
router.get('/', getChats);

// Get specific chat
router.get('/:chatId', getChatById);

// Mark chat as read
router.put('/:chatId/read', markChatAsRead);

export default router;