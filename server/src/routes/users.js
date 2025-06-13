import express from 'express';
import { 
  getUsers, 
  getUserById, 
  updateProfile 
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Get all users (with search)
router.get('/', getUsers);

// Get user by ID
router.get('/:userId', getUserById);

// Update profile
router.put('/profile', [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio')
    .optional()
    .isLength({ max: 139 })
    .withMessage('Bio cannot exceed 139 characters'),
  body('avatar')
    .optional()
    .isString()
    .withMessage('Avatar must be a string')
], updateProfile);

export default router;