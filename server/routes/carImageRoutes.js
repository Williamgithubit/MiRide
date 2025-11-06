import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { 
  uploadCarImagesMiddleware,
  getCarImages,
  uploadCarImages,
  deleteCarImage,
  setPrimaryImage,
  reorderImages
} from '../controllers/carImageController.js';

const router = express.Router();

// Get all images for a car
router.get('/cars/:carId/images', getCarImages);

// Upload images for a car
router.post(
  '/cars/:carId/images',
  authenticate,
  uploadCarImagesMiddleware,
  uploadCarImages
);

// Delete a car image
router.delete('/cars/:carId/images/:imageId', authenticate, deleteCarImage);

// Set primary image
router.patch('/cars/:carId/images/:imageId/set-primary', authenticate, setPrimaryImage);

// Reorder images
router.patch('/cars/:carId/images/reorder', authenticate, reorderImages);

export default router;
