import db from "../models/index.js";
import { Op } from "sequelize";

/**
 * Get user report with statistics and analytics
 */
export const getUserReport = async (req, res) => {
  try {
    const { startDate, endDate, userType, searchQuery } = req.query;

    // Build where clause for date filtering
    const dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.createdAt = {
        [Op.between]: [start, end],
      };
    }

    // Build where clause for user type
    const userTypeFilter = {};
    if (userType && userType !== "all") {
      userTypeFilter.role = userType;
    }

    // Total users
    const totalUsers = await db.User.count({
      where: userTypeFilter,
    });

    // Active users (based on isActive flag)
    const activeUsers = await db.User.count({
      where: {
        ...userTypeFilter,
        isActive: true,
      },
    });

    const inactiveUsers = totalUsers - activeUsers;

    // New registrations in date range
    const newRegistrations = await db.User.count({
      where: {
        ...userTypeFilter,
        ...dateFilter,
      },
    });

    // Users by role
    const usersByRole = await db.User.findAll({
      attributes: [
        "role",
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
      ],
      group: ["role"],
      raw: true,
    });

    // Registration trend (daily counts within date range)
    const registrationTrend = await db.User.findAll({
      attributes: [
        [
          db.sequelize.fn(
            "to_char",
            db.sequelize.col("created_at"),
            "YYYY-MM-DD"
          ),
          "date",
        ],
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
      ],
      where: {
        ...userTypeFilter,
        ...dateFilter,
      },
      group: ["date"],
      order: [[db.sequelize.literal("date"), "ASC"]],
      raw: true,
    });

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      newRegistrations,
      usersByRole: usersByRole.map((item) => ({
        role: item.role.charAt(0).toUpperCase() + item.role.slice(1),
        count: parseInt(item.count),
      })),
      registrationTrend: registrationTrend.map((item) => ({
        date: item.date,
        count: parseInt(item.count),
      })),
    });
  } catch (error) {
    console.error("Error fetching user report:", error);
    res.status(500).json({
      message: "Failed to fetch user report",
      error: error.message,
    });
  }
};

/**
 * Get car report with statistics and analytics
 */
export const getCarReport = async (req, res) => {
  try {
    const { startDate, endDate, carCategory, searchQuery } = req.query;
    // Build where clause (safe: check model attributes at runtime)
    const whereClause = {};

    // Determine which field to use for "category" filtering/grouping.
    // Some deployments may use a 'category' column; fallback to 'brand' if missing.
    const carModelAttrs =
      db.Car && db.Car.rawAttributes ? db.Car.rawAttributes : {};
    const categoryField = carModelAttrs.category
      ? "category"
      : carModelAttrs.brand
      ? "brand"
      : null;

    if (carCategory && carCategory !== "all" && categoryField) {
      whereClause[categoryField] = carCategory;
    }

    // Total cars
    const totalCars = await db.Car.count({ where: whereClause });

    // Cars by availability: model uses `isAvailable` boolean (field: is_available)
    const hasIsAvailable = !!carModelAttrs.isAvailable;
    const availableCars = hasIsAvailable
      ? await db.Car.count({ where: { ...whereClause, isAvailable: true } })
      : 0;

    // Maintenance cars: count distinct cars that have non-completed maintenance entries
    let maintenanceCars = 0;
    if (db.Maintenance) {
      const maintenanceRows = await db.Maintenance.findAll({
        attributes: [
          "carId",
          [db.sequelize.fn("COUNT", db.sequelize.col("carId")), "count"],
        ],
        where: {
          status: { [Op.ne]: "completed" },
        },
        include: categoryField
          ? [
              {
                model: db.Car,
                as: "car",
                where: whereClause,
                attributes: [],
                required: true,
              },
            ]
          : [],
        group: ["carId"],
        raw: true,
      });

      maintenanceCars = maintenanceRows ? maintenanceRows.length : 0;
    }

    // Rented cars: best-effort -- if isAvailable exists, treat not-available and not-in-maintenance as rented
    let rentedCars = 0;
    if (hasIsAvailable) {
      rentedCars = Math.max(0, totalCars - availableCars - maintenanceCars);
    } else {
      // Fallback: try to infer from rentals (cars with active rentals)
      try {
        const activeRentalRows = await db.Rental.findAll({
          attributes: [
            [db.sequelize.fn("COUNT", db.sequelize.col("Rental.id")), "count"],
          ],
          include: [
            {
              model: db.Car,
              as: "car",
              where: whereClause,
              attributes: [],
              required: true,
            },
          ],
          where: {
            status: { [Op.in]: ["approved", "active"] },
          },
          raw: true,
        });

        rentedCars =
          activeRentalRows && activeRentalRows.length
            ? parseInt(activeRentalRows[0].count || 0)
            : 0;
      } catch (e) {
        rentedCars = 0;
      }
    }

    // Cars by category (or brand)
    let carsByCategory = [];
    if (categoryField) {
      const rows = await db.Car.findAll({
        attributes: [
          categoryField,
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
        ],
        where: whereClause,
        group: [categoryField],
        raw: true,
      });

      carsByCategory = rows.map((item) => ({
        category: item[categoryField],
        count: parseInt(item.count, 10),
      }));
    }

    // Cars by status (simple normalized view expected by frontend)
    const carsByStatus = [
      { status: "available", count: availableCars },
      { status: "maintenance", count: maintenanceCars },
      { status: "rented", count: rentedCars },
    ];

    res.json({
      totalCars,
      availableCars,
      rentedCars,
      maintenanceCars,
      carsByCategory,
      carsByStatus,
    });
  } catch (error) {
    console.error("Error fetching car report:", error);
    res.status(500).json({
      message: "Failed to fetch car report",
      error: error.message,
    });
  }
};

