// server/routes/reviewRoutes.js
import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get reviews for owner's cars
router.get('/owner/:ownerId', auth, reviewController.getReviewsByOwner);
router.get('/owner', auth, reviewController.getReviewsByOwner);

// Get reviews for specific car
router.get('/car/:carId', reviewController.getReviewsByCar);

// Get review statistics
router.get('/stats', auth, reviewController.getReviewStats);
router.get('/stats/:ownerId', auth, reviewController.getReviewStats);

// Create new review
router.post('/', auth, reviewController.createReview);

// Update review (owner response)
router.put('/:id', auth, reviewController.updateReview);

// Update review response (owner response to customer review)
router.put('/:id/response', auth, reviewController.updateReview);

// Delete review
router.delete('/:id', auth, reviewController.deleteReview);

export default router;
