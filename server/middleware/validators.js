import { body, param, query, validationResult } from "express-validator";
import { normalizeEmail } from "../utils/emailNormalization.js";

// ============================================
// VALIDATION RESULT HANDLER
// ============================================

/**
 * Middleware to check validation results and return errors if any
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    console.error("❌ Validation failed:", JSON.stringify(errorArray, null, 2));
    // Log each field error separately for clarity
    errorArray.forEach((err) => {
      console.error(
        `  Field '${err.path}': ${err.msg} (value: '${err.value}')`
      );
    });
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errorArray.map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// ============================================
// AUTH VALIDATORS
// ============================================

export const registerValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .isLength({ max: 255 })
    .withMessage("Email must be less than 255 characters")
    .customSanitizer((value) => value.toLowerCase()),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .escape(), // Prevent XSS

  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters")
    .escape(),

  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters")
    .escape(),

  body("phone")
    .optional({ checkFalsy: true }) // Skip validation if empty, null, undefined, etc.
    .trim()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),

  body("role")
    .optional()
    .isIn(["customer", "owner"])
    .withMessage("Role must be either customer or owner"),

  handleValidationErrors,
];

export const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];
export const forgotPasswordValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .customSanitizer((value) => value.toLowerCase()),

  handleValidationErrors,
];

export const resetPasswordValidation = [
  param("token")
    .notEmpty()
    .withMessage("Reset token is required")
    .isLength({ min: 20, max: 100 })
    .withMessage("Invalid reset token"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  handleValidationErrors,
];

export const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .escape(),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address must be less than 500 characters")
    .escape(),

  handleValidationErrors,
];

// ============================================
// CAR VALIDATORS
// ============================================

export const createCarValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Car name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Car name must be between 2 and 100 characters")
    .escape(),

  body("brand")
    .trim()
    .notEmpty()
    .withMessage("Brand is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Brand must be between 1 and 50 characters")
    .escape(),

  body("model")
    .trim()
    .notEmpty()
    .withMessage("Model is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Model must be between 1 and 50 characters")
    .escape(),

  body("year")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(
      `Year must be between 1900 and ${new Date().getFullYear() + 1}`
    ),

  body("rentalPricePerDay")
    .isFloat({ min: 0 })
    .withMessage("Rental price must be a positive number"),

  body("seats")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Seats must be between 1 and 20"),

  body("fuelType")
    .optional()
    .isIn(["Petrol", "Diesel", "Electric", "Hybrid"])
    .withMessage("Fuel type must be Petrol, Diesel, Electric, or Hybrid"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Location must be less than 200 characters")
    .escape(),

  handleValidationErrors,
];

export const updateCarValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid car ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Car name must be between 2 and 100 characters")
    .escape(),

  body("rentalPricePerDay")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Rental price must be a positive number"),

  body("year")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(
      `Year must be between 1900 and ${new Date().getFullYear() + 1}`
    ),

  handleValidationErrors,
];

// ============================================
// RENTAL/BOOKING VALIDATORS
// ============================================

export const createBookingValidation = [
  body("carId")
    .notEmpty()
    .withMessage("Car ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid car ID"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date")
    .custom((value) => {
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        throw new Error("Start date cannot be in the past");
      }
      return true;
    }),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.startDate);
      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  body("totalPrice")
    .notEmpty()
    .withMessage("Total price is required")
    .isFloat({ min: 0 })
    .withMessage("Total price must be a positive number"),

  body("pickupLocation")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Pickup location must be less than 200 characters")
    .escape(),

  body("dropoffLocation")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Dropoff location must be less than 200 characters")
    .escape(),

  body("specialRequests")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Special requests must be less than 1000 characters")
    .escape(),

  handleValidationErrors,
];

export const bookingIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid booking ID"),

  handleValidationErrors,
];

export const rejectBookingValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid booking ID"),

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Rejection reason must be less than 500 characters")
    .escape(),

  handleValidationErrors,
];

// ============================================
// REVIEW VALIDATORS
// ============================================

export const createReviewValidation = [
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comment must be less than 1000 characters")
    .escape(),

  handleValidationErrors,
];

// ============================================
// MESSAGE VALIDATORS
// ============================================

export const sendMessageValidation = [
  body("receiverId")
    .notEmpty()
    .withMessage("Receiver ID is required")
    .isUUID()
    .withMessage("Invalid receiver ID"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message must be between 1 and 2000 characters")
    .escape(),

  handleValidationErrors,
];

// ============================================
// PAYMENT VALIDATORS
// ============================================

export const createPaymentIntentValidation = [
  body("carId")
    .notEmpty()
    .withMessage("Car ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid car ID"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date"),

  body("totalPrice")
    .notEmpty()
    .withMessage("Total price is required")
    .isFloat({ min: 0.01 })
    .withMessage("Total price must be greater than 0"),

  handleValidationErrors,
];

// ============================================
// COMMON VALIDATORS
// ============================================

export const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];

export const uuidParamValidation = [
  param("id").isUUID().withMessage("Invalid ID format"),

  handleValidationErrors,
];

export const intParamValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid ID"),

  handleValidationErrors,
];

// ============================================
// SANITIZATION HELPERS
// ============================================

/**
 * Sanitize object by removing potentially dangerous characters
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // Remove potential XSS characters
      sanitized[key] = value.replace(/[<>]/g, "").trim();
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export default {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  createCarValidation,
  updateCarValidation,
  createBookingValidation,
  bookingIdValidation,
  rejectBookingValidation,
  createReviewValidation,
  sendMessageValidation,
  createPaymentIntentValidation,
  paginationValidation,
  uuidParamValidation,
  intParamValidation,
  sanitizeObject,
};
