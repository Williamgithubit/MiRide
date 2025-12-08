import express from "express";
const router = express.Router();
import db from "../models/index.js";
const { User, Notification } = db;
import { authenticate, authorize } from "../controllers/authController.js";
import { avatarUpload } from "../utils/cloudinaryAvatarConfig.js";
import { logoUpload } from "../utils/cloudinaryLogoConfig.js";
import {
  getAllBookings,
  getBookingById,
  updateBookingStatus as updateAdminBookingStatus,
} from "../controllers/adminBookingController.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkUserAction,
  getUserStats,
} from "../controllers/userManagementController.js";
import {
  getCars,
  getCarById,
  updateCar,
  deleteCar,
  updateCarStatus,
  bulkCarAction,
  getCarStats,
  getOwners,
} from "../controllers/carManagementController.js";
import {
  getPaymentStats,
  getTransactions,
  getTransaction,
  exportTransactions,
} from "../controllers/adminPaymentsController.js";
import {
  getAllNotifications,
  sendNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
  deleteNotification,
  bulkDeleteNotifications,
  clearAllNotifications,
  getNotificationStats,
} from "../controllers/adminNotificationsController.js";
import {
  getAdminSettings,
  updateAdminProfile,
  changeAdminPassword,
  uploadProfilePicture,
  updatePlatformConfig,
  updateNotificationPreferences,
  updateSecuritySettings,
  revokeAllSessions,
  updateSystemControls,
  triggerBackup,
  clearCache,
  resetMetrics,
} from "../controllers/adminSettingsController.js";
import {
  getUserReport,
  getCarReport,
  getBookingReport,
  getRevenueReport,
  getActivityLogs,
  getGeneratedReports,
  exportReport,
} from "../controllers/adminReportsController.js";

// Middleware to ensure user is an admin
const ensureAdmin = (req, res, next) => {
  if (req.userRole === "admin") {
    next();
  } else {
    console.log("Admin access denied for user role:", req.userRole);
    res.status(403).json({ message: "Access denied. Admin role required." });
  }
};

// User Management Routes
router.get("/users", authenticate, getUsers);
router.get("/users/stats", authenticate, getUserStats);
router.get("/users/:userId", authenticate, getUserById);
router.post("/users", authenticate, createUser);
router.put("/users/:userId", authenticate, updateUser);
router.delete("/users/:userId", authenticate, deleteUser);
router.patch("/users/:userId/status", authenticate, toggleUserStatus);
router.post("/users/bulk", authenticate, bulkUserAction);

// Car Management Routes
router.get("/cars", authenticate, getCars);
router.get("/cars/stats", authenticate, getCarStats);
router.get("/cars/owners", authenticate, getOwners);
router.get("/cars/:carId", authenticate, getCarById);
router.put("/cars/:carId", authenticate, updateCar);
router.delete("/cars/:carId", authenticate, deleteCar);
router.patch("/cars/:carId/status", authenticate, updateCarStatus);
router.post("/cars/bulk", authenticate, bulkCarAction);

// Admin Booking Management Routes
router.get("/bookings", authenticate, ensureAdmin, getAllBookings);
router.get("/bookings/:bookingId", authenticate, ensureAdmin, getBookingById);
router.patch(
  "/bookings/:bookingId/status",
  authenticate,
  ensureAdmin,
  updateAdminBookingStatus
);

// Admin Notification Management Routes
router.get("/notifications", authenticate, ensureAdmin, getAllNotifications);
router.get(
  "/notifications/stats",
  authenticate,
  ensureAdmin,
  getNotificationStats
);
router.post("/notifications/send", authenticate, ensureAdmin, sendNotification);
router.patch(
  "/notifications/:id/read",
  authenticate,
  ensureAdmin,
  markNotificationAsRead
);
router.patch(
  "/notifications/:id/unread",
  authenticate,
  ensureAdmin,
  markNotificationAsUnread
);
router.delete(
  "/notifications/:id",
  authenticate,
  ensureAdmin,
  deleteNotification
);
router.post(
  "/notifications/bulk-delete",
  authenticate,
  ensureAdmin,
  bulkDeleteNotifications
);
router.delete(
  "/notifications/clear-all",
  authenticate,
  ensureAdmin,
  clearAllNotifications
);