/**
 * Get booking report with statistics and trends
 */
export const getBookingReport = async (req, res) => {
  try {
    const { startDate, endDate, bookingStatus, searchQuery } = req.query;

    // Build where clause for date filtering (make endDate inclusive to include the full day)
    const dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.createdAt = {
        [Op.between]: [start, end],
      };
    }

    // Map frontend bookingStatus values to DB status values
    // Frontend uses: pending, confirmed, active, completed, cancelled
    // DB uses: pending_approval, approved, active, completed, cancelled
    const statusFilter = {};
    if (bookingStatus && bookingStatus !== "all") {
      switch (bookingStatus) {
        case "pending":
          statusFilter.status = "pending_approval";
          break;
        case "confirmed":
          // 'confirmed' should include approved and active in our DB
          statusFilter.status = { [Op.in]: ["approved", "active"] };
          break;
        case "active":
          statusFilter.status = "active";
          break;
        case "completed":
          statusFilter.status = "completed";
          break;
        case "cancelled":
          statusFilter.status = "cancelled";
          break;
        default:
          // fallback to whatever was provided
          statusFilter.status = bookingStatus;
      }
    }

    const whereClause = { ...dateFilter, ...statusFilter };

    // Total bookings (using Rental model)
    const totalBookings = await db.Rental.count({ where: whereClause });

    // Bookings by status (matching Rental model statuses)
    const pendingBookings = await db.Rental.count({
      where: { ...whereClause, status: "pending_approval" },
    });

    const confirmedBookings = await db.Rental.count({
      where: { ...whereClause, status: { [Op.in]: ["approved", "active"] } },
    });

    const completedBookings = await db.Rental.count({
      where: { ...whereClause, status: "completed" },
    });

    const cancelledBookings = await db.Rental.count({
      where: { ...whereClause, status: "cancelled" },
    });

    // Daily trend
    const dailyTrend = await db.Rental.findAll({
      attributes: [
        [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "date"],
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
      ],
      where: whereClause,
      group: [db.sequelize.fn("DATE", db.sequelize.col("created_at"))],
      order: [[db.sequelize.fn("DATE", db.sequelize.col("created_at")), "ASC"]],
      raw: true,
    });

    // Weekly trend (group by week)
    const weeklyTrend = await db.Rental.findAll({
      attributes: [
        [
          db.sequelize.fn("date_trunc", "week", db.sequelize.col("created_at")),
          "week",
        ],
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
      ],
      where: whereClause,
      group: ["week"],
      order: [
        [
          db.sequelize.fn("date_trunc", "week", db.sequelize.col("created_at")),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Monthly trend
    const monthlyTrend = await db.Rental.findAll({
      attributes: [
        [
          db.sequelize.fn(
            "to_char",
            db.sequelize.col("created_at"),
            "Mon YYYY"
          ),
          "month",
        ],
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
      ],
      where: whereClause,
      group: ["month"],
      order: [[db.sequelize.literal("MIN(created_at)"), "ASC"]],
      raw: true,
    });

    res.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      dailyTrend: dailyTrend.map((item) => ({
        date:
          item.date && item.date instanceof Date
            ? item.date.toISOString().split("T")[0]
            : String(item.date),
        count: parseInt(item.count, 10),
      })),
      weeklyTrend: weeklyTrend.map((item, index) => ({
        week: `Week ${index + 1}`,
        count: parseInt(item.count),
      })),
      monthlyTrend: monthlyTrend.map((item) => ({
        month: item.month,
        count: parseInt(item.count),
      })),
    });
  } catch (error) {
    console.error("Error fetching booking report:", error);
    res.status(500).json({
      message: "Failed to fetch booking report",
      error: error.message,
    });
  }
};

/**
 * Get revenue report with financial analytics
 */
export const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build where clause for date filtering
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Get all completed rentals for revenue calculation and include stored fee fields
    // We select COALESCE columns to ensure numeric values even if columns are null
    const completedRentals = await db.Rental.findAll({
      where: {
        ...dateFilter,
        paymentStatus: "paid",
        status: { [Op.in]: ["approved", "active", "completed"] },
      },
      attributes: [
        "createdAt",
        [db.sequelize.literal("COALESCE(total_amount, 0)"), "totalAmount"],
        [db.sequelize.literal("COALESCE(platform_fee, 0)"), "platformFee"],
        [db.sequelize.literal("COALESCE(owner_payout, 0)"), "ownerPayout"],
        [
          db.sequelize.literal("COALESCE(payout_status, 'pending')"),
          "payoutStatus",
        ],
      ],
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: ["brand"],
        },
      ],
      raw: false,
    });

    // Calculate totals. Prefer Payment records when available because they represent real transactions.
    let totalRevenue = 0;
    let totalCommissions = 0;
    let totalPayouts = 0;
    let pendingPayouts = 0;

    const fallbackCommissionRate = 0.15;

    // Try to compute sums from Payments table first
    const paymentWhere = {
      ...(dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {}),
      paymentStatus: { [Op.in]: ["succeeded", "processing"] },
    };

    const payments = await db.Payment.findAll({
      where: paymentWhere,
      attributes: [
        [
          db.sequelize.fn(
            "COALESCE",
            db.sequelize.fn("SUM", db.sequelize.col("total_amount")),
            0
          ),
          "totalRevenue",
        ],
        [
          db.sequelize.fn(
            "COALESCE",
            db.sequelize.fn("SUM", db.sequelize.col("platform_fee")),
            0
          ),
          "totalCommissions",
        ],
        [
          db.sequelize.fn(
            "COALESCE",
            db.sequelize.fn("SUM", db.sequelize.col("owner_amount")),
            0
          ),
          "totalPayouts",
        ],
      ],
      raw: true,
    });

    if (
      payments &&
      payments.length > 0 &&
      (Number(payments[0].totalRevenue) > 0 ||
        Number(payments[0].totalCommissions) > 0 ||
        Number(payments[0].totalPayouts) > 0)
    ) {
      totalRevenue = parseFloat(payments[0].totalRevenue || 0);
      totalCommissions = parseFloat(payments[0].totalCommissions || 0);
      totalPayouts = parseFloat(payments[0].totalPayouts || 0);

      // Pending payouts: payments with payout_status != 'paid'
      const pendingRows = await db.Payment.findAll({
        where: {
          ...(dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {}),
          payoutStatus: { [Op.ne]: "paid" },
        },
        attributes: [
          [
            db.sequelize.fn(
              "COALESCE",
              db.sequelize.fn("SUM", db.sequelize.col("owner_amount")),
              0
            ),
            "pendingPayouts",
          ],
        ],
        raw: true,
      });
      pendingPayouts = parseFloat(pendingRows[0].pendingPayouts || 0);
    } else {
      // Fallback to rental-level stored fields
      completedRentals.forEach((rental) => {
        const revenue = parseFloat(rental.get("totalAmount") || 0);
        const platformFee = parseFloat(rental.get("platformFee") || 0);
        let ownerPayout = parseFloat(rental.get("ownerPayout") || 0);
        const payoutStatus = rental.get("payoutStatus") || "pending";

        if (!ownerPayout) {
          ownerPayout = Math.max(0, revenue - platformFee);
        }

        const commission =
          platformFee > 0
            ? platformFee
            : parseFloat((revenue * fallbackCommissionRate).toFixed(2));

        totalRevenue += revenue;
        totalCommissions += commission;
        totalPayouts += ownerPayout;

        if (payoutStatus !== "paid") {
          pendingPayouts += ownerPayout;
        }
      });
    }

    // Revenue by month
    const revenueByMonth = {};
    const revenueByCategory = {};

    // If payments were used, aggregate by payments grouped by month and by category (via rental->car)
    const paymentsUsed =
      payments &&
      payments.length > 0 &&
      (Number(payments[0].totalRevenue) > 0 ||
        Number(payments[0].totalCommissions) > 0 ||
        Number(payments[0].totalPayouts) > 0);

    if (paymentsUsed) {
      // Aggregate monthly sums from payments
      const paymentsMonthly = await db.Payment.findAll({
        where: paymentWhere,
        attributes: [
          [
            db.sequelize.fn(
              "to_char",
              db.sequelize.col("created_at"),
              "Mon YYYY"
            ),
            "month",
          ],
          [
            db.sequelize.fn(
              "COALESCE",
              db.sequelize.fn("SUM", db.sequelize.col("total_amount")),
              0
            ),
            "revenue",
          ],
          [
            db.sequelize.fn(
              "COALESCE",
              db.sequelize.fn("SUM", db.sequelize.col("owner_amount")),
              0
            ),
            "payouts",
          ],
          [
            db.sequelize.fn(
              "COALESCE",
              db.sequelize.fn("SUM", db.sequelize.col("platform_fee")),
              0
            ),
            "commissions",
          ],
        ],
        group: ["month"],
        order: [[db.sequelize.literal("MIN(created_at)"), "ASC"]],
        raw: true,
      });

      paymentsMonthly.forEach((row) => {
        const month = row.month;
        revenueByMonth[month] = {
          month,
          revenue: parseFloat(row.revenue || 0),
          payouts: parseFloat(row.payouts || 0),
          commissions: parseFloat(row.commissions || 0),
        };
      });

      // Revenue by category using payments joined to rentals and cars
      const paymentsWithCar = await db.Payment.findAll({
        where: paymentWhere,
        include: [
          {
            model: db.Rental,
            as: "rental",
            include: [{ model: db.Car, as: "car", attributes: ["brand"] }],
            attributes: [],
            required: true,
          },
        ],
        attributes: ["id", "total_amount"],
        raw: true,
      });

      paymentsWithCar.forEach((p) => {
        const category = p["rental.car.brand"] || "Unknown";
        revenueByCategory[category] =
          (revenueByCategory[category] || 0) + parseFloat(p.total_amount || 0);
      });
    } else {
      // Fallback to rental-level aggregates
      completedRentals.forEach((rental) => {
        const month = new Date(rental.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        if (!revenueByMonth[month]) {
          revenueByMonth[month] = {
            month,
            revenue: 0,
            payouts: 0,
            commissions: 0,
          };
        }
        const revenue = parseFloat(rental.get("totalAmount") || 0);
        const platformFee = parseFloat(rental.get("platformFee") || 0);
        const commission =
          platformFee > 0
            ? platformFee
            : parseFloat((revenue * fallbackCommissionRate).toFixed(2));
        const ownerPayout = parseFloat(
          rental.get("ownerPayout") || Math.max(0, revenue - platformFee)
        );

        revenueByMonth[month].revenue += revenue;
        revenueByMonth[month].commissions += commission;
        revenueByMonth[month].payouts += ownerPayout;

        const category = rental.car?.brand || "Unknown";
        revenueByCategory[category] =
          (revenueByCategory[category] || 0) +
          parseFloat(rental.totalAmount || 0);
      });
    }

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalPayouts: parseFloat(totalPayouts.toFixed(2)),
      totalCommissions: parseFloat(totalCommissions.toFixed(2)),
      pendingPayouts: parseFloat(pendingPayouts.toFixed(2)),
      revenueByMonth: Object.values(revenueByMonth).map((item) => ({
        month: item.month,
        revenue: parseFloat(item.revenue.toFixed(2)),
        payouts: parseFloat(item.payouts.toFixed(2)),
        commissions: parseFloat(item.commissions.toFixed(2)),
      })),
      revenueByCategory: Object.entries(revenueByCategory).map(
        ([category, revenue]) => ({
          category,
          revenue: parseFloat(revenue.toFixed(2)),
        })
      ),
    });
  } catch (error) {
    console.error("Error fetching revenue report:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to fetch revenue report",
      error: error.message,
    });
  }
};

