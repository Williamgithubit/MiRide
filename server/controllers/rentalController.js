import db from "../models/index.js";
import NotificationService from "../services/notificationService.js";
import { Op } from "sequelize";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

// Using db.Rental directly for better clarity

// Rent a car
export const getStats = async (req, res) => {
  try {
    const totalRentals = await db.Rental.count();
    const activeRentals = await db.Rental.count({
      where: {
        endDate: { [Op.gte]: new Date() },
      },
    });

    const totalRevenue = await db.Rental.sum("totalCost");

    const popularCars = await db.Rental.findAll({
      attributes: ["carId", [db.sequelize.fn("COUNT", "carId"), "rentCount"]],
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: ["id", "name", "model", "rentalPricePerDay"],
          include: [
            {
              model: db.CarImage,
              as: "images",
              attributes: ["id", "imageUrl", "isPrimary", "order"],
              limit: 1,
              order: [
                ["isPrimary", "DESC"],
                ["order", "ASC"],
              ],
            },
          ],
        },
      ],
      group: [
        "carId",
        "car.id",
        "car.name",
        "car.model",
        "car.rentalPricePerDay",
      ],
      order: [[db.sequelize.fn("COUNT", "carId"), "DESC"]],
      limit: 5,
    });

    res.json({
      totalRentals,
      activeRentals,
      totalRevenue: totalRevenue || 0,
      popularCars: popularCars.map((rental) => ({
        carId: rental.carId,
        name: rental.car.name,
        model: rental.car.model,
        rentCount: parseInt(rental.get("rentCount")),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActive = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("getActive - No user found in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;
    console.log("getActive - Fetching active rentals for user:", userId);

    const rentals = await db.Rental.findAll({
      where: {
        customerId: userId,
        status: "active",
        endDate: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: [
            "id",
            "name",
            "model",
            "rentalPricePerDay",
            "brand",
            "year",
          ],
          include: [
            {
              model: db.CarImage,
              as: "images",
              attributes: ["id", "imageUrl", "isPrimary", "order"],
              limit: 1,
              order: [
                ["isPrimary", "DESC"],
                ["order", "ASC"],
              ],
            },
          ],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["endDate", "ASC"]],
    });

    console.log(`getActive - Found ${rentals.length} active rentals`);
    // Return array of active bookings (for consistency with client expectations)
    res.json(rentals);
  } catch (error) {
    console.error("getActive - Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get current customer bookings (pending_approval, approved, active)
export const getCurrentBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("getCurrentBookings - No user found in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;
    console.log("getCurrentBookings - Fetching bookings for user:", userId);

    const rentals = await db.Rental.findAll({
      where: {
        customerId: userId,
        status: {
          [Op.in]: ["pending_approval", "approved", "active"],
        },
        endDate: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: [
            "id",
            "name",
            "model",
            "rentalPricePerDay",
            "brand",
            "year",
          ],
          include: [
            {
              model: db.CarImage,
              as: "images",
              attributes: ["id", "imageUrl", "isPrimary", "order"],
              limit: 1,
              order: [
                ["isPrimary", "DESC"],
                ["order", "ASC"],
              ],
            },
          ],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["startDate", "ASC"]],
    });

    console.log(
      `getCurrentBookings - Found ${rentals.length} current bookings`
    );
    res.json(rentals);
  } catch (error) {
    console.error("getCurrentBookings - Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get customer booking history (completed, cancelled, rejected)
export const getBookingHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("getBookingHistory - No user found in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;
    console.log("getBookingHistory - Fetching history for user:", userId);

    const rentals = await db.Rental.findAll({
      where: {
        customerId: userId,
        [Op.or]: [
          { status: { [Op.in]: ["completed", "cancelled", "rejected"] } },
          {
            status: { [Op.in]: ["approved", "active"] },
            endDate: { [Op.lt]: new Date() },
          },
        ],
      },
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: [
            "id",
            "name",
            "model",
            "rentalPricePerDay",
            "brand",
            "year",
          ],
          include: [
            {
              model: db.CarImage,
              as: "images",
              attributes: ["id", "imageUrl", "isPrimary", "order"],
              limit: 1,
              order: [
                ["isPrimary", "DESC"],
                ["order", "ASC"],
              ],
            },
          ],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["endDate", "DESC"]],
    });

    console.log(
      `getBookingHistory - Found ${rentals.length} historical bookings`
    );
    res.json(rentals);
  } catch (error) {
    console.error("getBookingHistory - Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get customer booking statistics
export const getCustomerBookingStats = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;

    // Get all customer bookings
    const allBookings = await db.Rental.findAll({
      where: { customerId: userId },
      attributes: [
        "id",
        "status",
        "totalCost",
        "totalAmount",
        "startDate",
        "endDate",
      ],
    });

    // Calculate statistics
    const totalBookings = allBookings.length;
    const activeBookings = allBookings.filter(
      (booking) =>
        booking.status === "active" && new Date(booking.endDate) >= new Date()
    ).length;
    const completedBookings = allBookings.filter(
      (booking) =>
        booking.status === "completed" ||
        (booking.status === "active" && new Date(booking.endDate) < new Date())
    ).length;
    const upcomingBookings = allBookings.filter(
      (booking) =>
        ["pending_approval", "approved"].includes(booking.status) &&
        new Date(booking.startDate) > new Date()
    ).length;

    // Calculate total spent (use totalAmount if available, fallback to totalCost)
    const totalSpent = allBookings.reduce((sum, booking) => {
      const amount = Number(booking.totalAmount || booking.totalCost || 0);
      return sum + amount;
    }, 0);

    const averageBookingValue =
      totalBookings > 0 ? totalSpent / totalBookings : 0;

    res.json({
      totalBookings,
      activeBookings,
      completedBookings,
      upcomingBookings,
      totalSpent,
      averageBookingValue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customer's rentals
export const getCustomerRentals = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("getCustomerRentals - No user found in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;
    console.log("getCustomerRentals - Fetching rentals for user:", userId);

    const rentals = await db.Rental.findAll({
      where: {
        customerId: userId,
      },
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: [
            "id",
            "name",
            "model",
            "rentalPricePerDay",
            "brand",
            "year",
          ],
          required: false,
          include: [
            {
              model: db.CarImage,
              as: "images",
              attributes: ["id", "imageUrl", "isPrimary", "order"],
              required: false,
            },
          ],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
      order: [["startDate", "DESC"]],
    });

    console.log(`getCustomerRentals - Found ${rentals.length} rentals`);
    if (rentals.length > 0) {
      console.log("getCustomerRentals - Sample rental with payment info:", {
        id: rentals[0].id,
        paymentStatus: rentals[0].paymentStatus,
        totalAmount: rentals[0].totalAmount,
        totalCost: rentals[0].totalCost,
        status: rentals[0].status,
        createdAt: rentals[0].createdAt,
      });
    }
    res.json(rentals);
  } catch (error) {
    console.error("getCustomerRentals - Error Details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getRentals = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // If date range is provided, filter by dates
    if (startDate && endDate) {
      const rentals = await db.Rental.findAll({
        where: {
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [startDate, endDate],
              },
            },
            {
              endDate: {
                [Op.between]: [startDate, endDate],
              },
            },
          ],
        },
        include: [
          {
            model: db.Car,
            as: "car",
            attributes: ["id", "name", "model", "rentalPricePerDay"],
          },
          {
            model: db.User,
            as: "customer",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["startDate", "DESC"]],
      });
      return res.json(rentals);
    }

    // Otherwise, return all rentals
    const rentals = await db.Rental.findAll({
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: ["id", "name", "model", "rentalPricePerDay"],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["startDate", "DESC"]],
    });
    res.json(rentals);
  } catch (error) {
    console.error("Error getting rentals:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getOwnerRentals = async (req, res) => {
  try {
    // Get ownerId from params (if provided) or use authenticated user's ID
    const { ownerId } = req.params;
    const ownerIdToUse = ownerId || req.user?.id || req.userId;

    if (!ownerIdToUse) {
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log("Getting rentals for owner:", ownerIdToUse);

    const rentals = await db.Rental.findAll({
      where: {
        ownerId: ownerIdToUse,
      },
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: [
            "id",
            "name",
            "model",
            "brand",
            "year",
            "rentalPricePerDay",
          ],
          required: false, // LEFT JOIN instead of INNER JOIN
          include: [
            {
              model: db.CarImage,
              as: "images",
              attributes: ["id", "imageUrl", "isPrimary", "order"],
              required: false,
              separate: false,
            },
          ],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
          required: false, // LEFT JOIN instead of INNER JOIN
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log(`Found ${rentals.length} rentals for owner ${ownerIdToUse}`);

    // Always return an array, even if empty
    res.json(rentals || []);
  } catch (error) {
    console.error("Error getting owner rentals:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const updateRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const rental = await db.Rental.findByPk(id, {
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: ["id", "name", "model", "rentalPricePerDay"],
          include: [
            {
              model: db.CarImage,
              as: "images",
              attributes: ["id", "imageUrl", "isPrimary", "order"],
              limit: 1,
              order: [
                ["isPrimary", "DESC"],
                ["order", "ASC"],
              ],
            },
          ],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!rental) {
      return res.status(404).json({ error: "Rental not found" });
    }

    await rental.update({ status });

    res.json(rental);
  } catch (error) {
    console.error("Error updating rental status:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getRevenue = async (req, res) => {
  try {
    const { period } = req.query;

    // Validate period
    const validPeriods = ["daily", "weekly", "monthly", "yearly"];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        error: "Invalid period. Must be one of: daily, weekly, monthly, yearly",
      });
    }

    // Generate mock revenue data for now since we don't have real historical data
    const generateRevenueData = (period) => {
      const data = [];
      const now = new Date();

      switch (period) {
        case "monthly":
          for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            data.push({
              period: date.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
              revenue: Math.floor(Math.random() * 5000) + 1000,
              bookings: Math.floor(Math.random() * 20) + 5,
            });
          }
          break;
        case "daily":
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
              period: date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              revenue: Math.floor(Math.random() * 500) + 100,
              bookings: Math.floor(Math.random() * 5) + 1,
            });
          }
          break;
        case "weekly":
          for (let i = 7; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i * 7);
            data.push({
              period: `Week ${date.getWeek()}`,
              revenue: Math.floor(Math.random() * 2000) + 500,
              bookings: Math.floor(Math.random() * 10) + 3,
            });
          }
          break;
        case "yearly":
          for (let i = 2; i >= 0; i--) {
            const year = now.getFullYear() - i;
            data.push({
              period: year.toString(),
              revenue: Math.floor(Math.random() * 50000) + 20000,
              bookings: Math.floor(Math.random() * 200) + 100,
            });
          }
          break;
      }

      return data;
    };

    const revenueData = generateRevenueData(period);
    res.json(revenueData);
  } catch (error) {
    console.error("Error getting revenue data:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createRental = async (req, res) => {
  console.log(req.body);
  try {
    // This function is now handled by the Stripe webhook
    // But we can keep it for manual rental creation if needed
    res
      .status(501)
      .json({ message: "Rental creation is handled via payment webhook" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending bookings for owner approval
export const getPendingBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ownerId = req.user.id;

    // Get pending bookings for the owner
    console.log("Getting pending bookings for owner:", ownerId);
    const pendingRentals = await db.Rental.findAll({
      where: {
        ownerId: ownerId,
        status: "pending_approval",
      },
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: [
            "id",
            "name",
            "model",
            "brand",
            "year",
            "rentalPricePerDay",
          ],
          include: [
            {
              model: db.CarImage,
              as: "images",
              attributes: ["id", "imageUrl", "isPrimary", "order"],
              limit: 1,
              order: [
                ["isPrimary", "DESC"],
                ["order", "ASC"],
              ],
            },
          ],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log(
      `Found ${pendingRentals.length} rentals:`,
      pendingRentals.map((r) => ({
        id: r.id,
        status: r.status,
        customerId: r.customerId,
        carId: r.carId,
        createdAt: r.createdAt,
      }))
    );

    res.json(pendingRentals);
  } catch (error) {
    console.error("Error getting pending bookings:", error);
    res.status(500).json({ error: error.message });
  }
};

// Approve a booking
export const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const rental = await db.Rental.findOne({
      where: {
        id: id,
        status: "pending_approval",
      },
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: ["id", "name", "model", "brand", "year"],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!rental) {
      return res
        .status(404)
        .json({ message: "Booking not found or already processed" });
    }

    // Update rental status and set approval timestamp
    await rental.update({
      status: "approved",
      approvedAt: new Date(),
    });

    // Update car availability for the rental period
    // Note: In a real system, you'd implement a more sophisticated availability system
    // that checks for overlapping bookings
    await db.Car.update(
      { isAvailable: false },
      { where: { id: rental.carId } }
    );

    // Create Payment record if it doesn't exist (for bookings that were paid but payment record wasn't created)
    const existingPayment = await db.Payment.findOne({
      where: { rentalId: rental.id },
    });

    if (!existingPayment && rental.paymentStatus === "paid") {
      console.log(`Creating missing payment record for rental ${rental.id}`);

      // Ensure commission fields are calculated
      if (!rental.platformFee || !rental.ownerPayout) {
        const platformFee = parseFloat((rental.totalAmount * 0.1).toFixed(2));
        const ownerPayout = parseFloat((rental.totalAmount * 0.9).toFixed(2));

        await rental.update({
          platformFee,
          ownerPayout,
        });
      }

      // Get owner profile for stripe account ID
      const ownerProfile = await db.OwnerProfile.findOne({
        where: { userId: rental.ownerId },
      });

      // Create payment record
      await db.Payment.create({
        rentalId: rental.id,
        ownerId: rental.ownerId,
        customerId: rental.customerId,
        stripePaymentIntentId: rental.paymentIntentId || `manual_${rental.id}`,
        stripeAccountId: ownerProfile?.stripeAccountId,
        totalAmount: rental.totalAmount,
        platformFee: rental.platformFee,
        ownerAmount: rental.ownerPayout,
        currency: "usd",
        paymentStatus: "succeeded",
        payoutStatus: "paid",
        metadata: {
          rentalId: rental.id,
          carId: rental.carId,
          createdVia: "booking_approval",
        },
      });

      // Update owner balance
      if (ownerProfile) {
        await ownerProfile.update({
          totalEarnings:
            parseFloat(ownerProfile.totalEarnings || 0) +
            parseFloat(rental.ownerPayout),
          availableBalance:
            parseFloat(ownerProfile.availableBalance || 0) +
            parseFloat(rental.ownerPayout),
        });
      }

      console.log(`✅ Payment record created for rental ${rental.id}`);
    }

    console.log(`Booking ${rental.id} approved by owner ${req.user.id}`);

    // Send notification to customer about approval
    const notificationResult =
      await NotificationService.notifyCustomerBookingStatus(rental, "approved");
    if (notificationResult.success) {
      console.log(
        `✅ Customer notification sent successfully for rental ${rental.id}`
      );
    } else {
      console.error(
        `❌ Failed to send customer notification: ${notificationResult.error}`
      );
    }

    res.json({
      message: "Booking approved successfully",
      rental: rental,
    });
  } catch (error) {
    console.error("Error approving booking:", error);
    res.status(500).json({ error: error.message });
  }
};

// Reject a booking
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const rejectionReason = reason;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const rental = await db.Rental.findOne({
      where: {
        id: id,
        status: "pending_approval",
      },
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: ["id", "name", "model", "brand", "year"],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!rental) {
      return res
        .status(404)
        .json({ message: "Booking not found or already processed" });
    }

    // Update rental status and set rejection details
    await rental.update({
      status: "rejected",
      rejectedAt: new Date(),
      rejectionReason: rejectionReason || "No reason provided",
    });

    console.log(`Booking ${rental.id} rejected by owner ${req.user.id}`);

    // Make car available again since booking is rejected
    await db.Car.update({ isAvailable: true }, { where: { id: rental.carId } });

    // Send notification to customer about rejection
    const notificationResult =
      await NotificationService.notifyCustomerBookingStatus(
        rental,
        "rejected",
        rejectionReason
      );
    if (notificationResult.success) {
      console.log(
        `✅ Customer notification sent successfully for rental ${rental.id}`
      );
    } else {
      console.error(
        `❌ Failed to send customer notification: ${notificationResult.error}`
      );
    }

    // TODO: Process refund via Stripe
    // Attempt Stripe refund and persist Refund audit
    try {
      const payment = await db.Payment.findOne({
        where: { rentalId: rental.id },
      });
      if (payment && payment.paymentStatus !== "refunded") {
        let stripeRefundId = null;
        let transferReversalId = null;
        try {
          if (payment.stripePaymentIntentId) {
            const refundParams = {
              payment_intent: payment.stripePaymentIntentId,
            };
            if (payment.totalAmount)
              refundParams.amount = Math.round(
                parseFloat(payment.totalAmount) * 100
              );
            const refund = await stripe.refunds.create(refundParams);
            stripeRefundId = refund.id;
            console.log(
              "Stripe refund created for rejected booking:",
              stripeRefundId
            );
          }
        } catch (err) {
          console.error(
            "Stripe refund failed for rejected booking:",
            err && err.message ? err.message : err
          );
        }

        if (payment.stripeTransferId) {
          try {
            if (
              stripe.transfers &&
              typeof stripe.transfers.createReversal === "function"
            ) {
              const rev = await stripe.transfers.createReversal(
                payment.stripeTransferId,
                {
                  amount: Math.round(
                    parseFloat(payment.ownerAmount || 0) * 100
                  ),
                }
              );
              transferReversalId = rev.id;
            } else if (
              stripe.transfers &&
              stripe.transfers.reversals &&
              typeof stripe.transfers.reversals.create === "function"
            ) {
              const rev = await stripe.transfers.reversals.create(
                payment.stripeTransferId,
                {
                  amount: Math.round(
                    parseFloat(payment.ownerAmount || 0) * 100
                  ),
                }
              );
              transferReversalId = rev.id;
            }
          } catch (revErr) {
            console.error(
              "Transfer reversal failed for rejected booking:",
              revErr && revErr.message ? revErr.message : revErr
            );
          }
        }

        // DB transaction to update payment/rental and owner balances
        const t = await db.sequelize.transaction();
        try {
          if (payment.payoutStatus === "paid") {
            const ownerProfile = await db.OwnerProfile.findOne({
              where: { userId: rental.ownerId },
              transaction: t,
            });
            if (ownerProfile) {
              const ownerAmount = parseFloat(payment.ownerAmount || 0);
              const newTotalEarnings = Math.max(
                0,
                parseFloat(ownerProfile.totalEarnings || 0) - ownerAmount
              );
              const newAvailableBalance = Math.max(
                0,
                parseFloat(ownerProfile.availableBalance || 0) - ownerAmount
              );
              await ownerProfile.update(
                {
                  totalEarnings: newTotalEarnings,
                  availableBalance: newAvailableBalance,
                },
                { transaction: t }
              );
            }
          }

          const updatedMetadata = Object.assign({}, payment.metadata || {}, {
            refundedAt: new Date(),
            refundReason: rejectionReason || "Rejected by owner",
            stripeRefundId,
            transferReversalId,
          });
          await payment.update(
            {
              paymentStatus: "refunded",
              payoutStatus:
                payment.payoutStatus === "paid"
                  ? "failed"
                  : payment.payoutStatus,
              metadata: updatedMetadata,
            },
            { transaction: t }
          );
          await rental.update(
            { paymentStatus: "refunded" },
            { transaction: t }
          );

          await db.Refund.create(
            {
              paymentId: payment.id,
              rentalId: rental.id,
              ownerId: rental.ownerId,
              customerId: rental.customerId,
              stripeRefundId,
              amount: parseFloat(payment.totalAmount || 0),
              currency: payment.currency || "usd",
              reason: rejectionReason || "Rejected by owner",
              metadata: { stripeRefundId, transferReversalId },
            },
            { transaction: t }
          );

          await t.commit();
        } catch (dbErr) {
          await t.rollback();
          console.error(
            "DB error while recording refund for rejected booking:",
            dbErr && dbErr.message ? dbErr.message : dbErr
          );
        }
      } else {
        console.log(
          "No payment record or already refunded for rejected booking",
          rental.id
        );
      }
    } catch (outerErr) {
      console.error(
        "Error processing refund for rejected booking:",
        outerErr && outerErr.message ? outerErr.message : outerErr
      );
    }

    res.json({
      message: "Booking rejected successfully",
      rental: rental,
    });
  } catch (error) {
    console.error("Error rejecting booking:", error);
    res.status(500).json({ error: error.message });
  }
};

// View a specific rental
export const getRental = async (req, res) => {
  const { id } = req.params;

  try {
    const rental = await db.Rental.findByPk(id, {
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: ["id", "name", "model", "rentalPricePerDay"],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }
    return res.status(200).json(rental);
  } catch (error) {
    console.error("Error fetching rental:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// CANCELLATION POLICY CONFIGURATION
// ============================================
const CANCELLATION_POLICY = {
  // More than 48 hours before start: Full refund (0% fee)
  FULL_REFUND_HOURS: 48,
  // 24-48 hours before start: 25% cancellation fee
  LOW_FEE_HOURS: 24,
  LOW_FEE_PERCENTAGE: 0.25,
  // 12-24 hours before start: 50% cancellation fee
  MEDIUM_FEE_HOURS: 12,
  MEDIUM_FEE_PERCENTAGE: 0.50,
  // Less than 12 hours before start: 75% cancellation fee
  HIGH_FEE_PERCENTAGE: 0.75,
  // Minimum refund amount (to cover processing fees)
  MIN_REFUND_AMOUNT: 1.00,
};

/**
 * Calculate cancellation fee based on time until rental start
 * @param {Object} rental - The rental object with startDate and totalAmount
 * @returns {Object} - { feePercentage, feeAmount, refundAmount, hoursUntilStart, policyTier }
 */
const calculateCancellationFee = (rental) => {
  const now = new Date();
  const startDate = new Date(rental.startDate);
  startDate.setHours(0, 0, 0, 0); // Start of rental day
  
  const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);
  const totalAmount = parseFloat(rental.totalAmount || rental.totalCost || 0);
  
  let feePercentage = 0;
  let policyTier = 'FULL_REFUND';
  
  if (hoursUntilStart >= CANCELLATION_POLICY.FULL_REFUND_HOURS) {
    // More than 48 hours: Full refund
    feePercentage = 0;
    policyTier = 'FULL_REFUND';
  } else if (hoursUntilStart >= CANCELLATION_POLICY.LOW_FEE_HOURS) {
    // 24-48 hours: 25% fee
    feePercentage = CANCELLATION_POLICY.LOW_FEE_PERCENTAGE;
    policyTier = 'LOW_FEE';
  } else if (hoursUntilStart >= CANCELLATION_POLICY.MEDIUM_FEE_HOURS) {
    // 12-24 hours: 50% fee
    feePercentage = CANCELLATION_POLICY.MEDIUM_FEE_PERCENTAGE;
    policyTier = 'MEDIUM_FEE';
  } else {
    // Less than 12 hours: 75% fee
    feePercentage = CANCELLATION_POLICY.HIGH_FEE_PERCENTAGE;
    policyTier = 'HIGH_FEE';
  }
  
  const feeAmount = parseFloat((totalAmount * feePercentage).toFixed(2));
  let refundAmount = parseFloat((totalAmount - feeAmount).toFixed(2));
  
  // Ensure minimum refund amount
  if (refundAmount < CANCELLATION_POLICY.MIN_REFUND_AMOUNT && refundAmount > 0) {
    refundAmount = 0;
    // feeAmount = totalAmount; // Keep full amount as fee if refund would be too small
  }
  
  return {
    feePercentage,
    feeAmount,
    refundAmount,
    hoursUntilStart: Math.max(0, hoursUntilStart),
    policyTier,
    totalAmount
  };
};

// Cancel a rental (customer-initiated cancellation with cancellation policy)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const rental = await db.Rental.findOne({
      where: {
        id: id,
        customerId: req.user.id,
      },
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: ["id", "name", "model", "brand", "year"],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.User,
          as: "owner",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found or you don't have permission to cancel it",
      });
    }

    // Check if rental can be cancelled
    if (rental.status === "completed" || rental.status === "cancelled") {
      return res.status(400).json({
        message: "Cannot cancel a completed or already cancelled rental",
      });
    }

    // Check if rental is already started (active)
    if (rental.status === "active") {
      return res.status(400).json({
        message: "Cannot cancel an active rental. Please contact support.",
      });
    }

    // ============================================
    // CALCULATE CANCELLATION FEE
    // ============================================
    const cancellationDetails = calculateCancellationFee(rental);
    console.log("📋 Cancellation policy calculation:", {
      rentalId: rental.id,
      ...cancellationDetails
    });

    // Update rental status to cancelled
    // Use a transaction to atomically update rental, payment and owner balances
    const transaction = await db.sequelize.transaction();
    try {
      await rental.update(
        {
          status: "cancelled",
          rejectionReason: reason || "Cancelled by customer",
        },
        { transaction }
      );

      // Make the car available again
      const car = await db.Car.findByPk(rental.carId, { transaction });
      if (car) {
        await car.update({ isAvailable: true }, { transaction });
      }

      // If there is a Payment record for this rental, process partial/full refund
      const payment = await db.Payment.findOne({
        where: { rentalId: rental.id },
        transaction,
      });
      
      if (payment && payment.paymentStatus !== "refunded") {
        let stripeRefundId = null;
        let transferReversalId = null;
        const refundAmountCents = Math.round(cancellationDetails.refundAmount * 100);
        const feeAmountCents = Math.round(cancellationDetails.feeAmount * 100);

        // Attempt Stripe refund if payment intent exists
        try {
          if (payment.stripePaymentIntentId && refundAmountCents > 0) {
            console.log(
              "Attempting Stripe partial refund for payment_intent:",
              payment.stripePaymentIntentId,
              "Amount:", cancellationDetails.refundAmount
            );
            const refundParams = {
              payment_intent: payment.stripePaymentIntentId,
              amount: refundAmountCents, // Partial refund based on cancellation policy
              reason: 'requested_by_customer',
              metadata: {
                cancellation_fee: cancellationDetails.feeAmount.toString(),
                fee_percentage: (cancellationDetails.feePercentage * 100).toString() + '%',
                policy_tier: cancellationDetails.policyTier,
                hours_until_start: cancellationDetails.hoursUntilStart.toFixed(1),
              }
            };
            const refund = await stripe.refunds.create(refundParams);
            stripeRefundId = refund.id;
            console.log("✅ Stripe partial refund created:", stripeRefundId, "Amount:", cancellationDetails.refundAmount);
          } else if (refundAmountCents === 0) {
            console.log("⚠️ No refund issued - cancellation fee equals total amount");
          }
        } catch (stripeErr) {
          console.error(
            "Stripe refund failed:",
            stripeErr && stripeErr.message ? stripeErr.message : stripeErr
          );
        }

        // Attempt to reverse transfer to owner if transferId exists
        if (payment.stripeTransferId) {
          try {
            console.log(
              "Attempting transfer reversal for transfer:",
              payment.stripeTransferId
            );
            // Try common method names for transfer reversal depending on stripe-node version
            try {
              if (
                stripe.transfers &&
                typeof stripe.transfers.createReversal === "function"
              ) {
                const rev = await stripe.transfers.createReversal(
                  payment.stripeTransferId,
                  {
                    amount: Math.round(
                      parseFloat(payment.ownerAmount || 0) * 100
                    ),
                  }
                );
                transferReversalId = rev.id;
              } else if (
                stripe.transfers &&
                stripe.transfers.reversals &&
                typeof stripe.transfers.reversals.create === "function"
              ) {
                const rev = await stripe.transfers.reversals.create(
                  payment.stripeTransferId,
                  {
                    amount: Math.round(
                      parseFloat(payment.ownerAmount || 0) * 100
                    ),
                  }
                );
                transferReversalId = rev.id;
              } else {
                console.warn(
                  "Stripe transfer reversal API not available on this stripe client version."
                );
              }
            } catch (reversalErr) {
              console.error(
                "Transfer reversal attempt failed:",
                reversalErr && reversalErr.message
                  ? reversalErr.message
                  : reversalErr
              );
            }
          } catch (tErr) {
            console.error(
              "Transfer reversal error:",
              tErr && tErr.message ? tErr.message : tErr
            );
          }
        }

        // DB updates: adjust owner balances based on cancellation fee, mark payment status, create Refund audit
        try {
          if (payment.payoutStatus === "paid") {
            const ownerProfile = await db.OwnerProfile.findOne({
              where: { userId: rental.ownerId },
              transaction,
            });
            if (ownerProfile) {
              // Calculate how much to reverse from owner (proportional to refund)
              const ownerAmount = parseFloat(payment.ownerAmount || 0);
              const totalAmount = parseFloat(payment.totalAmount || 0);
              
              // Owner keeps their share of the cancellation fee
              // Refund percentage = refundAmount / totalAmount
              const refundPercentage = totalAmount > 0 ? cancellationDetails.refundAmount / totalAmount : 1;
              const ownerRefundAmount = parseFloat((ownerAmount * refundPercentage).toFixed(2));
              const ownerKeepsAmount = parseFloat((ownerAmount - ownerRefundAmount).toFixed(2));
              
              const newTotalEarnings = Math.max(
                0,
                parseFloat(ownerProfile.totalEarnings || 0) - ownerRefundAmount
              );
              const newAvailableBalance = Math.max(
                0,
                parseFloat(ownerProfile.availableBalance || 0) - ownerRefundAmount
              );
              
              await ownerProfile.update(
                {
                  totalEarnings: newTotalEarnings,
                  availableBalance: newAvailableBalance,
                },
                { transaction }
              );
              
              console.log(
                `📊 Owner balance adjusted for cancellation:`,
                {
                  ownerId: rental.ownerId,
                  originalOwnerAmount: ownerAmount,
                  ownerRefundAmount,
                  ownerKeepsAmount,
                  newTotalEarnings,
                  newAvailableBalance
                }
              );
            }
          }

          const updatedMetadata = Object.assign({}, payment.metadata || {}, {
            refundedAt: new Date(),
            refundReason: reason || "Cancelled by customer",
            stripeRefundId,
            transferReversalId,
            cancellationFee: cancellationDetails.feeAmount,
            cancellationFeePercentage: cancellationDetails.feePercentage * 100,
            refundAmount: cancellationDetails.refundAmount,
            policyTier: cancellationDetails.policyTier,
            hoursUntilStart: cancellationDetails.hoursUntilStart,
          });

          // Update payment status based on whether full or partial refund
          const newPaymentStatus = cancellationDetails.refundAmount > 0 
            ? (cancellationDetails.feeAmount > 0 ? "partial_refund" : "refunded")
            : "cancelled_no_refund";

          await payment.update(
            {
              paymentStatus: newPaymentStatus,
              payoutStatus:
                payment.payoutStatus === "paid"
                  ? "failed"
                  : payment.payoutStatus,
              metadata: updatedMetadata,
            },
            { transaction }
          );

          await rental.update({ 
            paymentStatus: newPaymentStatus,
          }, { transaction });

          // Create Refund audit record
          try {
            await db.Refund.create(
              {
                paymentId: payment.id,
                rentalId: rental.id,
                ownerId: rental.ownerId,
                customerId: rental.customerId,
                stripeRefundId: stripeRefundId,
                amount: cancellationDetails.refundAmount, // Actual refund amount (after fee)
                currency: payment.currency || "usd",
                reason: reason || "Cancelled by customer",
                metadata: { 
                  stripeRefundId, 
                  transferReversalId,
                  originalAmount: cancellationDetails.totalAmount,
                  cancellationFee: cancellationDetails.feeAmount,
                  feePercentage: cancellationDetails.feePercentage * 100,
                  policyTier: cancellationDetails.policyTier,
                  hoursUntilStart: cancellationDetails.hoursUntilStart,
                },
              },
              { transaction }
            );
          } catch (refundRecErr) {
            console.error(
              "Failed to create Refund audit record:",
              refundRecErr && refundRecErr.message
                ? refundRecErr.message
                : refundRecErr
            );
          }
        } catch (dbErr) {
          console.error(
            "DB update during cancellation refund failed:",
            dbErr && dbErr.message ? dbErr.message : dbErr
          );
          throw dbErr;
        }
      }

      await transaction.commit();
    } catch (txErr) {
      await transaction.rollback();
      console.error("Error processing cancellation refund updates:", txErr);
      // Continue - we still want to return a cancelled response even if reversal failed
    }

    // Send notification to owner about cancellation
    try {
      const notificationResult =
        await NotificationService.notifyOwnerBookingCancelled(rental, reason);
      if (notificationResult.success) {
        console.log(
          `✅ Owner notification sent successfully for cancelled rental ${rental.id}`
        );
      } else {
        console.error(
          `❌ Failed to send owner notification: ${notificationResult.error}`
        );
      }
    } catch (notifErr) {
      console.error("Error sending cancellation notification:", notifErr);
    }

    // Return response with cancellation details
    res.json({
      message: "Booking cancelled successfully",
      rental: rental,
      cancellation: {
        policyTier: cancellationDetails.policyTier,
        hoursUntilStart: Math.round(cancellationDetails.hoursUntilStart),
        originalAmount: cancellationDetails.totalAmount,
        cancellationFee: cancellationDetails.feeAmount,
        feePercentage: Math.round(cancellationDetails.feePercentage * 100),
        refundAmount: cancellationDetails.refundAmount,
        refundMessage: getCancellationMessage(cancellationDetails),
      },
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get human-readable cancellation message based on policy tier
 */
const getCancellationMessage = (details) => {
  switch (details.policyTier) {
    case 'FULL_REFUND':
      return `Full refund of $${details.refundAmount.toFixed(2)} will be processed.`;
    case 'LOW_FEE':
      return `A 25% cancellation fee ($${details.feeAmount.toFixed(2)}) applies. You will receive a refund of $${details.refundAmount.toFixed(2)}.`;
    case 'MEDIUM_FEE':
      return `A 50% cancellation fee ($${details.feeAmount.toFixed(2)}) applies. You will receive a refund of $${details.refundAmount.toFixed(2)}.`;
    case 'HIGH_FEE':
      return `A 75% cancellation fee ($${details.feeAmount.toFixed(2)}) applies due to late cancellation. You will receive a refund of $${details.refundAmount.toFixed(2)}.`;
    default:
      return `Refund of $${details.refundAmount.toFixed(2)} will be processed.`;
  }
};

// Temporary function to create test data
export const createTestBooking = async (req, res) => {
  try {
    // Prevent admins from creating bookings — only customers/owners may create bookings
    if (req.user && req.user.role === "admin") {
      console.warn(
        "createTestBooking - Admin attempted to create a booking",
        req.user.id
      );
      return res
        .status(403)
        .json({ message: "Admins are not allowed to create bookings" });
    }
    // First, assign current user as owner of all cars that don't have an owner
    const carsWithoutOwner = await db.Car.findAll({
      where: {
        ownerId: null,
      },
    });

    if (carsWithoutOwner.length > 0) {
      await db.Car.update(
        { ownerId: req.user.id },
        { where: { ownerId: null } }
      );
      console.log(
        `Assigned ${carsWithoutOwner.length} cars to owner ${req.user.id}`
      );
    }

    // Create a test customer if none exists
    let testCustomer = await db.User.findOne({ where: { role: "customer" } });
    if (!testCustomer) {
      testCustomer = await db.User.create({
        name: "Test Customer",
        email: "test@customer.com",
        password: "hashedpassword",
        role: "customer",
        isActive: true,
      });
    }

    // Get the first available car
    const car = await db.Car.findOne({ where: { ownerId: req.user.id } });
    if (!car) {
      return res.status(404).json({ message: "No cars found for this owner" });
    }

    // Create a test rental booking
    const testRental = await db.Rental.create({
      customerId: testCustomer.id,
      carId: car.id,
      ownerId: req.user.id,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      totalDays: 2,
      totalCost: 200,
      totalAmount: 200,
      status: "pending_approval",
      paymentStatus: "paid",
      pickupLocation: "Test Location",
      dropoffLocation: "Test Location",
      hasInsurance: true,
      hasGPS: false,
      hasChildSeat: false,
      hasAdditionalDriver: false,
    });

    res.json({
      message: "Test booking created successfully",
      rental: testRental,
      carsAssigned: carsWithoutOwner.length,
    });
  } catch (error) {
    console.error("Error creating test booking:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get active rentals for owner's cars
export const getOwnerActiveRentals = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ownerId = req.user.id;
    console.log(
      "getOwnerActiveRentals - Fetching active rentals for owner:",
      ownerId
    );

    const activeRentals = await db.Rental.findAll({
      where: {
        ownerId: ownerId,
        status: {
          [Op.in]: ["active", "approved"],
        },
        endDate: {
          [Op.gte]: new Date(),
        },
      },
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: [
            "id",
            "name",
            "model",
            "brand",
            "year",
            "rentalPricePerDay",
          ],
          include: [
            {
              model: db.CarImage,
              as: "images",
              attributes: ["id", "imageUrl", "isPrimary", "order"],
              limit: 1,
              order: [
                ["isPrimary", "DESC"],
                ["order", "ASC"],
              ],
            },
          ],
        },
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["endDate", "ASC"]],
    });

    console.log(
      `getOwnerActiveRentals - Found ${activeRentals.length} active rentals`
    );
    res.json(activeRentals);
  } catch (error) {
    console.error("getOwnerActiveRentals - Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Preview cancellation fee before actually cancelling
export const getCancellationPreview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const rental = await db.Rental.findOne({
      where: {
        id: id,
        customerId: req.user.id,
      },
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: ["id", "name", "model", "brand", "year"],
        },
      ],
    });

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found or you don't have permission to view it",
      });
    }

    // Check if rental can be cancelled
    if (rental.status === "completed" || rental.status === "cancelled") {
      return res.status(400).json({
        message: "This booking is already completed or cancelled",
        canCancel: false,
      });
    }

    if (rental.status === "active") {
      return res.status(400).json({
        message: "Cannot cancel an active rental. Please contact support.",
        canCancel: false,
      });
    }

    // Calculate cancellation fee
    const cancellationDetails = calculateCancellationFee(rental);

    res.json({
      canCancel: true,
      rental: {
        id: rental.id,
        car: rental.car,
        startDate: rental.startDate,
        endDate: rental.endDate,
        status: rental.status,
      },
      cancellation: {
        policyTier: cancellationDetails.policyTier,
        hoursUntilStart: Math.round(cancellationDetails.hoursUntilStart),
        originalAmount: cancellationDetails.totalAmount,
        cancellationFee: cancellationDetails.feeAmount,
        feePercentage: Math.round(cancellationDetails.feePercentage * 100),
        refundAmount: cancellationDetails.refundAmount,
        message: getCancellationMessage(cancellationDetails),
      },
      policy: {
        description: "Cancellation Policy",
        tiers: [
          { name: "Full Refund", condition: "More than 48 hours before start", fee: "0%" },
          { name: "Low Fee", condition: "24-48 hours before start", fee: "25%" },
          { name: "Medium Fee", condition: "12-24 hours before start", fee: "50%" },
          { name: "High Fee", condition: "Less than 12 hours before start", fee: "75%" },
        ],
      },
    });
  } catch (error) {
    console.error("Error getting cancellation preview:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteRental = async (req, res) => {
  const { id } = req.params;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const rental = await db.Rental.findOne({
      where: {
        id: id,
        customerId: req.user.id,
      },
    });

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found or you don't have permission to cancel it",
      });
    }

    // Check if rental is already completed
    if (new Date(rental.endDate) < new Date()) {
      return res.status(400).json({
        message: "Cannot cancel a completed rental",
      });
    }

    // Get the car and update its availability
    const car = await db.Car.findByPk(rental.carId);
    if (car) {
      await car.update({ isAvailable: true });
    }

    await rental.destroy();
    return res.status(200).json({ message: "Rental cancelled successfully" });
  } catch (error) {
    console.error("Error canceling rental:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
