import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import db from './models/index.js';
// import { createApiUser, generateAccessToken, generateApiKey } from './utils/momo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import carRoutes from './routes/carRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userManagementRoutes from './routes/userManagementRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import ownerProfileRoutes from './routes/ownerProfileRoutes.js';
import stripeConnectRoutes from './routes/stripeConnectRoutes.js';
import termsRoutes from './routes/termsRoutes.js';
import adminSetupRoutes from './routes/adminSetup.js';
import BookingExpirationService from './services/bookingExpirationService.js';

// Load environment variables
dotenv.config();
if (!process.env.CLIENT_URL) {
  console.warn('⚠️  WARNING: CLIENT_URL is not set. CORS may not work correctly in production.');
}

const app = express();
const PORT = process.env.PORT || 3000; // Set default port to 3000 to match client requests

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin for images
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:5173', 'https://api.stripe.com'],
    },
  },
}));

// HPP - Prevent HTTP Parameter Pollution
app.use(hpp());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// RATE LIMITING
// ============================================

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/' || req.path === '/health';
  },
});

// Strict rate limiter for authentication routes (brute force protection)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: {
    status: 429,
    message: 'Too many login attempts. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiter for password reset (prevent email bombing)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: {
    status: 429,
    message: 'Too many password reset attempts. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for account creation
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registration attempts per hour per IP
  message: {
    status: 429,
    message: 'Too many accounts created from this IP. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// Serve static files from public directory
// Try multiple paths to handle different deployment structures
const uploadPaths = [
  path.join(__dirname, '../public/uploads'),  // Development: server/../public/uploads
  path.join(__dirname, 'public/uploads'),      // Render: server/public/uploads
  path.join(process.cwd(), 'public/uploads')   // Current working directory
];

let uploadsPath = uploadPaths[0];
for (const testPath of uploadPaths) {
  if (fs.existsSync(testPath)) {
    uploadsPath = testPath;
    break;
  }
}

// Serve static files with cache control headers
app.use('/uploads', express.static(uploadsPath, {
  maxAge: 0, // No caching in development/production
  etag: true, // Enable ETag for cache validation
  lastModified: true, // Enable Last-Modified header
  setHeaders: (res, path) => {
    // Disable caching for images to ensure fresh content after updates
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/dashboard', dashboardRoutes); // Dashboard routes for admin and owner access
app.use('/api/admin', adminRoutes); // Admin-only routes
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/owners', ownerProfileRoutes);
app.use('/api/stripe', stripeConnectRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/admin-setup', adminSetupRoutes); // Secret admin setup endpoint

// Default route
app.get('/', (req, res) => {
  res.send('Car Rental API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Sync database and start server
const startServer = async() => {
  try {
    await db.sequelize.sync({alter: true}); //Create the tables in the database according to the models if they don’t exist.
    console.log('Database connection has been established successfully.');
    
    // In development, you may want to sync the models with the database
    // In production, use migrations instead
    if (process.env.NODE_ENV !== 'development') {
      await db.sequelize.sync(); // Normal sync without dropping tables
      console.log('Database synchronized');
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // Start booking expiration checker (runs every 60 minutes)
      BookingExpirationService.startExpirationChecker(60);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();