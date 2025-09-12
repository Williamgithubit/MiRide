import express from 'express';
import { createRental, getRental, getStats, getActive, deleteRental, getRentals, getOwnerRentals, updateRentalStatus, getRevenue } from '../controllers/rentalController.js';
import auth from '../middleware/auth.js';
import db from '../models/index.js';

const rentalRouter = express.Router();

// Middleware to verify rental ownership
const verifyRentalOwnership = async (req, res, next) => {
  try {
    const rentalId = req.params.id;
    const userId = req.user.id;

    const rental = await db.Rental.findOne({
      where: { 
        id: rentalId,
        customerId: userId
      }
    });

    if (!rental) {
      return res.status(403).json({ 
        message: "You don't have permission to access this rental" 
      });
    }

    req.rental = rental;
    next();
  } catch (error) {
    res.status(500).json({ message: "Error verifying rental ownership" });
  }
};

// General routes (authenticated users)
rentalRouter.get('/', auth(), getRentals); // Allow all authenticated users to view rentals
rentalRouter.get('/stats', auth(['admin']), getStats); // Admin only for stats

// Customer routes
rentalRouter.post('/', auth(['customer']), createRental);
rentalRouter.get('/active', auth(['customer']), getActive);
rentalRouter.get('/:id', auth(['customer']), verifyRentalOwnership, getRental);
rentalRouter.delete('/:id', auth(['customer']), verifyRentalOwnership, deleteRental);

// Owner routes
rentalRouter.get('/owner/:ownerId', auth(['owner', 'admin']), getOwnerRentals);
rentalRouter.put('/:id/status', auth(['owner', 'admin']), updateRentalStatus);
rentalRouter.get('/revenue', auth(['owner', 'admin']), getRevenue);

export default rentalRouter;
