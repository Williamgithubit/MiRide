import express from 'express';
const router = express.Router();
import db from '../models/index.js';
const { User, Notification } = db;
import { authenticate, authorize } from '../controllers/authController.js';
import {
  getAllBookings,
  getBookingById,
  updateBookingStatus as updateAdminBookingStatus
} from '../controllers/adminBookingController.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkUserAction,
  getUserStats
} from '../controllers/userManagementController.js';
import {
  getCars,
  getCarById,
  updateCar,
  deleteCar,
  updateCarStatus,
  bulkCarAction,
  getCarStats,
  getOwners
} from '../controllers/carManagementController.js';

// Middleware to ensure user is an admin
const ensureAdmin = (req, res, next) => {
  if (req.userRole === 'admin') {
    next();
  } else {
    console.log('Admin access denied for user role:', req.userRole);
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// User Management Routes
router.get('/users', authenticate, getUsers);
router.get('/users/stats', authenticate, getUserStats);
router.get('/users/:userId', authenticate, getUserById);
router.post('/users', authenticate, createUser);
router.put('/users/:userId', authenticate, updateUser);
router.delete('/users/:userId', authenticate, deleteUser);
router.patch('/users/:userId/status', authenticate, toggleUserStatus);
router.post('/users/bulk', authenticate, bulkUserAction);

// Car Management Routes
router.get('/cars', authenticate, getCars);
router.get('/cars/stats', authenticate, getCarStats);
router.get('/cars/owners', authenticate, getOwners);
router.get('/cars/:carId', authenticate, getCarById);
router.put('/cars/:carId', authenticate, updateCar);
router.delete('/cars/:carId', authenticate, deleteCar);
router.patch('/cars/:carId/status', authenticate, updateCarStatus);
router.post('/cars/bulk', authenticate, bulkCarAction);

// Admin Booking Management Routes
router.get('/bookings', authenticate, ensureAdmin, getAllBookings);
router.get('/bookings/:bookingId', authenticate, ensureAdmin, getBookingById);
router.patch('/bookings/:bookingId/status', authenticate, ensureAdmin, updateAdminBookingStatus);

// Get notifications (admin only)
router.get('/notifications', authenticate, ensureAdmin, async (req, res) => {
  try {
    // Check if Notification model exists, if not return empty array
    if (!Notification) {
      return res.json([]);
    }
    
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Booking Management Routes
router.get('/bookings', authenticate, ensureAdmin, getAllBookings);
router.get('/bookings/:bookingId', authenticate, ensureAdmin, getBookingById);
router.patch('/bookings/:bookingId/status', authenticate, ensureAdmin, updateAdminBookingStatus);

// Get admin dashboard stats
router.get('/dashboard/stats', authenticate, ensureAdmin, async (req, res) => {
  try {
    // Count users by role
    const totalUsers = await User.count();
    const adminCount = await User.count({ where: { role: 'admin' } });
    const ownerCount = await User.count({ where: { role: 'owner' } });
    const customerCount = await User.count({ where: { role: 'customer' } });
    
    // You would add more stats here based on your models
    // For example, car counts, rental counts, revenue, etc.
    
    res.json({
      totalUsers,
      usersByRole: {
        admin: adminCount,
        owner: ownerCount,
        customer: customerCount
      },
      // Add more stats as needed
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
