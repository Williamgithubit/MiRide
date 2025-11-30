import express from 'express';
import { authenticate, authorize } from '../controllers/authController.js';
import {
  getCustomerStats,
  getAdminStats,
  getOwnerStats,
  getPublicOwnerStats,
  getRevenueData,
  getCarUtilizationData,
  generateReport,
  getPlatformSettings,
  updatePlatformSettings,
  getOwnerAnalytics
} from '../controllers/dashboardController.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public-owner-stats/:ownerId', getPublicOwnerStats);
router.post('/public-owner-stats', getPublicOwnerStats);

// Apply authentication middleware to all other dashboard routes
router.use(authenticate);

// Customer dashboard routes
router.get('/customer-stats', authorize(['customer']), getCustomerStats);

// Admin dashboard routes
router.get('/stats/admin', authorize(['admin']), getAdminStats);

// Owner dashboard routes (accessible by both owners and admins)
router.get('/owner-stats', authorize(['owner', 'admin']), getOwnerStats);
router.get('/stats/owner', authorize(['owner', 'admin']), getOwnerStats);
router.get('/owner/:ownerId', authorize(['owner', 'admin']), getOwnerStats);

// Debug route to test authentication
router.get('/debug/auth', authenticate, (req, res) => {
  res.json({
    userId: req.userId,
    userRole: req.userRole,
    userFromToken: req.user?.role,
    userObject: req.user ? {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    } : null
  });
});

// Public owner stats (no authorization required - public info)
router.get('/public-owner-stats/:ownerId', getPublicOwnerStats);
router.post('/public-owner-stats', getPublicOwnerStats);

// Owner analytics route
router.get('/owner/analytics', authorize(['owner', 'admin']), getOwnerAnalytics);

// Revenue charts data
router.get('/revenue-data', authorize(['owner', 'admin']), getRevenueData);

// Car utilization data
router.get('/cars/utilization', authorize(['owner', 'admin']), getCarUtilizationData);

// Generate reports (admin only)
router.get('/reports/generate', authorize(['admin']), generateReport);

// Platform settings (admin only)
router.get('/settings', authorize(['admin']), getPlatformSettings);
router.put('/settings', authorize(['admin']), updatePlatformSettings);

export default router;