import db from "../models/index.js";
import { Op } from "sequelize";

const { Rental, User, Car, Payment } = db;

/**
 * Get payment statistics for admin dashboard
 * Uses Payment table which has accurate commission data
 */
export const getPaymentStats = async (req, res) => {
  try {
    // Get commission data from Payment table (has accurate platformFee)
    const completedPayments = await Payment.findAll({
      where: {
        paymentStatus: "succeeded",
      },
    });

    console.log("📈 Admin Payment Stats Debug:");
    console.log(`Total payments found: ${completedPayments.length}`);
    if (completedPayments.length > 0) {
      console.log("Sample payment:", {
        id: completedPayments[0].id,
        totalAmount: completedPayments[0].totalAmount,
        platformFee: completedPayments[0].platformFee,
        ownerAmount: completedPayments[0].ownerAmount,
        paymentStatus: completedPayments[0].paymentStatus,
      });
    }

    // Platform revenue is the commission (platformFee)
    const totalRevenue = completedPayments.reduce(
      (sum, payment) => sum + parseFloat(payment.platformFee || 0),
      0
    );
    const platformCommission = totalRevenue;

    console.log(`Total Revenue (from Payments): $${totalRevenue.toFixed(2)}`);

    // Calculate monthly revenue (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyPayments = await Payment.findAll({
      where: {
        paymentStatus: "succeeded",
        createdAt: { [Op.gte]: startOfMonth },
      },
    });

    const monthlyRevenue = monthlyPayments.reduce(
      (sum, payment) => sum + parseFloat(payment.platformFee || 0),
      0
    );

    // Count pending payments from Rental table
    const pendingPaymentsCount = await Rental.count({
      where: {
        paymentStatus: "pending",
      },
    });

    // Count completed payments from Payment table
    const completedPaymentsCount = await Payment.count({
      where: {
        paymentStatus: "succeeded",
      },
    });

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      pendingPayments: pendingPaymentsCount,
      completedPayments: completedPaymentsCount,
      platformCommission: parseFloat(platformCommission.toFixed(2)),
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({
      message: "Error fetching payment statistics",
      error: error.message,
    });
  }
};

/**
 * Get all transactions with filtering and pagination
 * Queries from Payment table which has accurate commission data
 */
