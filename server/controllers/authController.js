import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Op } from "sequelize";
import { sendPasswordResetEmail } from "../utils/sendEmail.js";

// SECURITY: JWT_SECRET must be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error(" CRITICAL: JWT_SECRET environment variable is not set!");
  console.error("   Please set JWT_SECRET in your .env file for security.");
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET environment variable is required in production"
    );
  }
}

// Helper function to handle legacy user login from Customer model
const handleLegacyLogin = async (legacyUser, password, res) => {
  try {
    // Check if user is active
    if (legacyUser.isActive === false) {
      return res.status(403).json({
        message:
          "Your account has been disabled. Please contact support for assistance.",
        errorCode: "ACCOUNT_DISABLED",
      });
    }

    // Check password
    let isPasswordValid = false;

    if (typeof legacyUser.validatePassword === "function") {
      isPasswordValid = await legacyUser.validatePassword(password);
    } else {
      isPasswordValid = await bcrypt.compare(password, legacyUser.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        message:
          'Incorrect password. Please try again or use "Forgot Password" to reset it.',
        errorCode: "INVALID_PASSWORD",
      });
    }

    // Update last login time
    await legacyUser.update({ lastLogin: new Date() });

    // Create token
    const token = jwt.sign(
      {
        id: legacyUser.id,
        email: legacyUser.email,
        role: legacyUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" } // Extend token expiration to 7 days
    );

    // Return user data (excluding password) and token
    const userData = legacyUser.toJSON();
    delete userData.password;

    return res.status(200).json({
      message: "Login successful",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Legacy login error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// JWT Secret and authentication functions

// Register a new user
export const register = async (req, res) => {
  console.log(
    "Registration request received with body:",
    JSON.stringify(req.body)
  );

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    role = "customer",
    // Additional profile fields
    address,
    driverLicense, // Customer fields
    businessName,
    businessAddress,
    taxId,
    businessPhone,
    businessEmail, // Owner fields
  } = req.body;

  const name =
    req.body.name ||
    (firstName ? `${firstName} ${lastName || ""}`.trim() : undefined);
  console.log("Extracted fields:", { name, email, phone, role });

  // Validate required fields
  if (!name) {
    console.error("Registration failed: name is missing or null");
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    // Check if user already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Create new user with specified role (default to customer if not specified)
    // Only allow admin creation if request is from an existing admin
    let userRole = role;

    console.log(`Processing registration with requested role: ${role}`);

    // Explicitly allow 'customer' and 'owner' roles without restrictions
    if (role === "customer" || role === "owner") {
      userRole = role; // Keep the requested role as is
      console.log(`Allowing requested role: ${userRole}`);
    }
    // Restrict 'admin' role creation - only allow if requested by an existing admin
    else if (role === "admin") {
      // Check if request has a valid admin token
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        userRole = "customer"; // Default to customer if no token
        console.log(
          "Admin role requested without token, defaulting to: customer"
        );
      } else {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const requestingUser = await db.User.findByPk(decoded.id);

          // Only allow admin creation if requesting user is an admin
          if (!requestingUser || requestingUser.role !== "admin") {
            userRole = "customer";
            console.log(
              "Admin role requested by non-admin user, defaulting to: customer"
            );
          }
        } catch (error) {
          userRole = "customer";
          console.log("Error verifying admin token, defaulting to: customer");
        }
      }
    }
    // For any other role values, default to customer
    else {
      userRole = "customer";
      console.log(`Unrecognized role '${role}', defaulting to: customer`);
    }

    // Use a transaction to ensure all operations succeed or fail together
    const result = await db.sequelize.transaction(async (t) => {
      // Create the new user with hashed password
      const newUser = await db.User.create(
        {
          name,
          email,
          password, // Will be hashed in the model's beforeCreate hook
          phone,
          role: userRole,
          isActive: true,
        },
        { transaction: t }
      );

      // Create the appropriate profile based on role
      if (userRole === "customer") {
        await db.CustomerProfile.create(
          {
            userId: newUser.id,
            driverLicense,
            address,
          },
          { transaction: t }
        );
      } else if (userRole === "owner") {
        await db.OwnerProfile.create(
          {
            userId: newUser.id,
            businessName,
            businessAddress,
            taxId,
            businessPhone: businessPhone || phone,
            businessEmail: businessEmail || email,
          },
          { transaction: t }
        );
      }

      return newUser;
    });

    // Create token
    const token = jwt.sign(
      { id: result.id, email: result.email, role: result.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user data (excluding password) and token
    const userData = result.toJSON();
    delete userData.password;

    return res.status(201).json({
      message: "User registered successfully",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    console.error("   Stack:", error.stack);
    console.error("   Full error:", JSON.stringify(error, null, 2));
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt for email:", email);

  // Validate input
  if (!email || !email.trim()) {
    return res.status(400).json({
      message: "Email address is required",
      errorCode: "EMAIL_REQUIRED",
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "Password is required",
      errorCode: "PASSWORD_REQUIRED",
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    console.log("🔐 LOGIN ATTEMPT");
    console.log("  Email (raw):", email);
    console.log("  Email (normalized):", normalizedEmail);
    console.log("  Password length:", password ? password.length : 0);
    console.log("  Password provided:", !!password);

    // First, try simple find without includes to verify user exists
    let user = await db.User.findOne({
      where: { email: normalizedEmail },
      raw: false,
    });

    console.log(
      "User found:",
      user ? "Yes" : "No",
      user ? `ID: ${user.id}` : ""
    );

    // If user not found in User model, check legacy Customer model
    if (!user) {
      console.log(
        "User not found in User model, checking legacy Customer model..."
      );
      if (db.Customer) {
        const legacyUser = await db.Customer.findOne({
          where: { email: normalizedEmail },
        });
        if (legacyUser) {
          console.log("User found in legacy Customer model");
          // Handle legacy user login
          return handleLegacyLogin(legacyUser, password, res);
        }
      }
      console.log("No account found for email:", normalizedEmail);
      return res.status(404).json({
        message: "No account found with this email address",
        errorCode: "USER_NOT_FOUND",
      });
    }

    // Now load the associations if we have a user
    if (user) {
      try {
        // Load customer profile if exists
        if (user.role === "customer") {
          user.customerProfile = await db.CustomerProfile.findOne({
            where: { userId: user.id },
          });
        }
        // Load owner profile if exists
        if (user.role === "owner") {
          user.ownerProfile = await db.OwnerProfile.findOne({
            where: { userId: user.id },
          });
        }
      } catch (profileError) {
        console.warn("Warning loading profiles:", profileError.message);
        // Continue anyway, profiles are optional
      }
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({
        message:
          "Your account has been disabled. Please contact support for assistance.",
        errorCode: "ACCOUNT_DISABLED",
      });
    }

    // Check if email is verified (if verification is required)
    if (
      user.emailVerified === false &&
      process.env.REQUIRE_EMAIL_VERIFICATION === "true"
    ) {
      return res.status(403).json({
        message:
          "Please verify your email address before logging in. Check your inbox for the verification link.",
        errorCode: "EMAIL_NOT_VERIFIED",
      });
    }

    // Check password
    let isPasswordValid = false;

    console.log("About to validate password...");
    console.log("User password hash exists:", !!user.password);
    console.log("Password provided:", !!password);

    if (typeof user.validPassword === "function") {
      console.log("Using validPassword method");
      isPasswordValid = await user.validPassword(password);
    } else {
      // Fallback to direct bcrypt comparison
      console.log("Using bcrypt.compare fallback");
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    console.log("Password validation result:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Invalid password for user:", user.email);
      return res.status(401).json({
        message:
          'Incorrect password. Please try again or use "Forgot Password" to reset it.',
        errorCode: "INVALID_PASSWORD",
      });
    }

    // Update last login time if the field exists
    if ("lastLogin" in user) {
      await user.update({ lastLogin: new Date() });
    }

    // Prepare user data with profile information
    let userData = user.toJSON();
    delete userData.password;

    // Add profile-specific data based on user role
    if (user.role === "customer" && user.customerProfile) {
      userData = {
        ...userData,
        driverLicense: user.customerProfile.driverLicense,
        address: user.customerProfile.address,
      };
    } else if (user.role === "owner" && user.ownerProfile) {
      userData = {
        ...userData,
        businessName: user.ownerProfile.businessName,
        businessAddress: user.ownerProfile.businessAddress,
        businessPhone: user.ownerProfile.businessPhone || user.phone,
        businessEmail: user.ownerProfile.businessEmail || user.email,
      };
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR");
    console.error("  Email:", email);
    console.error("  Error name:", error.name);
    console.error("  Error message:", error.message);
    console.error("  Error code:", error.code);
    if (error.message.includes("email")) {
      console.error("  ^ Error is related to email field");
    }
    if (error.message.includes("unique")) {
      console.error("  ^ Error is related to unique constraint");
    }
    console.error("  Error stack:", error.stack);
    return res.status(500).json({
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "An error occurred during login",
    });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    // User ID comes from the authenticated middleware
    const userId = req.userId;
    console.log(
      "Getting current user with ID:",
      userId,
      "Type:",
      typeof userId
    );

    // Try to find user in User model with profile data
    let user = null;

    try {
      user = await db.User.findByPk(userId, {
        attributes: { exclude: ["password"] },
        include: [
          { model: db.CustomerProfile, as: "customerProfile" },
          { model: db.OwnerProfile, as: "ownerProfile" },
        ],
      });

      if (user) {
        console.log(`User found in User model with ID: ${user.id}`);

        // Prepare user data with profile information
        let userData = user.toJSON();

        // Add profile-specific data based on user role
        if (user.role === "customer" && user.customerProfile) {
          userData = {
            ...userData,
            driverLicense: user.customerProfile.driverLicense,
            address: user.customerProfile.address,
          };
        } else if (user.role === "owner" && user.ownerProfile) {
          userData = {
            ...userData,
            businessName: user.ownerProfile.businessName,
            businessAddress: user.ownerProfile.businessAddress,
            businessPhone: user.ownerProfile.businessPhone || user.phone,
            businessEmail: user.ownerProfile.businessEmail || user.email,
          };
        }

        return res.status(200).json(userData);
      }
    } catch (userErr) {
      console.error("Error finding user in User model:", userErr);
    }

    // For backward compatibility, check the Customer model (if it exists)
    if (db.Customer) {
      try {
        const legacyUser = await db.Customer.findByPk(userId, {
          attributes: { exclude: ["password"] },
        });

        if (legacyUser) {
          console.log(
            `User found in legacy Customer model with ID: ${legacyUser.id}`
          );
          return res.status(200).json({
            ...legacyUser.toJSON(),
            _modelType: "legacy_customer",
          });
        }
      } catch (customerErr) {
        console.error("Error finding user in Customer model:", customerErr);
      }
    }

    console.error("User not found with ID:", userId);
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("Get current user error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("Authentication failed: No token provided");
      return res.status(401).json({ message: "Authentication required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log(
        "Token decoded successfully for user ID:",
        decoded.id,
        "Type:",
        typeof decoded.id
      );
    } catch (tokenError) {
      if (tokenError.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      if (tokenError.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      throw tokenError;
    }

    // Verify that the user exists in either Customer or User model
    let userExists = false;
    let userModel = null;
    let userObject = null;

    // Check User model (Customer model was removed, now using User model only)
    try {
      const user = await db.User.findByPk(decoded.id);
      if (user) {
        userExists = true;
        userModel = "user";
        userObject = user;
        console.log("User found in User model with ID:", decoded.id);
      }
    } catch (userErr) {
      console.error("Error checking User model:", userErr);
    }

    if (!userExists) {
      console.error(
        "Authentication failed: User not found with ID:",
        decoded.id
      );
      return res.status(401).json({ message: "User not found" });
    }

    // Set user ID, role, model, and user object in request for use in other middleware/routes
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userModel = userModel;
    req.user = userObject; // Add the full user object for compatibility

    console.log("Authentication successful for user:", {
      id: decoded.id,
      role: decoded.role,
      model: userModel,
    });
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Role-based access control middleware
export const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.userId || !req.userRole) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (roles.length && !roles.includes(req.userRole)) {
      return res
        .status(403)
        .json({ message: "Access forbidden: insufficient permissions" });
    }

    next();
  };
};

// Check if user can access dashboard
export const checkDashboardAccess = async (req, res) => {
  try {
    const userId = req.userId;

    // Try to find user in User model first (for admin users)
    let user = await db.User.findByPk(userId);
    let isAdmin = false;

    // If found in User model, check role
    if (user) {
      isAdmin = user.role === "admin";
    } else if (db.Customer) {
      // If not found in User model, try Customer model (if it exists)
      user = await db.Customer.findByPk(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For admin users, always grant access
    const canAccess =
      isAdmin ||
      (typeof user.canAccessDashboard === "function"
        ? user.canAccessDashboard()
        : user.role === "owner");

    return res.status(200).json({
      canAccess,
      dashboardType: isAdmin
        ? "admin"
        : user.role === "owner"
        ? "owner"
        : "customer",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Dashboard access check error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Forgot Password - Request password reset
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  console.log("[FORGOT_PASSWORD] Request received:", {
    email: email ? email.substring(0, 20) + "..." : "NONE",
    timestamp: new Date().toISOString(),
    ipAddress: req.ip,
  });

  // Validate email format
  if (!email || !email.trim()) {
    console.warn("[FORGOT_PASSWORD] Missing email address");
    return res.status(400).json({
      message: "Email address is required",
      errorCode: "EMAIL_REQUIRED",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    console.warn("[FORGOT_PASSWORD] Invalid email format:", email);
    return res.status(400).json({
      message: "Please enter a valid email address",
      errorCode: "INVALID_EMAIL",
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    console.log(
      "[FORGOT_PASSWORD] Searching for user with email:",
      normalizedEmail
    );

    // Try exact match first
    let user = await db.User.findOne({
      where: { email: normalizedEmail },
    });

    // If not found, try case-insensitive search using Sequelize.where and Sequelize.fn
    if (!user) {
      console.log(
        "[FORGOT_PASSWORD] Exact match not found, trying case-insensitive search"
      );
      user = await db.User.findOne({
        where: db.sequelize.where(
          db.sequelize.fn("LOWER", db.sequelize.col("email")),
          Op.eq,
          normalizedEmail
        ),
      });
    }

    console.log("[FORGOT_PASSWORD] User search result:", {
      userFound: !!user,
      userId: user ? user.id : null,
      userEmail: user ? user.email : null,
      userActive: user ? user.isActive : null,
      timestamp: new Date().toISOString(),
    });

    // For security, always return success message even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log(
        "[FORGOT_PASSWORD] Password reset requested for non-existent email:",
        email
      );
      return res.status(200).json({
        message:
          "If your email exists in our system, you will receive a password reset link",
        success: true,
      });
    }

    // Check if user account is active
    if (user.isActive === false) {
      console.log(
        "[FORGOT_PASSWORD] Password reset requested for disabled account:",
        {
          userId: user.id,
          email: user.email,
        }
      );
      return res.status(200).json({
        message:
          "If your email exists in our system, you will receive a password reset link",
        success: true,
      });
    }

    // Generate secure random reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log("[FORGOT_PASSWORD] Reset token generated:", {
      userId: user.id,
      tokenLength: resetToken.length,
      timestamp: new Date().toISOString(),
    });

    // Hash the token before storing in database for security
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token expiry to 1 hour from now
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    console.log("[FORGOT_PASSWORD] Updating user with reset token:", {
      userId: user.id,
      hashedTokenLength: hashedToken.length,
      expiresAt: resetExpires.toISOString(),
    });

    // Save hashed token and expiry to user record
    await user.update({
      passwordResetToken: hashedToken,
      passwordResetExpires: resetExpires,
    });

    console.log(
      "[FORGOT_PASSWORD] User updated successfully with reset token:",
      {
        userId: user.id,
        tokenSet: true,
      }
    );

    // Send password reset email with the unhashed token
    try {
      console.log("[FORGOT_PASSWORD] Preparing to send password reset email:", {
        userId: user.id,
        email: user.email,
        userName: user.name,
        tokenSet: !!resetToken,
        timestamp: new Date().toISOString(),
      });

      const emailResult = await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name
      );

      console.log("[FORGOT_PASSWORD] Password reset email sent successfully:", {
        userId: user.id,
        email: user.email,
        messageId: emailResult.messageId,
        timestamp: new Date().toISOString(),
      });
    } catch (emailError) {
      console.error("[FORGOT_PASSWORD] Failed to send password reset email:", {
        userId: user.id,
        email: user.email,
        errorName: emailError.name,
        errorMessage: emailError.message,
        errorCode: emailError.code,
        timestamp: new Date().toISOString(),
      });
      // Clear the reset token if email fails
      await user.update({
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      return res.status(500).json({
        message: "Failed to send password reset email. Please try again later.",
        errorCode: "EMAIL_SEND_FAILED",
        details: emailError.message,
      });
    }

    return res.status(200).json({
      message:
        "If your email exists in our system, you will receive a password reset link",
      success: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};

// Reset Password - Set new password using token
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  // Validate token
  if (!token) {
    return res.status(400).json({
      message: "Reset token is required",
      errorCode: "TOKEN_REQUIRED",
    });
  }

  // Validate password
  if (!password) {
    return res.status(400).json({
      message: "New password is required",
      errorCode: "PASSWORD_REQUIRED",
    });
  }

  // Validate password length (minimum 8 characters)
  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long",
      errorCode: "PASSWORD_TOO_SHORT",
    });
  }

  // Validate password confirmation
  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
      errorCode: "PASSWORD_MISMATCH",
    });
  }

  try {
    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token that hasn't expired
    const user = await db.User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          [db.Sequelize.Op.gt]: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      console.log("Invalid or expired reset token attempted");
      return res.status(400).json({
        message:
          "Invalid or expired reset token. Please request a new password reset.",
        errorCode: "INVALID_TOKEN",
      });
    }

    console.log("Valid reset token found for user:", user.id);

    // Update password (will be hashed by beforeUpdate hook)
    // Clear reset token and expiry
    await user.update({
      password: password,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    console.log("Password reset successful for user:", user.id);

    return res.status(200).json({
      message:
        "Password reset successfully. You can now login with your new password.",
      success: true,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};

// Verify Reset Token - Check if token is valid (for frontend validation)
export const verifyResetToken = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      valid: false,
      message: "Reset token is required",
    });
  }

  try {
    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token that hasn't expired
    const user = await db.User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          [db.Sequelize.Op.gt]: new Date(),
        },
      },
      attributes: ["id", "email", "name"],
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "Invalid or expired reset token",
      });
    }

    return res.status(200).json({
      valid: true,
      message: "Token is valid",
      email: user.email, // Optionally show masked email
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return res.status(500).json({
      valid: false,
      message: "Internal server error",
    });
  }
};

// Update user's own profile
export const updateProfile = async (req, res) => {
  const { name, phone, address, currentPassword, newPassword } = req.body;
  const userId = req.userId;

  try {
    const user = await db.Customer.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create update object with allowed fields
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;

    // If password change is requested, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to set a new password",
        });
      }

      const isPasswordValid = await user.validatePassword(currentPassword);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      updates.password = newPassword; // Will be hashed in the beforeUpdate hook
    }

    // Update user profile
    await user.update(updates);

    // Return updated user data (excluding password)
    const userData = user.toJSON();
    delete userData.password;

    return res.status(200).json({
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
