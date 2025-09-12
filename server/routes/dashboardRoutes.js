import express from 'express';
import { authenticate, authorize } from '../controllers/authController.js';
import {
  getAdminStats,
  getOwnerStats,
  getRevenueData,
  getCarUtilizationData,
  generateReport,
  getPlatformSettings,
  updatePlatformSettings
} from '../controllers/dashboardController.js';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

// Admin dashboard routes
router.get('/stats/admin', authorize(['admin']), getAdminStats);

// Owner dashboard routes (accessible by both owners and admins)
router.get('/owner-stats', authorize(['owner', 'admin']), getOwnerStats);
router.get('/stats/owner', authorize(['owner', 'admin']), getOwnerStats);
router.get('/owner/:ownerId', authorize(['owner', 'admin']), getOwnerStats);

// Revenue charts data
router.get('/revenue-data', authorize(['owner', 'admin']), getRevenueData);
router.get('/revenue/data', authorize(['owner', 'admin']), getRevenueData);

// Car utilization data
router.get('/cars/utilization', authorize(['owner', 'admin']), getCarUtilizationData);

// Generate reports (admin only)
router.get('/reports/generate', authorize(['admin']), generateReport);

// Platform settings (admin only)
router.get('/settings', authorize(['admin']), getPlatformSettings);
router.put('/settings', authorize(['admin']), updatePlatformSettings);

export default router;