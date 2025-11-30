import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';
import {
  getOwnerProfile,
  updateOwnerProfile,
  uploadOwnerAvatar,
} from '../controllers/ownerProfileController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Try multiple paths to handle different deployment structures
    const uploadPaths = [
      path.join(__dirname, '../../public/uploads/avatars'),  // Development
      path.join(__dirname, '../public/uploads/avatars'),      // Render
      path.join(process.cwd(), 'public/uploads/avatars')      // Current working directory
    ];

    let uploadsPath = uploadPaths[0];
    for (const testPath of uploadPaths) {
      const parentDir = path.dirname(testPath);
      if (fs.existsSync(parentDir)) {
        uploadsPath = testPath;
        break;
      }
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `owner-${req.params.ownerId}-${uniqueSuffix}${ext}`);
  },
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes
// GET /api/owners/profile/:ownerId - Get owner profile
router.get('/profile/:ownerId', auth(['owner', 'admin']), getOwnerProfile);

// PUT /api/owners/profile/update/:ownerId - Update owner profile
router.put('/profile/update/:ownerId', auth(['owner']), updateOwnerProfile);

// POST /api/owners/profile/upload/:ownerId - Upload owner avatar
router.post(
  '/profile/upload/:ownerId',
  auth(['owner']),
  upload.single('avatar'),
  uploadOwnerAvatar
);

export default router;
