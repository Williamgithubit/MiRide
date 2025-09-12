import express from 'express';
import { register, login, getCurrentUser, authenticate, checkDashboardAccess, requestPasswordReset, updateProfile } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register); // Keep original endpoint
router.post('/signup', register);   // Add alias to match client expectations
router.post('/login', login);
router.post('/reset-password-request', requestPasswordReset);

// Protected routes - all use the authenticate middleware
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.get('/dashboard-access', authenticate, checkDashboardAccess);

export default router;
