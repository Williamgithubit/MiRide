import express from "express";
import { authenticate, authorize } from "../controllers/authController.js";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkUserAction,
  getUserStats,
  createUser,
  resetUserPassword,
  updateUserEmail,
} from "../controllers/userManagementController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply admin authorization to all routes
router.use(authorize(["admin"]));

// Get paginated users list with filters
router.get("/", getUsers);

// Get user statistics
router.get("/stats", getUserStats);

// Get single user by ID
router.get("/:userId", getUserById);

// Create new user
router.post("/", createUser);

// Update user
router.put("/:userId", updateUser);

// Reset user password (admin only)
router.put("/:userId/reset-password", resetUserPassword);

// Update user email (admin only)
router.put("/:userId/update-email", updateUserEmail);

// Delete user
router.delete("/:userId", deleteUser);

// Toggle user status (activate/deactivate)
router.patch("/:userId/status", toggleUserStatus);

// Bulk actions on users
router.post("/bulk", bulkUserAction);

export default router;