/**
 * Get activity logs for audit purposes
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { startDate, endDate, userType, searchQuery, activityType } =
      req.query;

    // Build where clause with inclusive endDate (end of day)
    const dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.createdAt = {
        [Op.between]: [start, end],
      };
    }

    // For now, we'll create activity logs from booking and user actions
    // In a production system, you'd have a dedicated ActivityLog table

    const logs = [];

    // Get recent rentals as activity
    const recentRentals = await db.Rental.findAll({
      where: dateFilter,
      include: [
        {
          model: db.User,
          as: "customer",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: db.Car,
          as: "car",
          attributes: ["brand", "model"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    recentRentals.forEach((rental) => {
      logs.push({
        id: `rental_${rental.id}`,
        userId: rental.customer?.id || "unknown",
        userName: rental.customer?.name || "Unknown User",
        userRole: rental.customer?.role || "customer",
        action: `Rental ${rental.status}`,
        description: `${
          rental.status.replace("_", " ").charAt(0).toUpperCase() +
          rental.status.slice(1)
        } rental for ${rental.car?.brand} ${rental.car?.model}`,
        timestamp: rental.createdAt,
        ipAddress: null,
      });
    });

    // Get recent user registrations
    const recentUsers = await db.User.findAll({
      where: dateFilter,
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    // Get recent payments (payments, payouts, refunds) as activity
    const recentPayments = await db.Payment.findAll({
      where: dateFilter,
      include: [
        { model: db.User, as: "owner", attributes: ["id", "name", "role"] },
        { model: db.User, as: "customer", attributes: ["id", "name", "role"] },
        { model: db.Rental, as: "rental", attributes: ["id"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    recentPayments.forEach((payment) => {
      const who = payment.customer || payment.owner || null;
      const actorName = who?.name || "System";
      const actorRole = who?.role || "system";
      const action = payment.paymentStatus
        ? `Payment ${payment.paymentStatus}`
        : payment.payoutStatus
        ? `Payout ${payment.payoutStatus}`
        : "Payment";
      logs.push({
        id: `payment_${payment.id}`,
        userId: who?.id || null,
        userName: actorName,
        userRole: actorRole,
        action,
        description: `Payment of ${payment.totalAmount} ${
          payment.currency
        } (rental ${payment.rentalId || "N/A"})`,
        timestamp: payment.createdAt,
        ipAddress: null,
      });
    });

    recentUsers.forEach((user) => {
      logs.push({
        id: `user_${user.id}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "User Registration",
        description: `New ${user.role} account created`,
        timestamp: user.createdAt,
        ipAddress: null,
      });
    });

    // Sort by timestamp (descending)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply filters: userType, activityType, searchQuery
    let filteredLogs = logs;
    if (userType && userType !== "all") {
      filteredLogs = filteredLogs.filter(
        (log) => String(log.userRole) === String(userType)
      );
    }

    if (activityType && activityType !== "all") {
      const at = String(activityType).toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          String(log.action || "")
            .toLowerCase()
            .includes(at) ||
          String(log.description || "")
            .toLowerCase()
            .includes(at)
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          String(log.userName || "")
            .toLowerCase()
            .includes(query) ||
          String(log.action || "")
            .toLowerCase()
            .includes(query) ||
          String(log.description || "")
            .toLowerCase()
            .includes(query)
      );
    }

    res.json({
      logs: filteredLogs.slice(0, 100), // Limit to 100 logs
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({
      message: "Failed to fetch activity logs",
      error: error.message,
    });
  }
};

/**
 * Get list of previously generated reports
 */
export const getGeneratedReports = async (req, res) => {
  try {
    // In a production system, you'd store generated reports in a database
    // For now, return an empty array
    res.json({
      reports: [],
    });
  } catch (error) {
    console.error("Error fetching generated reports:", error);
    res.status(500).json({
      message: "Failed to fetch generated reports",
      error: error.message,
    });
  }
};

/**
 * Export report (handled client-side for now)
 */
export const exportReport = async (req, res) => {
  try {
    const { reportType, format, filters } = req.body;

    // In a production system, you'd generate the file server-side
    // For now, return success and let client handle export
    res.json({
      success: true,
      message: "Export handled client-side",
    });
  } catch (error) {
    console.error("Error exporting report:", error);
    res.status(500).json({
      message: "Failed to export report",
      error: error.message,
    });
  }
};
