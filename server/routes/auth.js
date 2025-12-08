import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  authenticate, 
  checkDashboardAccess, 
  forgotPassword,
  resetPassword,
  verifyResetToken,
  updateProfile 
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register); // Keep original endpoint
router.post('/signup', register);   // Add alias to match client expectations
router.post('/login', login);

// Password reset routes (public)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

// Protected routes - all use the authenticate middleware
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.get('/dashboard-access', authenticate, checkDashboardAccess);

export default router;
