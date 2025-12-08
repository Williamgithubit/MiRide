import express from "express";
import {
  createRental,
  getRental,
  getStats,
  getActive,
  getCustomerRentals,
  deleteRental,
  getRentals,
  getOwnerRentals,
  updateRentalStatus,
  getRevenue,
  getPendingBookings,
  approveBooking,
  rejectBooking,
  getCurrentBookings,
  getBookingHistory,
  getCustomerBookingStats,
  createTestBooking,
  cancelBooking,
  getOwnerActiveRentals,
} from "../controllers/rentalController.js";
import auth from "../middleware/auth.js";
import db from "../models/index.js";

const rentalRouter = express.Router();

// Middleware to verify rental ownership
const verifyRentalOwnership = async (req, res, next) => {
  try {
    const rentalId = req.params.id;
    const userId = req.user.id;

    const rental = await db.Rental.findOne({
      where: {
        id: rentalId,
        customerId: userId,
      },
    });

    if (!rental) {
      return res.status(403).json({
        message: "You don't have permission to access this rental",
      });
    }

    req.rental = rental;
    next();
  } catch (error) {
    res.status(500).json({ message: "Error verifying rental ownership" });
  }
};

// General routes (authenticated users)
rentalRouter.get("/", auth(), getRentals); // Allow all authenticated users to view rentals
rentalRouter.get("/stats", auth(["admin"]), getStats); // Admin only for stats

// Owner routes (must come before /:id routes to avoid conflicts)
rentalRouter.get("/pending", auth(["owner", "admin"]), getPendingBookings);
rentalRouter.get(
  "/owner/active",
  auth(["owner", "admin"]),
  getOwnerActiveRentals
);
rentalRouter.get("/owner", auth(["owner", "admin"]), getOwnerRentals);
rentalRouter.get("/revenue", auth(["owner", "admin"]), getRevenue);
rentalRouter.get("/owner/:ownerId", auth(["owner", "admin"]), getOwnerRentals);
rentalRouter.post("/create-test-booking", auth(["owner"]), createTestBooking);
rentalRouter.put("/:id/approve", auth(["owner", "admin"]), approveBooking);
rentalRouter.put("/:id/reject", auth(["owner", "admin"]), rejectBooking);
rentalRouter.put("/:id/status", auth(["owner", "admin"]), updateRentalStatus);

// Customer routes - specific routes must come before generic ones
rentalRouter.get("/customer/active", auth(["customer"]), getActive);
rentalRouter.get("/customer/current", auth(["customer"]), getCurrentBookings);
rentalRouter.get("/customer/history", auth(["customer"]), getBookingHistory);
rentalRouter.get(
  "/customer/stats",
  auth(["customer"]),
  getCustomerBookingStats
);
rentalRouter.get("/customer", auth(["customer"]), getCustomerRentals);
rentalRouter.get("/active", auth(["customer"]), getActive); // Keep for backward compatibility
rentalRouter.post("/", auth(["customer"]), createRental);
rentalRouter.post("/checkout", auth(["customer"]), createRental);
rentalRouter.get("/:id", auth(["customer"]), verifyRentalOwnership, getRental);
rentalRouter.put("/:id/cancel", auth(["customer"]), cancelBooking);
rentalRouter.delete(
  "/:id",
  auth(["customer"]),
  verifyRentalOwnership,
  deleteRental
);

export default rentalRouter;
