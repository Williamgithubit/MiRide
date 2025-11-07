import db from '../models/index.js';
import { Op } from 'sequelize';

// Get customer dashboard stats
export const getCustomerStats = async (req, res) => {
  try {
    // Get customer ID from authenticated user (using req.userId set by authenticate middleware)
    const customerId = req.userId;

    if (!customerId) {
      console.log('getCustomerStats - No customer ID found. req.userId:', req.userId);
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('getCustomerStats - Customer ID:', customerId);

    // Get current date and time
    const now = new Date();

    // Get customer's rentals
    const customerRentals = await db.Rental.findAll({
      where: { customerId },
      include: [
        { 
          model: db.Car, 
          as: 'car', 
          attributes: ['id', 'brand', 'model', 'year'],
          include: [{
            model: db.CarImage,
            as: 'images',
            attributes: ['id', 'imageUrl', 'isPrimary'],
            required: false
          }]
        }
      ],
      order: [['startDate', 'DESC']]
    });

    // Calculate stats
    const activeRentals = customerRentals.filter(rental => 
      new Date(rental.startDate) <= now && new Date(rental.endDate) >= now
    ).length;

    const totalBookings = customerRentals.length;
    const totalSpent = customerRentals.reduce((sum, rental) => sum + rental.totalCost, 0);

    // Get available cars count - using raw query to ensure proper column name handling
    const availableCarsResult = await db.sequelize.query(
      'SELECT COUNT(*) as count FROM cars WHERE is_available = true',
      { type: db.sequelize.QueryTypes.SELECT }
    );
    const availableCars = parseInt(availableCarsResult[0]?.count) || 0;
    
    console.log('getCustomerStats - Available cars count:', availableCars);
    
    // Debug: Get total cars to compare
    const totalCars = await db.Car.count();
    console.log('getCustomerStats - Total cars in database:', totalCars);
    
    // Debug: Get sample of cars to check isAvailable status
    const sampleCars = await db.Car.findAll({
      attributes: ['id', 'name', 'brand', 'model', 'isAvailable'],
      limit: 5
    });
    console.log('getCustomerStats - Sample cars:', JSON.stringify(sampleCars, null, 2));

    // Get recent bookings (last 5)
    const recentBookings = customerRentals.slice(0, 5).map(rental => {
      // Ensure dates are properly converted to Date objects
      const startDate = new Date(rental.startDate);
      const endDate = new Date(rental.endDate);
      
      return {
        id: rental.id,
        carDetails: `${rental.car.year} ${rental.car.brand} ${rental.car.model}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: new Date() > endDate ? 'completed' : 
                 new Date() < startDate ? 'pending' : 'active',
        totalCost: rental.totalCost
      };
    });

    const stats = {
      activeRentals,
      totalBookings,
      totalSpent,
      availableCars,
      recentBookings
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    console.log('getAdminStats - Request details:', {
      userId: req.userId,
      userRole: req.userRole,
      userFromToken: req.user?.role,
      headers: req.headers.authorization ? 'Token present' : 'No token'
    });

    // Verify user is admin
    if (req.userRole !== 'admin') {
      console.log('getAdminStats - Access denied. User role:', req.userRole);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Get current date and time
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total stats
    const totalCustomers = await db.User.count();
    const totalCars = await db.Car.count();
    const totalRentals = await db.Rental.count();

    // Get active rentals
    const activeRentals = await db.Rental.count({
      where: {
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now }
      }
    });

    // Get new registrations this month
    const newCustomersThisMonth = await db.User.count({
      where: {
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    // Get revenue statistics
    const revenueThisMonth = await db.Rental.sum('totalCost', {
      where: {
        startDate: { [Op.gte]: startOfMonth }
      }
    }) || 0;

    const revenuePreviousMonth = await db.Rental.sum('totalCost', {
      where: {
        startDate: {
          [Op.gte]: startOfPrevMonth,
          [Op.lt]: startOfMonth
        }
      }
    }) || 0;

    // Get recent rentals
    const recentRentals = await db.Rental.findAll({
      limit: 10,
      order: [['startDate', 'DESC']],
      include: [
        { model: db.User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: db.Car, as: 'car', attributes: ['id', 'brand', 'model', 'year'] }
      ]
    });

    // Get customer distribution by role
    const customersByRole = await db.User.findAll({
      attributes: [
        'role',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    // Get car availability statistics
    const availableCars = await db.Car.count({
      where: { isAvailable: true }
    });

    const stats = {
      totalCustomers,
      totalCars,
      totalRentals,
      activeRentals,
      availableCars,
      unavailableCars: totalCars - availableCars,
      newCustomersThisMonth,
      revenueThisMonth,
      revenuePreviousMonth,
      revenueGrowth: revenuePreviousMonth > 0
        ? ((revenueThisMonth - revenuePreviousMonth) / revenuePreviousMonth) * 100
        : 100,
      customersByRole,
      recentRentals
    };

    console.log('getAdminStats - Success. Stats summary:', {
      totalCustomers,
      totalCars,
      totalRentals,
      activeRentals,
      recentRentalsCount: recentRentals.length
    });

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get owner dashboard stats - optimized with single query
export const getOwnerStats = async (req, res) => {
  try {
    // Get owner ID from authenticated user (using req.userId set by authenticate middleware)
    const ownerId = req.userId;

    // Get current date and time
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Single optimized query to get all owner stats
    const [ownerStats] = await db.sequelize.query(`
      WITH owner_cars AS (
        SELECT id FROM cars WHERE owner_id = :ownerId
      ),
      rental_stats AS (
        SELECT 
          COUNT(*) as total_bookings,
          SUM(total_cost) as total_earnings,
          COUNT(CASE WHEN start_date <= :now AND end_date >= :now THEN 1 END) as active_bookings
        FROM rentals r
        WHERE r.car_id IN (SELECT id FROM owner_cars)
      ),
      monthly_stats AS (
        SELECT 
          TO_CHAR(DATE_TRUNC('month', start_date), 'Mon YYYY') as period,
          DATE_TRUNC('month', start_date) as month_date,
          SUM(total_cost) as revenue,
          COUNT(*) as bookings
        FROM rentals r
        WHERE r.car_id IN (SELECT id FROM owner_cars)
          AND start_date >= :sixMonthsAgo
        GROUP BY DATE_TRUNC('month', start_date)
        ORDER BY month_date DESC
      )
      SELECT 
        (SELECT COUNT(*) FROM owner_cars) as total_cars,
        COALESCE(rs.total_bookings, 0) as total_bookings,
        COALESCE(rs.total_earnings, 0) as total_earnings,
        COALESCE(rs.active_bookings, 0) as active_bookings,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'period', ms.period,
              'revenue', COALESCE(ms.revenue, 0),
              'bookings', COALESCE(ms.bookings, 0)
            ) ORDER BY ms.month_date DESC
          ) FILTER (WHERE ms.period IS NOT NULL), 
          '[]'::json
        ) as earnings_by_month
      FROM rental_stats rs
      LEFT JOIN monthly_stats ms ON true
      GROUP BY rs.total_bookings, rs.total_earnings, rs.active_bookings
    `, {
      replacements: { ownerId, now, sixMonthsAgo },
      type: db.sequelize.QueryTypes.SELECT
    });

    // Parse the results
    const stats = {
      totalCars: parseInt(ownerStats.total_cars) || 0,
      totalBookings: parseInt(ownerStats.total_bookings) || 0,
      totalEarnings: parseFloat(ownerStats.total_earnings) || 0,
      activeBookings: parseInt(ownerStats.active_bookings) || 0,
      earningsByMonth: ownerStats.earnings_by_month || []
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get revenue data for charts - optimized for owner-specific data
export const getRevenueData = async (req, res) => {
  try {
    // Verify user has appropriate role
    if (req.userRole !== 'admin' && req.userRole !== 'owner') {
      return res.status(403).json({ message: 'Access denied. Admin or owner privileges required.' });
    }

    const { period = 'monthly' } = req.query;
    const ownerId = req.userId;
    const now = new Date();
    let startDate;
    let groupByFormat;
    let responseFormat;

    // Set the date range based on the requested period
    switch (period) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        groupByFormat = 'YYYY-MM-DD';
        responseFormat = 'YYYY-MM-DD';
        break;
      
      case 'yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        groupByFormat = 'YYYY-MM';
        responseFormat = 'YYYY-MM';
        break;
      
      case 'monthly':
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        groupByFormat = 'Mon YYYY';
        responseFormat = 'MMM YYYY';
        break;
    }

    // Get owner-specific revenue data with optimized query
    const revenueData = await db.sequelize.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', r.start_date), 'Mon YYYY') as period,
        SUM(r.total_cost) as revenue,
        COUNT(*) as bookings
      FROM rentals r
      INNER JOIN cars c ON r.car_id = c.id
      WHERE c.owner_id = :ownerId 
        AND r.start_date >= :startDate
      GROUP BY DATE_TRUNC('month', r.start_date)
      ORDER BY DATE_TRUNC('month', r.start_date) ASC
    `, {
      replacements: { ownerId, startDate },
      type: db.sequelize.QueryTypes.SELECT
    });

    return res.status(200).json({
      period,
      format: responseFormat,
      data: revenueData
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get car utilization data
export const getCarUtilizationData = async (req, res) => {
  try {
    // Verify user has appropriate role
    if (req.userRole !== 'admin' && req.userRole !== 'owner') {
      return res.status(403).json({ message: 'Access denied. Admin or owner privileges required.' });
    }

    // Get top rented cars
    const topRentedCars = await db.Car.findAll({
      attributes: [
        'id',
        'brand',
        'model',
        'year',
        [db.sequelize.fn('COUNT', db.sequelize.col('rentals.id')), 'rentalCount']
      ],
      include: [{
        model: db.Rental,
        as: 'rentals',
        attributes: []
      }],
      group: ['Car.id'],
      order: [[db.sequelize.literal('rentalCount'), 'DESC']],
      limit: 10
    });

    // Get utilization by car fuel type (PostgreSQL compatible)
    const utilizationByType = await db.sequelize.query(`
      SELECT 
        c."fuel_type" as type,
        COUNT(r.id) as "rentalCount",
        COUNT(r.id) * 100.0 / (SELECT COUNT(*) FROM rentals) as percentage
      FROM cars c
      LEFT JOIN rentals r ON c.id = r."car_id"
      GROUP BY c."fuel_type"
      ORDER BY "rentalCount" DESC
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    return res.status(200).json({
      topRentedCars,
      utilizationByType
    });
  } catch (error) {
    console.error('Error fetching car utilization data:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Generate CSV reports
export const generateReport = async (req, res) => {
  try {
    // Verify user has admin role
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { reportType, startDate, endDate } = req.query;
    
    if (!reportType) {
      return res.status(400).json({ message: 'Report type is required' });
    }

    let data;
    let filename;
    let csvData = [];
    const dateFilter = {};

    // Apply date filters if provided
    if (startDate) {
      dateFilter.createdAt = { ...dateFilter.createdAt, [Op.gte]: new Date(startDate) };
    }
    
    if (endDate) {
      dateFilter.createdAt = { ...dateFilter.createdAt, [Op.lte]: new Date(endDate) };
    }

    // Generate report based on type
    switch (reportType) {
      case 'customers':
        data = await db.User.findAll({
          where: dateFilter,
          attributes: { exclude: ['password'] },
          order: [['createdAt', 'DESC']]
        });
        
        // Convert to CSV format
        csvData = data.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: customer.role,
          isActive: customer.isActive ? 'Yes' : 'No',
          createdAt: customer.createdAt.toISOString().split('T')[0],
          lastLogin: customer.lastLogin ? customer.lastLogin.toISOString().split('T')[0] : 'Never'
        }));
        
        filename = `customers_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'rentals':
        data = await db.Rental.findAll({
          where: dateFilter,
          include: [
            { model: db.User, as: 'Customer', attributes: ['id', 'name', 'email'] },
            { model: db.Car, as: 'Car', attributes: ['id', 'brand', 'model', 'year'] }
          ],
          order: [['createdAt', 'DESC']]
        });

        // Convert to CSV format
        csvData = data.map(rental => ({
          id: rental.id,
          customerName: rental.Customer?.name || 'Unknown',
          customerEmail: rental.Customer?.email || 'Unknown',
          car: `${rental.Car?.brand} ${rental.Car?.model} (${rental.Car?.year})`,
          startDate: rental.startDate.toISOString().split('T')[0],
          endDate: rental.endDate.toISOString().split('T')[0],
          totalCost: `$${rental.totalCost.toFixed(2)}`,
          status: new Date() > rental.endDate ? 'Completed' : 
                 new Date() < rental.startDate ? 'Upcoming' : 'Active',
          createdAt: rental.createdAt.toISOString().split('T')[0]
        }));
        
        filename = `rentals_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'revenue':
        // Get revenue grouped by day for the period (PostgreSQL compatible)
        data = await db.sequelize.query(`
          SELECT 
            DATE("start_date") as date,
            SUM("total_cost") as revenue,
            COUNT(*) as "rentalCount"
          FROM rentals
          WHERE "start_date" BETWEEN :startDate AND :endDate
          GROUP BY DATE("start_date")
          ORDER BY date ASC
        `, {
          replacements: { 
            startDate: startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)), 
            endDate: endDate || new Date() 
          },
          type: db.sequelize.QueryTypes.SELECT
        });

        // Convert to CSV format
        csvData = data.map(row => ({
          date: row.date,
          revenue: `$${parseFloat(row.revenue).toFixed(2)}`,
          rentalCount: row.rentalCount
        }));
        
        filename = `revenue_report_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Prepare CSV data (simplified, in a real app you would use a CSV library)
    if (csvData.length === 0) {
      return res.status(404).json({ message: 'No data available for the report' });
    }

    // Return the data rather than creating a file
    // In a real app, you might generate a file and provide a download URL
    return res.status(200).json({
      reportType,
      filename,
      data: csvData,
      count: csvData.length
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Platform settings
export const getPlatformSettings = async (req, res) => {
  // In a real app, you would store settings in a database
  // This is a placeholder implementation
  try {
    // Verify user has admin role
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Mock settings data
    const settings = {
      general: {
        siteName: 'Car Rental Service',
        contactEmail: 'support@carrentalservice.com',
        allowRegistration: true,
        maintenanceMode: false
      },
      rental: {
        minRentalDuration: 1, // days
        maxRentalDuration: 30, // days
        defaultDailyRate: 50, // $
        lateReturnFee: 25, // $
        depositAmount: 200 // $
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        reminderDays: 1 // days before rental
      },
      security: {
        passwordPolicy: {
          minLength: 8,
          requireSpecialChar: true,
          requireNumber: true
        },
        sessionTimeout: 60, // minutes
        failedLoginAttempts: 5
      }
    };

    return res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update platform settings
export const updatePlatformSettings = async (req, res) => {
  try {
    // Verify user has admin role
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // In a real app, you would validate and save settings to the database
    // This is a placeholder implementation
    const settings = req.body;

    // Validate settings (basic validation)
    if (!settings) {
      return res.status(400).json({ message: 'Settings object is required' });
    }

    // Pretend we saved the settings
    return res.status(200).json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get comprehensive owner analytics data
export const getOwnerAnalytics = async (req, res) => {
  try {
    console.log('getOwnerAnalytics - Request details:', {
      userId: req.userId,
      userRole: req.userRole,
      userFromToken: req.user?.role,
      headers: req.headers.authorization ? 'Token present' : 'No token'
    });

    // Verify user has owner role (check both req.userRole and req.user.role)
    const userRole = req.userRole || req.user?.role;
    if (userRole !== 'owner' && userRole !== 'admin') {
      console.log('getOwnerAnalytics - Access denied. User role:', userRole);
      return res.status(403).json({ 
        message: 'Access denied. Owner or admin privileges required.',
        userRole: userRole
      });
    }

    const ownerId = req.userId;
    const { period = 'monthly' } = req.query;
    const now = new Date();
    
    // Calculate date ranges
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Get period-specific date range for trends
    let trendStartDate;
    switch (period) {
      case 'weekly':
        trendStartDate = new Date(now);
        trendStartDate.setDate(now.getDate() - 42); // 6 weeks
        break;
      case 'yearly':
        trendStartDate = new Date(now);
        trendStartDate.setFullYear(now.getFullYear() - 2); // 2 years
        break;
      case 'monthly':
      default:
        trendStartDate = new Date(now);
        trendStartDate.setMonth(now.getMonth() - 11); // 12 months
        break;
    }

    // Get owner's cars
    const ownerCars = await db.Car.findAll({
      where: { ownerId },
      attributes: ['id', 'brand', 'model', 'year', 'isAvailable'],
      include: [{
        model: db.CarImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'isPrimary'],
        required: false
      }]
    });

    const carIds = ownerCars.map(car => car.id);

    if (carIds.length === 0) {
      return res.status(200).json({
        totalBookings: 0,
        totalBookingsThisMonth: 0,
        totalRevenue: 0,
        totalRevenueThisMonth: 0,
        activeCars: 0,
        inactiveCars: 0,
        pendingRequests: 0,
        bookingsTrend: [],
        topRentedCars: [],
        bookingStatusDistribution: [],
        recentBookings: [],
        utilizationRate: 0,
        averageRentalDuration: 0,
        customerSatisfaction: 0,
        revenuePerCar: 0,
      });
    }

    // Get comprehensive analytics with optimized queries
    const [analyticsResults] = await db.sequelize.query(`
      WITH owner_rentals AS (
        SELECT 
          r.*,
          c.brand,
          c.model,
          c.year,
          (
            SELECT ci.image_url 
            FROM car_images ci 
            WHERE ci.car_id = c.id 
            ORDER BY ci.is_primary DESC, ci."order" ASC 
            LIMIT 1
          ) as image_url,
          u.name as customer_name,
          u.email as customer_email
        FROM rentals r
        INNER JOIN cars c ON r.car_id = c.id
        INNER JOIN users u ON r.customer_id = u.id
        WHERE c."ownerId" = :ownerId
      ),
      monthly_stats AS (
        SELECT 
          COUNT(*) as total_bookings,
          SUM(total_cost) as total_revenue,
          AVG(EXTRACT(DAY FROM (end_date - start_date))) as avg_duration,
          COUNT(CASE WHEN start_date >= :startOfMonth THEN 1 END) as bookings_this_month,
          SUM(CASE WHEN start_date >= :startOfMonth THEN total_cost ELSE 0 END) as revenue_this_month,
          COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_requests
        FROM owner_rentals
      ),
      car_stats AS (
        SELECT 
          COUNT(CASE WHEN "isAvailable" = true THEN 1 END) as active_cars,
          COUNT(CASE WHEN "isAvailable" = false THEN 1 END) as inactive_cars,
          COUNT(*) as total_cars
        FROM cars 
        WHERE "ownerId" = :ownerId
      ),
      status_distribution AS (
        SELECT 
          status,
          COUNT(*) as count,
          COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
        FROM owner_rentals
        GROUP BY status
      ),
      top_cars AS (
        SELECT 
          car_id,
          CONCAT(brand, ' ', model, ' ', year) as car_name,
          brand,
          model,
          year,
          image_url,
          COUNT(*) as rental_count,
          SUM(total_cost) as total_revenue
        FROM owner_rentals
        GROUP BY car_id, brand, model, year, image_url
        ORDER BY rental_count DESC
        LIMIT 10
      )
      SELECT 
        ms.*,
        cs.active_cars,
        cs.inactive_cars,
        cs.total_cars,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'status', sd.status,
              'count', sd.count,
              'percentage', sd.percentage
            )
          ) FILTER (WHERE sd.status IS NOT NULL),
          '[]'::json
        ) as status_distribution,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'carId', tc.car_id,
              'carName', tc.car_name,
              'brand', tc.brand,
              'model', tc.model,
              'year', tc.year,
              'imageUrl', tc.image_url,
              'rentalCount', tc.rental_count,
              'totalRevenue', tc.total_revenue
            ) ORDER BY tc.rental_count DESC
          ) FILTER (WHERE tc.car_id IS NOT NULL),
          '[]'::json
        ) as top_cars
      FROM monthly_stats ms
      CROSS JOIN car_stats cs
      LEFT JOIN status_distribution sd ON true
      LEFT JOIN top_cars tc ON true
      GROUP BY ms.total_bookings, ms.total_revenue, ms.avg_duration, 
               ms.bookings_this_month, ms.revenue_this_month, ms.pending_requests,
               cs.active_cars, cs.inactive_cars, cs.total_cars
    `, {
      replacements: { ownerId, startOfMonth, startOfLastMonth, endOfLastMonth },
      type: db.sequelize.QueryTypes.SELECT
    });

    // Get bookings trend data
    const trendQuery = period === 'weekly' 
      ? `DATE_TRUNC('week', start_date)` 
      : period === 'yearly'
      ? `DATE_TRUNC('year', start_date)`
      : `DATE_TRUNC('month', start_date)`;

    const trendFormat = period === 'weekly'
      ? 'YYYY-"W"WW'
      : period === 'yearly'
      ? 'YYYY'
      : 'Mon YYYY';

    const [trendData] = await db.sequelize.query(`
      SELECT 
        TO_CHAR(${trendQuery}, '${trendFormat}') as period,
        COUNT(*) as bookings,
        SUM(total_cost) as revenue
      FROM rentals r
      INNER JOIN cars c ON r.car_id = c.id
      WHERE c."ownerId" = :ownerId 
        AND r.start_date >= :trendStartDate
      GROUP BY ${trendQuery}
      ORDER BY ${trendQuery} ASC
    `, {
      replacements: { ownerId, trendStartDate },
      type: db.sequelize.QueryTypes.SELECT
    });

    // Get recent bookings
    const recentBookings = await db.Rental.findAll({
      where: {
        '$car.ownerId$': ownerId
      },
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['brand', 'model', 'year']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 15
    });

    // Calculate utilization rate and customer satisfaction
    const utilizationRate = analyticsResults.total_cars > 0 
      ? (analyticsResults.total_bookings / (analyticsResults.total_cars * 30)) * 100 
      : 0;

    // Get average rating from reviews
    const avgRating = await db.sequelize.query(`
      SELECT AVG(rating) as avg_rating
      FROM reviews r
      INNER JOIN cars c ON r.car_id = c.id
      WHERE c."ownerId" = :ownerId
    `, {
      replacements: { ownerId },
      type: db.sequelize.QueryTypes.SELECT
    });

    const customerSatisfaction = avgRating[0]?.avg_rating || 0;

    // Format the response
    const analytics = {
      // Summary stats
      totalBookings: parseInt(analyticsResults.total_bookings) || 0,
      totalBookingsThisMonth: parseInt(analyticsResults.bookings_this_month) || 0,
      totalRevenue: parseFloat(analyticsResults.total_revenue) || 0,
      totalRevenueThisMonth: parseFloat(analyticsResults.revenue_this_month) || 0,
      activeCars: parseInt(analyticsResults.active_cars) || 0,
      inactiveCars: parseInt(analyticsResults.inactive_cars) || 0,
      pendingRequests: parseInt(analyticsResults.pending_requests) || 0,
      
      // Trends
      bookingsTrend: trendData.map(item => ({
        period: item.period,
        bookings: parseInt(item.bookings),
        revenue: parseFloat(item.revenue)
      })),
      
      // Top performing cars
      topRentedCars: analyticsResults.top_cars || [],
      
      // Booking status distribution
      bookingStatusDistribution: analyticsResults.status_distribution || [],
      
      // Recent bookings
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        customerName: booking.customer?.name || 'Unknown',
        customerEmail: booking.customer?.email || 'Unknown',
        carName: `${booking.car?.year} ${booking.car?.brand} ${booking.car?.model}`,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: parseFloat(booking.totalCost),
        status: booking.status
      })),
      
      // Metrics
      utilizationRate: Math.min(utilizationRate, 100),
      averageRentalDuration: parseFloat(analyticsResults.avg_duration) || 0,
      customerSatisfaction: parseFloat(customerSatisfaction) || 0,
      revenuePerCar: analyticsResults.total_cars > 0 
        ? (parseFloat(analyticsResults.total_revenue) || 0) / analyticsResults.total_cars 
        : 0,
    };

    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching owner analytics:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};