// Admin Settings Routes
router.get("/settings", authenticate, ensureAdmin, getAdminSettings);
router.put("/profile", authenticate, ensureAdmin, updateAdminProfile);
router.put("/profile/password", authenticate, ensureAdmin, changeAdminPassword);
router.post("/profile/picture", authenticate, ensureAdmin, avatarUpload.single('profilePicture'), uploadProfilePicture);
router.put("/platform-config", authenticate, ensureAdmin, updatePlatformConfig);
router.post("/platform-config/logo", authenticate, ensureAdmin, logoUpload.single('companyLogo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No logo file provided" });
    }
    
    // Get the Cloudinary URL from the uploaded file
    const logoUrl = req.file.path;
    
    // Update platform config with new logo
    let setting = await db.Settings.findOne({ where: { key: "platform_config" } });
    if (setting) {
      const updatedValue = { ...setting.value, companyLogo: logoUrl };
      await setting.update({ value: updatedValue });
    }
    
    return res.status(200).json({ 
      message: "Company logo uploaded successfully",
      companyLogo: logoUrl 
    });
  } catch (error) {
    console.error("Error uploading company logo:", error);
    return res.status(500).json({ message: "Failed to upload company logo" });
  }
});
router.put("/notification-preferences", authenticate, ensureAdmin, updateNotificationPreferences);
router.put("/security-settings", authenticate, ensureAdmin, updateSecuritySettings);
router.post("/revoke-sessions", authenticate, ensureAdmin, revokeAllSessions);
router.put("/system-controls", authenticate, ensureAdmin, updateSystemControls);
router.post("/backup", authenticate, ensureAdmin, triggerBackup);
router.post("/clear-cache", authenticate, ensureAdmin, clearCache);
router.post("/reset-metrics", authenticate, ensureAdmin, resetMetrics);

// Get admin dashboard stats
router.get("/dashboard/stats", authenticate, ensureAdmin, async (req, res) => {
  try {
    // Count users by role
    const totalUsers = await User.count();
    const adminCount = await User.count({ where: { role: "admin" } });
    const ownerCount = await User.count({ where: { role: "owner" } });
    const customerCount = await User.count({ where: { role: "customer" } });

    // You would add more stats here based on your models
    // For example, car counts, rental counts, revenue, etc.

    res.json({
      totalUsers,
      usersByRole: {
        admin: adminCount,
        owner: ownerCount,
        customer: customerCount,
      },
      // Add more stats as needed
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin Payment Management Routes
router.get("/payments/stats", authenticate, ensureAdmin, getPaymentStats);
router.get(
  "/payments/transactions",
  authenticate,
  ensureAdmin,
  getTransactions
);
router.get(
  "/payments/transactions/:id",
  authenticate,
  ensureAdmin,
  getTransaction
);
router.get("/payments/export", authenticate, ensureAdmin, exportTransactions);

// Admin Reports Routes
router.get("/reports/users", authenticate, ensureAdmin, getUserReport);
router.get("/reports/cars", authenticate, ensureAdmin, getCarReport);
router.get("/reports/bookings", authenticate, ensureAdmin, getBookingReport);
router.get("/reports/revenue", authenticate, ensureAdmin, getRevenueReport);
router.get("/reports/activity", authenticate, ensureAdmin, getActivityLogs);
router.get(
  "/reports/generated",
  authenticate,
  ensureAdmin,
  getGeneratedReports
);
router.post("/reports/export", authenticate, ensureAdmin, exportReport);

export default router;
