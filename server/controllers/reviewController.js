// server/controllers/reviewController.js
import db from '../models/index.js';
import { Op } from 'sequelize';

// Get all reviews for owner's cars
export const getReviewsByOwner = async (req, res) => {
  try {
    const ownerId = req.userId || req.params.ownerId;
    
    const reviews = await db.Review.findAll({
      include: [
        {
          model: db.Car,
          as: 'car',
          where: { ownerId },
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: db.Rental,
          as: 'rental',
          attributes: ['id', 'startDate', 'endDate'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get reviews by customer
export const getReviewsByCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId || req.userId;
    
    const reviews = await db.Review.findAll({
      where: { customerId },
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: db.Rental,
          as: 'rental',
          attributes: ['id', 'startDate', 'endDate', 'totalCost'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching customer reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get reviews for a specific car
export const getReviewsByCar = async (req, res) => {
  try {
    const { carId } = req.params;
    
    const reviews = await db.Review.findAll({
      where: { carId, isPublic: true },
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name'],
        },
        {
          model: db.Rental,
          as: 'rental',
          attributes: ['id', 'startDate', 'endDate'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new review (typically by customers)
export const createReview = async (req, res) => {
  try {
    const {
      carId,
      rentalId,
      rating,
      title,
      comment,
    } = req.body;
    
    // Get customerId from authenticated user
    const customerId = req.userId;

    // Verify the rental exists and belongs to the customer
    if (rentalId) {
      const rental = await db.Rental.findOne({
        where: { 
          id: rentalId, 
          customerId,
          carId 
        },
      });

      if (!rental) {
        return res.status(404).json({ message: 'Rental not found or invalid' });
      }
    }

    // Check if customer already reviewed this car for this rental
    const existingReview = await db.Review.findOne({
      where: { 
        carId, 
        customerId,
        ...(rentalId && { rentalId })
      },
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this rental' });
    }

    const review = await db.Review.create({
      carId,
      customerId,
      rentalId,
      rating,
      title,
      comment,
      isVerified: !!rentalId, // Verified if linked to a rental
    });

    // Update car's average rating
    await updateCarRating(carId);

    const reviewWithDetails = await db.Review.findByPk(review.id, {
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name'],
        },
        {
          model: db.Rental,
          as: 'rental',
          attributes: ['id', 'startDate', 'endDate'],
          required: false,
        },
      ],
    });

    res.status(201).json(reviewWithDetails);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update review (customer editing their own review)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, title } = req.body;

    // Find review that belongs to the authenticated customer
    const review = await db.Review.findOne({
      where: { 
        id,
        customerId: req.userId 
      },
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name'],
        },
        {
          model: db.Rental,
          as: 'rental',
          attributes: ['id', 'startDate', 'endDate'],
          required: false,
        },
      ],
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or not authorized' });
    }

    // Update the review
    await review.update({
      rating: rating || review.rating,
      comment: comment || review.comment,
      title: title || review.title,
    });

    // Update car's average rating
    await updateCarRating(review.carId);

    // Return updated review with all associations
    const updatedReview = await db.Review.findByPk(id, {
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name'],
        },
        {
          model: db.Rental,
          as: 'rental',
          attributes: ['id', 'startDate', 'endDate'],
          required: false,
        },
      ],
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update review response (owner response to customer review)
export const updateReviewResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const review = await db.Review.findByPk(id, {
      include: [
        {
          model: db.Car,
          as: 'car',
          where: { ownerId: req.userId },
        },
      ],
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.update({
      response,
      responseDate: new Date(),
    });

    const updatedReview = await db.Review.findByPk(id, {
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name'],
        },
        {
          model: db.Rental,
          as: 'rental',
          attributes: ['id', 'startDate', 'endDate'],
          required: false,
        },
      ],
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review response:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete review (customer can delete their own review)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Find review that belongs to the authenticated customer
    const review = await db.Review.findOne({
      where: { 
        id,
        customerId: req.userId 
      }
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or not authorized' });
    }

    const carId = review.carId;
    await review.destroy();
    
    // Update car's average rating after deletion
    await updateCarRating(carId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get review statistics
export const getReviewStats = async (req, res) => {
  try {
    const ownerId = req.userId || req.params.ownerId;
    
    const ratingDistribution = await db.Review.findAll({
      include: [
        {
          model: db.Car,
          as: 'car',
          where: { ownerId },
          attributes: [],
        },
      ],
      attributes: [
        'rating',
        [db.sequelize.fn('COUNT', db.sequelize.col('Review.id')), 'count'],
      ],
      group: ['rating'],
      order: [['rating', 'ASC']],
      raw: true,
    });

    const totalReviews = await db.Review.count({
      include: [
        {
          model: db.Car,
          as: 'car',
          where: { ownerId },
          attributes: [],
        },
      ],
    });

    const averageRating = await db.Review.findOne({
      include: [
        {
          model: db.Car,
          as: 'car',
          where: { ownerId },
          attributes: [],
        },
      ],
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'avgRating'],
      ],
      raw: true,
    });

    const recentReviews = await db.Review.findAll({
      include: [
        {
          model: db.Car,
          as: 'car',
          where: { ownerId },
          attributes: ['id', 'name', 'model'],
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const pendingResponses = await db.Review.count({
      where: { response: null },
      include: [
        {
          model: db.Car,
          as: 'car',
          where: { ownerId },
          attributes: [],
        },
      ],
    });

    // Format rating distribution to match frontend expectations
    const formattedRatingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    ratingDistribution.forEach(item => {
      formattedRatingDistribution[item.rating] = parseInt(item.count);
    });

    res.json({
      totalReviews,
      averageRating: parseFloat(averageRating?.avgRating || 0),
      ratingDistribution: formattedRatingDistribution,
      recentReviews,
      pendingResponses,
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to update car rating
async function updateCarRating(carId) {
  try {
    const reviews = await db.Review.findAll({
      where: { carId },
      attributes: ['rating'],
    });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await db.Car.update(
        { 
          rating: parseFloat(averageRating.toFixed(1)),
          reviews: reviews.length 
        },
        { where: { id: carId } }
      );
    } else {
      await db.Car.update(
        { 
          rating: 0,
          reviews: 0 
        },
        { where: { id: carId } }
      );
    }
  } catch (error) {
    console.error('Error updating car rating:', error);
  }
}
