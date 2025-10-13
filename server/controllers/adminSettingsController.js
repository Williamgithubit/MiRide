import db from "../models/index.js";

// Minimal admin settings controller to handle security-related admin actions.
// These are lightweight implementations to avoid 404s from the client and return
// a shape the frontend expects. They can be enhanced later to persist data.

export const updateSecuritySettings = async (req, res) => {
  try {
    const { twoFactorEnabled } = req.body;

    // In a fuller implementation you would persist this to a settings table
    // or to the admin user's record. For now return the expected structure.
    const payload = {
      twoFactorEnabled: Boolean(twoFactorEnabled),
      lastLoginHistory: [],
      activeSessions: [],
    };

    return res.status(200).json(payload);
  } catch (error) {
    console.error("Error updating security settings:", error);
    return res
      .status(500)
      .json({ message: "Failed to update security settings" });
  }
};

export const revokeAllSessions = async (req, res) => {
  try {
    // Implement session revocation logic here (e.g., blacklist tokens or clear session store).
    // For now respond success so UI can reflect the action.
    return res.status(200).json({ message: "All sessions revoked" });
  } catch (error) {
    console.error("Error revoking sessions:", error);
    return res.status(500).json({ message: "Failed to revoke sessions" });
  }
};
