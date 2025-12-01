import express from 'express';
import multer from 'multer';
import path from 'path';
import { createCustomer, getCustomers, getCustomer, updateCustomer, deleteCustomer, getCurrentProfile, updateCurrentProfile, uploadAvatar, uploadDriverLicense } from '../controllers/customerController.js';
import auth from '../middleware/auth.js';
import { avatarUpload } from '../utils/cloudinaryAvatarConfig.js';

const customerRouter = express.Router();

// Debug middleware - log all requests
customerRouter.use((req, res, next) => {
  console.log('=== CUSTOMER ROUTE HIT ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Full URL:', req.originalUrl);
  console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');
  next();
});

// Configure multer for driver's license uploads
const licenseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), '../public/uploads/licenses/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'license-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const licenseUpload = multer({
  storage: licenseStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image or PDF files are allowed!'));
    }
  }
});

// Profile routes - must come before :id routes to avoid conflicts
customerRouter.get('/profile', auth(), getCurrentProfile);
customerRouter.put('/profile', auth(), updateCurrentProfile);
customerRouter.post('/profile/avatar', auth(), avatarUpload.single('avatar'), uploadAvatar);
customerRouter.post('/profile/license', auth(), licenseUpload.single('license'), uploadDriverLicense);

// Public routes - anyone can view customers
customerRouter.get('/', getCustomers);
customerRouter.get('/:id', getCustomer);

// Customer routes - only authenticated customers can update their own profile
customerRouter.post('/', auth(['customer']), createCustomer);
customerRouter.put('/:id', auth(['customer']), updateCustomer);

// Admin routes - only admin can manage customers
customerRouter.delete('/:id', auth(['admin']), deleteCustomer);

export default customerRouter;