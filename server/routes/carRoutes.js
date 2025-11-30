import express from 'express';
import { 
  getCars, 
  getCar,
  getAvailableCars,
  getCarsByOwner, 
  toggleLike, 
  addReview, 
  createCar, 
  updateCar, 
  deleteCar,
  uploadCarImagesMiddleware,
  getCarImages
} from '../controllers/carController.js';
import { 
  uploadCarImagesMiddleware as imageUploadMiddleware,
  uploadCarImages,
  deleteCarImage,
  setPrimaryImage,
  reorderImages
} from '../controllers/carImageController.js';
import auth from '../middleware/auth.js';

const carRouter = express.Router();

// Public routes - anyone can view cars
carRouter.get('/', getCars);

// Available cars route - check availability based on dates (MUST come before /:id)
carRouter.get('/available', getAvailableCars);

// Owner routes - public can view, but /owner without ID requires auth (MUST come before /:id)
carRouter.get('/owner/:ownerId', getCarsByOwner); // Public - anyone can see owner's cars
carRouter.get('/owner', auth(['owner']), getCarsByOwner); // Protected - owner's own cars

// Public route for single car (MUST come after /owner and /available routes)
carRouter.get('/:id', getCar);

// Customer routes - only authenticated customers can like and review
carRouter.post('/:id/like', auth(['customer', 'owner']), toggleLike);
carRouter.post('/:id/review', auth(['customer', 'owner']), addReview);

// Car management routes with image upload support
carRouter.post('/', 
  auth(['owner']), 
  uploadCarImagesMiddleware,
  createCar
);

carRouter.put('/:id', 
  auth(['owner']), 
  uploadCarImagesMiddleware,
  updateCar
);

carRouter.delete('/:id', auth(['owner']), deleteCar);

// Image management routes
carRouter.get('/:carId/images', getCarImages);

// Image upload route - properly handles image uploads for existing cars
carRouter.post('/:carId/images', 
  auth(['owner']), 
  imageUploadMiddleware,
  uploadCarImages
);

// Delete a car image
carRouter.delete('/:carId/images/:imageId', auth(['owner']), deleteCarImage);

// Set primary image
carRouter.patch('/:carId/images/:imageId/set-primary', auth(['owner']), setPrimaryImage);

// Reorder images
carRouter.patch('/:carId/images/reorder', auth(['owner']), reorderImages);

export default carRouter;
