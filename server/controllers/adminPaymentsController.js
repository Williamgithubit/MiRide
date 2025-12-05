import db from "../models/index.js";
import { Op } from "sequelize";

const { Rental, User, Car, Payment } = db;

/**
 * Get payment statistics for admin dashboard
 */
export const getPaymentStats = async (req, res) => {
  try {
    // Calculate total revenue from platform fees (commission) only
    const completedRentals = await Rental.findAll({
      where: {
        paymentStatus: "paid",
        status: { [Op.in]: ["approved", "active", "completed"] },
      },
    });

    console.log("📈 Admin Payment Stats Debug:");
    console.log(`Total rentals found: ${completedRentals.length}`);
    if (completedRentals.length > 0) {
      console.log("Sample rental:", {
        id: completedRentals[0].id,
        totalAmount: completedRentals[0].totalAmount,
        platformFee: completedRentals[0].platformFee,
        ownerPayout: completedRentals[0].ownerPayout,
        status: completedRentals[0].status,
        paymentStatus: completedRentals[0].paymentStatus,
      });
    }

    // Platform revenue is the commission (platformFee), not the full amount
    const totalRevenue = completedRentals.reduce(
      (sum, rental) => sum + parseFloat(rental.platformFee || 0),
      0
    );
    const platformCommission = totalRevenue; // Same as totalRevenue since we only count commission

    console.log(`Total Revenue (from Rentals): $${totalRevenue.toFixed(2)}`);

    // Calculate monthly revenue (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRentals = await Rental.findAll({
      where: {
        paymentStatus: "paid",
        status: { [Op.in]: ["approved", "active", "completed"] },
        createdAt: { [Op.gte]: startOfMonth },
      },
    });

    const monthlyRevenue = monthlyRentals.reduce(
      (sum, rental) => sum + parseFloat(rental.platformFee || 0),
      0
    );

    // Count pending payments
    const pendingPayments = await Rental.count({
      where: {
        paymentStatus: "pending",
      },
    });

    // Count completed payments
    const completedPayments = await Rental.count({
      where: {
        paymentStatus: "paid",
        status: { [Op.in]: ["approved", "active", "completed"] },
      },
    });

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      pendingPayments,
      completedPayments,
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

    const whereClause = {};

    if (status) {
      whereClause.paymentStatus = status;
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
        { id: { [Op.like]: `%${search}%` } },
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
              attributes: ["id", "brand", "model", "year", "imageUrl"],
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
      id: p.id,
      transactionId: p.stripePaymentIntentId || `PAY-${p.id}`,
      customer: p.customer
        ? { id: p.customer.id, name: p.customer.name }
        : null,
      owner: p.owner ? { id: p.owner.id, name: p.owner.name } : null,
      car:
        p.rental && p.rental.car
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
      payoutStatus: p.payoutStatus,
      createdAt: p.createdAt,
      meta: {
        rentalId: p.rentalId,
        startDate: p.rental?.startDate,
        endDate: p.rental?.endDate,
        pickupLocation: p.rental?.pickupLocation,
        dropoffLocation: p.rental?.dropoffLocation,
        metadata: p.metadata || {},
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
 * Get a single transaction by ID
 */
export const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching payment transaction with ID:", id);

    const payment = await Payment.findByPk(id, {
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
              attributes: [
                "id",
                "brand",
                "model",
                "year",
                "imageUrl",
                "licensePlate",
              ],
            },
          ],
        },
      ],
    });

    if (!payment) {
      console.log("Payment not found for ID:", id);
      return res.status(404).json({ message: "Payment not found" });
    }

    const transaction = {
      id: payment.id,
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
      car:
        payment.rental && payment.rental.car
          ? {
              id: payment.rental.car.id,
              title:
                `${payment.rental.car.year || ""} ${
                  payment.rental.car.brand || ""
                } ${payment.rental.car.model || ""}`.trim() || "N/A",
              licensePlate: payment.rental.car.licensePlate || "N/A",
              imageUrl: payment.rental.car.imageUrl || null,
            }
          : null,
      amount: parseFloat(payment.totalAmount || 0),
      platformFee: parseFloat(payment.platformFee || 0),
      ownerAmount: parseFloat(payment.ownerAmount || 0),
      currency: payment.currency || "USD",
      paymentMethod: payment.metadata?.payment_method || "card",
      status: payment.paymentStatus,
      payoutStatus: payment.payoutStatus,
      createdAt: payment.createdAt,
      meta: {
        rentalId: payment.rentalId,
        startDate: payment.rental?.startDate,
        endDate: payment.rental?.endDate,
        pickupLocation: payment.rental?.pickupLocation || "N/A",
        dropoffLocation: payment.rental?.dropoffLocation || "N/A",
        metadata: payment.metadata || {},
      },
    };

    console.log("Sending payment transaction response");
    res.json(transaction);
  } catch (error) {
    console.error("Error fetching payment transaction:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error fetching payment transaction",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Export transactions as CSV
 */
export const exportTransactions = async (req, res) => {
  try {
    const { search, owner, customer, status, startDate, endDate } = req.query;

    // Build where clause (same as getTransactions)
    const whereClause = {};

    if (status) {
      whereClause.paymentStatus = status;
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
      "Transaction ID,Customer,Owner,Car,Amount,Platform Fee,Owner Amount,Status,Date,Rental Period\n";
    const csvRows = payments
      .map((p) => {
        const transactionId = p.stripePaymentIntentId || `PAY-${p.id}`;
        const customerName = p.customer?.name || "N/A";
        const ownerName = p.owner?.name || "N/A";
        const carTitle =
          p.rental && p.rental.car
            ? `${p.rental.car.year} ${p.rental.car.brand} ${p.rental.car.model}`
            : "N/A";
        const amount = parseFloat(p.totalAmount || 0).toFixed(2);
        const platformFee = parseFloat(p.platformFee || 0).toFixed(2);
        const ownerAmount = parseFloat(p.ownerAmount || 0).toFixed(2);
        const status = p.paymentStatus;
        const date = p.createdAt
          ? new Date(p.createdAt).toLocaleDateString()
          : "N/A";
        const period =
          p.rental && p.rental.startDate && p.rental.endDate
            ? `${new Date(
                p.rental.startDate
              ).toLocaleDateString()} - ${new Date(
                p.rental.endDate
              ).toLocaleDateString()}`
            : "";

        return `"${transactionId}","${customerName}","${ownerName}","${carTitle}","${amount}","${platformFee}","${ownerAmount}","${status}","${date}","${period}"`;
      })
      .join("\n");

    const csv = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=payments_export.csv"
    );
    res.send(csv);
  } catch (error) {
    console.error("Error exporting transactions:", error);
    res
      .status(500)
      .json({ message: "Error exporting transactions", error: error.message });
  }
};
