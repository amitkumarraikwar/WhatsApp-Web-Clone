import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  refreshToken, 
  logout, 
  getProfile 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register route
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], register);

// Login route
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], login);

// Refresh token route
router.post('/refresh', refreshToken);

// Logout route (protected)
router.post('/logout', authenticateToken, logout);

// Get profile route (protected)
router.get('/profile', authenticateToken, getProfile);

export default router;