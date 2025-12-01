import express from 'express';
import auth from '../middleware/auth.js';
import { avatarUpload } from '../utils/cloudinaryAvatarConfig.js';
import {
  getOwnerProfile,
  updateOwnerProfile,
  uploadOwnerAvatar,
} from '../controllers/ownerProfileController.js';

const router = express.Router();

// Routes
// GET /api/owners/profile/:ownerId - Get owner profile
router.get('/profile/:ownerId', auth(['owner', 'admin']), getOwnerProfile);

// PUT /api/owners/profile/update/:ownerId - Update owner profile
router.put('/profile/update/:ownerId', auth(['owner']), updateOwnerProfile);

// POST /api/owners/profile/upload/:ownerId - Upload owner avatar
router.post(
  '/profile/upload/:ownerId',
  auth(['owner']),
  avatarUpload.single('avatar'),
  uploadOwnerAvatar
);

export default router;
