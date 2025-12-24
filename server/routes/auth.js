import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  getCurrentUser,
  authenticate,
  checkDashboardAccess,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  updateProfile,
} from "../controllers/authController.js";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
} from "../middleware/validators.js";

const router = express.Router();

// ============================================
// RATE LIMITERS FOR AUTH ROUTES
// ============================================

// Strict rate limiter for login (brute force protection)
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 failed attempts per hour
  message: {
    status: 429,
    message: "Too many login attempts. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiter for registration (prevent mass account creation)
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registration attempts per hour per IP
  message: {
    status: 429,
    message:
      "Too many accounts created from this IP. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Debug middleware for registration requests
const debugRegistration = (req, res, next) => {
  if (req.path === "/register" || req.path === "/signup") {
    console.log("====================================");
    console.log("📝 Registration Request Debug");
    console.log("====================================");
    console.log("URL:", req.originalUrl);
    console.log("Method:", req.method);
    console.log("Body fields:", Object.keys(req.body));
    console.log("Body values:", JSON.stringify(req.body, null, 2));
    console.log("====================================");
  }
  next();
};

// Apply debug middleware before other middlewares
router.use(debugRegistration);

// Rate limiter for password reset (prevent email bombing)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: {
    status: 429,
    message:
      "Too many password reset attempts. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// PUBLIC ROUTES (with rate limiting)
// ============================================

router.post("/register", registrationLimiter, registerValidation, register);
router.post("/signup", registrationLimiter, registerValidation, register); // Alias
router.post("/login", loginLimiter, loginValidation, login);

// Password reset routes (public)
router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPasswordValidation,
  forgotPassword
);
router.post(
  "/reset-password/:token",
  passwordResetLimiter,
  resetPasswordValidation,
  resetPassword
);
router.get("/verify-reset-token/:token", verifyResetToken);

// Protected routes - all use the authenticate middleware
router.get("/me", authenticate, getCurrentUser);
router.put("/profile", authenticate, updateProfileValidation, updateProfile);
router.get("/dashboard-access", authenticate, checkDashboardAccess);

export default router;
