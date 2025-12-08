import db from "../models/index.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

// Helper function to get or create a setting
const getOrCreateSetting = async (key, defaultValue, category, description) => {
  let setting = await db.Settings.findOne({ where: { key } });
  if (!setting) {
    setting = await db.Settings.create({
      key,
      value: defaultValue,
      category,
      description,
    });
  }
  return setting;
};

// Get all admin settings (profile, platform config, notifications, security, system)
export const getAdminSettings = async (req, res) => {
  try {
    const adminId = req.userId;

    // Get admin profile
    const admin = await db.User.findByPk(adminId, {
      attributes: ["id", "name", "email", "phone", "role", "avatar", "address", "twoFactorEnabled"],
    });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    // Get platform config
    const platformConfigSetting = await getOrCreateSetting(
      "platform_config",
      {
        companyName: "MiRide Rental Service",
        companyLogo: null,
        defaultCurrency: "USD",
        taxPercentage: 10,
        serviceFeePercentage: 15,
        supportEmail: "support@miride.com",
        supportPhone: "+1 (555) 123-4567",
        companyAddress: "123 Main Street, City, Country",
        commissionRate: 15,
        minBookingDuration: 1,
        maxBookingDuration: 30,
        cancellationPolicyHours: 24,
        lateFeePercentage: 10,
      },
      "platform",
      "Platform-wide configuration settings"
    );

    // Get notification preferences
    const notificationSetting = await getOrCreateSetting(
      "notification_preferences",
      {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        inAppNotifications: true,
        newBookings: true,
        ownerRegistrations: true,
        paymentConfirmations: true,
        systemUpdates: true,
      },
      "notification",
      "Admin notification preferences"
    );

    // Get system controls
    const systemControlsSetting = await getOrCreateSetting(
      "system_controls",
      {
        maintenanceMode: false,
        systemVersion: "v1.0.0",
        apiHealthStatus: "healthy",
        uptime: calculateUptime(),
        lastBackup: null,
      },
      "system",
      "System control settings"
    );

    // Update uptime in system controls
    const systemControls = systemControlsSetting.value;
    systemControls.uptime = calculateUptime();

    // Get login history (mock data for now - can be enhanced with actual login tracking)
    const loginHistory = await getLoginHistory(adminId);

    // Get active sessions (mock data for now)
    const activeSessions = await getActiveSessions(adminId);

    const response = {
      profile: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone || "",
        role: admin.role,
        profilePicture: admin.avatar || "",
        address: admin.address || "",
      },
      platformConfig: platformConfigSetting.value,
      notificationPreferences: notificationSetting.value,
      securitySettings: {
        twoFactorEnabled: admin.twoFactorEnabled || false,
        lastLoginHistory: loginHistory,
        activeSessions: activeSessions,
      },
      systemControls: systemControls,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return res.status(500).json({ message: "Failed to fetch admin settings" });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.userId;
    const { name, email, phone, address, profilePicture } = req.body;

    const admin = await db.User.findByPk(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    // Validate email uniqueness if changed
    if (email && email !== admin.email) {
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update profile
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (profilePicture !== undefined) updates.avatar = profilePicture;

    await admin.update(updates);

    return res.status(200).json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      profilePicture: admin.avatar,
      address: admin.address,
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

// Change admin password
export const changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    const admin = await db.User.findByPk(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password (will be hashed by model hook)
    await admin.update({ password: newPassword });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Failed to change password" });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const adminId = req.userId;
    
    // Check if file was uploaded
    if (!req.file && !req.body.profilePicture) {
      return res.status(400).json({ message: "No image provided" });
    }

    const admin = await db.User.findByPk(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    // If using base64 image from body
    let imageUrl = req.body.profilePicture;
    
    // If using file upload (multer), handle cloudinary upload here
    if (req.file) {
      // Assuming cloudinary is configured
      // imageUrl = req.file.path or cloudinary URL
      imageUrl = req.file.path;
    }

    await admin.update({ avatar: imageUrl });

    return res.status(200).json({ 
      message: "Profile picture updated successfully",
      profilePicture: imageUrl 
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({ message: "Failed to upload profile picture" });
  }
};

// Update platform configuration
export const updatePlatformConfig = async (req, res) => {
  try {
    const configData = req.body;

    // Validate required fields
    if (configData.commissionRate !== undefined) {
      if (configData.commissionRate < 0 || configData.commissionRate > 100) {
        return res.status(400).json({ message: "Commission rate must be between 0 and 100" });
      }
    }

    if (configData.taxPercentage !== undefined) {
      if (configData.taxPercentage < 0 || configData.taxPercentage > 100) {
        return res.status(400).json({ message: "Tax percentage must be between 0 and 100" });
      }
    }

    // Get or create platform config setting
    let setting = await db.Settings.findOne({ where: { key: "platform_config" } });
    
    if (!setting) {
      setting = await db.Settings.create({
        key: "platform_config",
        value: configData,
        category: "platform",
        description: "Platform-wide configuration settings",
      });
    } else {
      // Merge with existing config
      const updatedValue = { ...setting.value, ...configData };
      await setting.update({ value: updatedValue });
    }

    return res.status(200).json(setting.value);
  } catch (error) {
    console.error("Error updating platform config:", error);
    return res.status(500).json({ message: "Failed to update platform configuration" });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const preferences = req.body;

    let setting = await db.Settings.findOne({ where: { key: "notification_preferences" } });
    
    if (!setting) {
      setting = await db.Settings.create({
        key: "notification_preferences",
        value: preferences,
        category: "notification",
        description: "Admin notification preferences",
      });
    } else {
      const updatedValue = { ...setting.value, ...preferences };
      await setting.update({ value: updatedValue });
    }

    return res.status(200).json(setting.value);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return res.status(500).json({ message: "Failed to update notification preferences" });
  }
};

// Update security settings (2FA toggle)
export const updateSecuritySettings = async (req, res) => {
  try {
    const adminId = req.userId;
    const { twoFactorEnabled } = req.body;

    const admin = await db.User.findByPk(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    // Update 2FA setting
    await admin.update({ twoFactorEnabled: Boolean(twoFactorEnabled) });

    // Get login history and active sessions
    const loginHistory = await getLoginHistory(adminId);
    const activeSessions = await getActiveSessions(adminId);

    return res.status(200).json({
      twoFactorEnabled: admin.twoFactorEnabled,
      lastLoginHistory: loginHistory,
      activeSessions: activeSessions,
    });
  } catch (error) {
    console.error("Error updating security settings:", error);
    return res.status(500).json({ message: "Failed to update security settings" });
  }
};

// Revoke all sessions
export const revokeAllSessions = async (req, res) => {
  try {
    const adminId = req.userId;

    // In a production environment, you would:
    // 1. Invalidate all JWT tokens for this user
    // 2. Clear session store entries
    // 3. Update a token version/blacklist

    // For now, we'll just return success
    // The frontend should redirect to login after this

    return res.status(200).json({ 
      message: "All sessions revoked successfully",
      requiresRelogin: true 
    });
  } catch (error) {
    console.error("Error revoking sessions:", error);
    return res.status(500).json({ message: "Failed to revoke sessions" });
  }
};

// Update system controls
export const updateSystemControls = async (req, res) => {
  try {
    const controlsData = req.body;

    let setting = await db.Settings.findOne({ where: { key: "system_controls" } });
    
    if (!setting) {
      setting = await db.Settings.create({
        key: "system_controls",
        value: {
          maintenanceMode: false,
          systemVersion: "v1.0.0",
          apiHealthStatus: "healthy",
          uptime: calculateUptime(),
          lastBackup: null,
          ...controlsData,
        },
        category: "system",
        description: "System control settings",
      });
    } else {
      const updatedValue = { ...setting.value, ...controlsData };
      await setting.update({ value: updatedValue });
    }

    return res.status(200).json(setting.value);
  } catch (error) {
    console.error("Error updating system controls:", error);
    return res.status(500).json({ message: "Failed to update system controls" });
  }
};

// Trigger database backup
export const triggerBackup = async (req, res) => {
  try {
    // In a production environment, this would trigger an actual backup process
    // For now, we'll simulate the backup and update the lastBackup timestamp

    const timestamp = new Date().toISOString();

    let setting = await db.Settings.findOne({ where: { key: "system_controls" } });
    
    if (setting) {
      const updatedValue = { ...setting.value, lastBackup: timestamp };
      await setting.update({ value: updatedValue });
    }

    // Simulate backup process delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return res.status(200).json({ 
      message: "Backup completed successfully",
      timestamp: timestamp 
    });
  } catch (error) {
    console.error("Error triggering backup:", error);
    return res.status(500).json({ message: "Failed to trigger backup" });
  }
};

// Clear system cache
export const clearCache = async (req, res) => {
  try {
    // In a production environment, this would clear various caches
    // (Redis, in-memory caches, etc.)

    return res.status(200).json({ 
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return res.status(500).json({ message: "Failed to clear cache" });
  }
};

// Reset system metrics
export const resetMetrics = async (req, res) => {
  try {
    // In a production environment, this would reset various metrics
    // (counters, gauges, etc.)

    return res.status(200).json({ 
      message: "Metrics reset successfully",
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Error resetting metrics:", error);
    return res.status(500).json({ message: "Failed to reset metrics" });
  }
};

// Helper function to calculate uptime
const calculateUptime = () => {
  const startTime = process.uptime();
  const days = Math.floor(startTime / 86400);
  const hours = Math.floor((startTime % 86400) / 3600);
  const minutes = Math.floor((startTime % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

// Helper function to get login history
const getLoginHistory = async (userId) => {
  // In a production environment, you would track login events in a separate table
  // For now, return mock data
  return [
    {
      id: "1",
      ipAddress: "192.168.1.1",
      device: "Chrome on Windows",
      location: "New York, US",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      ipAddress: "192.168.1.2",
      device: "Safari on macOS",
      location: "Los Angeles, US",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
};

// Helper function to get active sessions
const getActiveSessions = async (userId) => {
  // In a production environment, you would track active sessions
  // For now, return mock data with current session
  return [
    {
      id: "current",
      device: "Current Browser",
      ipAddress: "Current IP",
      lastActive: new Date().toISOString(),
      isCurrent: true,
    },
  ];
};
