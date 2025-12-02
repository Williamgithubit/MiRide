import express from 'express';
import { createAdminUser, healthCheck, verifyPassword } from '../controllers/adminSetupController.js';

const router = express.Router();

// Health check endpoint
router.get('/health', healthCheck);

// Create or update admin user (protected by secret key)
router.post('/create-admin', createAdminUser);

// Verify password for debugging (protected by secret key)
router.post('/verify-password', verifyPassword);

export default router;