export const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search,
      owner,
      customer,
      status,
      startDate,
      endDate,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const whereClause = {
      paymentStatus: "succeeded", // Only show succeeded payments
    };

    // Map status filter
    if (status) {
      if (status === "success" || status === "completed" || status === "succeeded") {
        whereClause.paymentStatus = "succeeded";
      } else if (status === "pending") {
        whereClause.paymentStatus = "pending";
      } else if (status === "failed") {
        whereClause.paymentStatus = "failed";
      }
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = endDateTime;
      }
    }

    // Search across payment id or stripe ids
    if (search) {
      whereClause[Op.or] = [
        { stripePaymentIntentId: { [Op.like]: `%${search}%` } },
        { stripeTransferId: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email"],
          where: customer
            ? { name: { [Op.like]: `%${customer}%` } }
            : undefined,
          required: !!customer,
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email"],
          where: owner ? { name: { [Op.like]: `%${owner}%` } } : undefined,
          required: !!owner,
        },
        {
          model: Rental,
          as: "rental",
          include: [
            {
              model: Car,
              as: "car",
              attributes: ["id", "brand", "model", "year"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    const items = payments.map((p) => ({
      id: p.rentalId, // Use rental ID for display
      transactionId: p.stripePaymentIntentId || `PAY-${p.id}`,
      customer: p.customer
        ? { id: p.customer.id, name: p.customer.name }
        : null,
      owner: p.owner ? { id: p.owner.id, name: p.owner.name } : null,
      car: p.rental?.car
        ? {
            id: p.rental.car.id,
            title: `${p.rental.car.year} ${p.rental.car.brand} ${p.rental.car.model}`,
          }
        : null,
      amount: parseFloat(p.totalAmount || 0),
      platformFee: parseFloat(p.platformFee || 0),
      ownerAmount: parseFloat(p.ownerAmount || 0),
      currency: p.currency || "USD",
      paymentMethod: p.metadata?.payment_method || "card",
      status: p.paymentStatus,
      bookingStatus: p.rental?.status || "N/A",
      payoutStatus: p.payoutStatus,
      createdAt: p.createdAt,
      meta: {
        rentalId: p.rentalId,
        paymentId: p.id,
        startDate: p.rental?.startDate,
        endDate: p.rental?.endDate,
        pickupLocation: p.rental?.pickupLocation,
        dropoffLocation: p.rental?.dropoffLocation,
      },
    }));

    res.json({
      items,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: error.message });
  }
};

/**
 * Get a single transaction by ID (rental ID)
 * Queries from Payment table which has accurate commission data
 */
export const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching payment transaction for rental ID:", id);

    // Find payment by rental ID
    const payment = await Payment.findOne({
      where: { rentalId: id },
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone"],
          required: false,
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email", "phone"],
          required: false,
        },
        {
          model: Rental,
          as: "rental",
          include: [
            {
              model: Car,
              as: "car",
              attributes: ["id", "brand", "model", "year"],
            },
          ],
        },
      ],
    });

    if (!payment) {
      console.log("Payment not found for rental ID:", id);
      return res.status(404).json({ message: "Transaction not found" });
    }

    const transaction = {
      id: payment.rentalId,
      transactionId: payment.stripePaymentIntentId || `PAY-${payment.id}`,
      customer: payment.customer
        ? {
            id: payment.customer.id,
            name: payment.customer.name || "N/A",
            email: payment.customer.email || "N/A",
            phone: payment.customer.phone || "N/A",
          }
        : null,
      owner: payment.owner
        ? {
            id: payment.owner.id,
            name: payment.owner.name || "N/A",
            email: payment.owner.email || "N/A",
            phone: payment.owner.phone || "N/A",
          }
        : null,
      car: payment.rental?.car
        ? {
            id: payment.rental.car.id,
            title:
              `${payment.rental.car.year || ""} ${payment.rental.car.brand || ""} ${
                payment.rental.car.model || ""
              }`.trim() || "N/A",
          }
        : null,
      amount: parseFloat(payment.totalAmount || 0),
      platformFee: parseFloat(payment.platformFee || 0),
      ownerAmount: parseFloat(payment.ownerAmount || 0),
      currency: payment.currency || "USD",
      paymentMethod: payment.metadata?.payment_method || "card",
      status: payment.paymentStatus,
      bookingStatus: payment.rental?.status || "N/A",
      payoutStatus: payment.payoutStatus,
      createdAt: payment.createdAt,
      meta: {
        rentalId: payment.rentalId,
        paymentId: payment.id,
        startDate: payment.rental?.startDate,
        endDate: payment.rental?.endDate,
        pickupLocation: payment.rental?.pickupLocation || "N/A",
        dropoffLocation: payment.rental?.dropoffLocation || "N/A",
        totalDays: payment.rental?.totalDays,
        specialRequests: payment.rental?.specialRequests,
      },
    };

    console.log("Sending payment transaction response");
    res.json(transaction);
  } catch (error) {
    console.error("Error fetching payment transaction:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error fetching transaction",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Export transactions as CSV
 * Queries from Payment table which has accurate commission data
 */
export const exportTransactions = async (req, res) => {
  try {
    const { search, owner, customer, status, startDate, endDate } = req.query;

    // Build where clause (same as getTransactions)
    const whereClause = {
      paymentStatus: "succeeded", // Only export succeeded payments
    };

    // Map status filter
    if (status) {
      if (status === "success" || status === "completed" || status === "succeeded") {
        whereClause.paymentStatus = "succeeded";
      } else if (status === "pending") {
        whereClause.paymentStatus = "pending";
      } else if (status === "failed") {
        whereClause.paymentStatus = "failed";
      }
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = endDateTime;
      }
    }

    const payments = await Payment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email"],
          where: customer
            ? { name: { [Op.like]: `%${customer}%` } }
            : undefined,
          required: !!customer,
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email"],
          where: owner ? { name: { [Op.like]: `%${owner}%` } } : undefined,
          required: !!owner,
        },
        {
          model: Rental,
          as: "rental",
          include: [
            {
              model: Car,
              as: "car",
              attributes: ["id", "brand", "model", "year"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Generate CSV
    const csvHeader =
      "Transaction ID,Customer,Owner,Car,Amount,Platform Fee,Owner Amount,Payment Status,Booking Status,Date,Rental Period\n";
    const csvRows = payments
      .map((p) => {
        const transactionId = p.stripePaymentIntentId || `PAY-${p.id}`;
        const customerName = p.customer?.name || "N/A";
        const ownerName = p.owner?.name || "N/A";
        const carTitle = p.rental?.car
          ? `${p.rental.car.year} ${p.rental.car.brand} ${p.rental.car.model}`
          : "N/A";
        const amount = parseFloat(p.totalAmount || 0).toFixed(2);
        const platformFee = parseFloat(p.platformFee || 0).toFixed(2);
        const ownerAmount = parseFloat(p.ownerAmount || 0).toFixed(2);
        const paymentStatus = p.paymentStatus;
        const bookingStatus = p.rental?.status || "N/A";
        const date = p.createdAt
          ? new Date(p.createdAt).toLocaleDateString()
          : "N/A";
        const period =
          p.rental?.startDate && p.rental?.endDate
            ? `${new Date(p.rental.startDate).toLocaleDateString()} - ${new Date(
                p.rental.endDate
              ).toLocaleDateString()}`
            : "";

        return `"${transactionId}","${customerName}","${ownerName}","${carTitle}","${amount}","${platformFee}","${ownerAmount}","${paymentStatus}","${bookingStatus}","${date}","${period}"`;
      })
      .join("\n");

    const csv = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transactions_export.csv"
    );
    res.send(csv);
  } catch (error) {
    console.error("Error exporting transactions:", error);
    res
      .status(500)
      .json({ message: "Error exporting transactions", error: error.message });
  }
};
