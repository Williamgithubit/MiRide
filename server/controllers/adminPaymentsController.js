import db from '../models/index.js';
import { Op } from 'sequelize';

const { Rental, User, Car } = db;

/**
 * Get payment statistics for admin dashboard
 */
export const getPaymentStats = async (req, res) => {
  try {
    // Calculate total revenue from platform fees (commission) only
    const completedRentals = await Rental.findAll({
      where: {
        paymentStatus: 'paid',
        status: { [Op.in]: ['approved', 'active', 'completed'] }
      }
    });

    console.log('📈 Admin Payment Stats Debug:');
    console.log(`Total rentals found: ${completedRentals.length}`);
    if (completedRentals.length > 0) {
      console.log('Sample rental:', {
        id: completedRentals[0].id,
        totalAmount: completedRentals[0].totalAmount,
        platformFee: completedRentals[0].platformFee,
        ownerPayout: completedRentals[0].ownerPayout,
        status: completedRentals[0].status,
        paymentStatus: completedRentals[0].paymentStatus
      });
    }

    // Platform revenue is the commission (platformFee), not the full amount
    const totalRevenue = completedRentals.reduce((sum, rental) => sum + parseFloat(rental.platformFee || 0), 0);
    const platformCommission = totalRevenue; // Same as totalRevenue since we only count commission
    
    console.log(`Total Revenue (from Rentals): $${totalRevenue.toFixed(2)}`);

    // Calculate monthly revenue (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRentals = await Rental.findAll({
      where: {
        paymentStatus: 'paid',
        status: { [Op.in]: ['approved', 'active', 'completed'] },
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    const monthlyRevenue = monthlyRentals.reduce((sum, rental) => sum + parseFloat(rental.platformFee || 0), 0);

    // Count pending payments
    const pendingPayments = await Rental.count({
      where: {
        paymentStatus: 'pending'
      }
    });

    // Count completed payments
    const completedPayments = await Rental.count({
      where: {
        paymentStatus: 'paid',
        status: { [Op.in]: ['approved', 'active', 'completed'] }
      }
    });

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      pendingPayments,
      completedPayments,
      platformCommission: parseFloat(platformCommission.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ message: 'Error fetching payment statistics', error: error.message });
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
      endDate
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // Build where clause
    const whereClause = {};

    // Filter by payment status
    if (status) {
      whereClause.paymentStatus = status;
    }

    // Filter by date range
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

    // Build include clause for joins
    const includeClause = [
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'email'],
        where: customer ? { name: { [Op.like]: `%${customer}%` } } : undefined,
        required: !!customer
      },
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email'],
        where: owner ? { name: { [Op.like]: `%${owner}%` } } : undefined,
        required: !!owner
      },
      {
        model: Car,
        as: 'car',
        attributes: ['id', 'brand', 'model', 'year', 'imageUrl']
      }
    ];

    // Search across transaction ID or payment intent
    if (search) {
      whereClause[Op.or] = [
        { id: { [Op.like]: `%${search}%` } },
        { paymentIntentId: { [Op.like]: `%${search}%` } },
        { stripeSessionId: { [Op.like]: `%${search}%` } }
      ];
    }

    // Fetch transactions with pagination
    const { count, rows: transactions } = await Rental.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    // Format response
    const items = transactions.map(rental => ({
      id: rental.id,
      transactionId: rental.paymentIntentId || rental.stripeSessionId || `TXN-${rental.id}`,
      customer: rental.customer ? {
        id: rental.customer.id,
        name: rental.customer.name
      } : null,
      owner: rental.owner ? {
        id: rental.owner.id,
        name: rental.owner.name
      } : null,
      car: rental.car ? {
        id: rental.car.id,
        title: `${rental.car.year} ${rental.car.brand} ${rental.car.model}`
      } : null,
      amount: parseFloat(rental.totalAmount || rental.totalCost || 0),
      currency: 'USD',
      paymentMethod: 'card',
      status: rental.paymentStatus === 'paid' ? 'success' : rental.paymentStatus === 'pending' ? 'pending' : 'failed',
      createdAt: rental.createdAt,
      // Additional fields for frontend display
      ownerName: rental.owner?.name || 'N/A',
      customerName: rental.customer?.name || 'N/A',
      date: rental.createdAt ? new Date(rental.createdAt).toLocaleDateString() : 'N/A',
      meta: {
        rentalId: rental.id,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalDays: rental.totalDays,
        rentalStatus: rental.status
      }
    }));

    res.json({
      items,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

/**
 * Get a single transaction by ID
 */
export const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching transaction with ID:', id);

    const rental = await Rental.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone'],
          required: false
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone'],
          required: false
        },
        {
          model: Car,
          as: 'car',
          attributes: ['id', 'brand', 'model', 'year', 'imageUrl', 'licensePlate'],
          required: false
        }
      ]
    });

    if (!rental) {
      console.log('Transaction not found for ID:', id);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    console.log('Rental found:', {
      id: rental.id,
      hasCustomer: !!rental.customer,
      hasOwner: !!rental.owner,
      hasCar: !!rental.car
    });

    const transaction = {
      id: rental.id,
      transactionId: rental.paymentIntentId || rental.stripeSessionId || `TXN-${rental.id}`,
      customer: rental.customer ? {
        id: rental.customer.id,
        name: rental.customer.name || 'N/A',
        email: rental.customer.email || 'N/A',
        phone: rental.customer.phone || 'N/A'
      } : null,
      owner: rental.owner ? {
        id: rental.owner.id,
        name: rental.owner.name || 'N/A',
        email: rental.owner.email || 'N/A',
        phone: rental.owner.phone || 'N/A'
      } : null,
      car: rental.car ? {
        id: rental.car.id,
        title: `${rental.car.year || ''} ${rental.car.brand || ''} ${rental.car.model || ''}`.trim() || 'N/A',
        licensePlate: rental.car.licensePlate || 'N/A',
        imageUrl: rental.car.imageUrl || null
      } : null,
      amount: parseFloat(rental.totalAmount || rental.totalCost || 0),
      currency: 'USD',
      paymentMethod: 'card',
      status: rental.paymentStatus === 'paid' ? 'success' : rental.paymentStatus === 'pending' ? 'pending' : 'failed',
      createdAt: rental.createdAt,
      meta: {
        rentalId: rental.id,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalDays: rental.totalDays,
        rentalStatus: rental.status,
        pickupLocation: rental.pickupLocation || 'N/A',
        dropoffLocation: rental.dropoffLocation || 'N/A',
        hasInsurance: rental.hasInsurance || false,
        hasGPS: rental.hasGPS || false,
        hasChildSeat: rental.hasChildSeat || false,
        hasAdditionalDriver: rental.hasAdditionalDriver || false,
        insuranceCost: rental.insuranceCost || 0,
        gpsCost: rental.gpsCost || 0,
        childSeatCost: rental.childSeatCost || 0,
        additionalDriverCost: rental.additionalDriverCost || 0
      }
    };

    console.log('Sending transaction response');
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching transaction', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Export transactions as CSV
 */
export const exportTransactions = async (req, res) => {
  try {
    const {
      search,
      owner,
      customer,
      status,
      startDate,
      endDate
    } = req.query;

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

    const includeClause = [
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'email'],
        where: customer ? { name: { [Op.like]: `%${customer}%` } } : undefined,
        required: !!customer
      },
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email'],
        where: owner ? { name: { [Op.like]: `%${owner}%` } } : undefined,
        required: !!owner
      },
      {
        model: Car,
        as: 'car',
        attributes: ['id', 'brand', 'model', 'year']
      }
    ];

    if (search) {
      whereClause[Op.or] = [
        { id: { [Op.like]: `%${search}%` } },
        { paymentIntentId: { [Op.like]: `%${search}%` } },
        { stripeSessionId: { [Op.like]: `%${search}%` } }
      ];
    }

    const transactions = await Rental.findAll({
      where: whereClause,
      include: includeClause,
      order: [['createdAt', 'DESC']]
    });

    // Generate CSV
    const csvHeader = 'Transaction ID,Customer,Owner,Car,Amount,Status,Date,Rental Period\n';
    const csvRows = transactions.map(rental => {
      const transactionId = rental.paymentIntentId || rental.stripeSessionId || `TXN-${rental.id}`;
      const customerName = rental.customer?.name || 'N/A';
      const ownerName = rental.owner?.name || 'N/A';
      const carTitle = rental.car ? `${rental.car.year} ${rental.car.brand} ${rental.car.model}` : 'N/A';
      const amount = parseFloat(rental.totalAmount || rental.totalCost || 0).toFixed(2);
      const status = rental.paymentStatus === 'paid' ? 'success' : rental.paymentStatus;
      const date = rental.createdAt ? new Date(rental.createdAt).toLocaleDateString() : 'N/A';
      const period = `${new Date(rental.startDate).toLocaleDateString()} - ${new Date(rental.endDate).toLocaleDateString()}`;
      
      return `"${transactionId}","${customerName}","${ownerName}","${carTitle}","${amount}","${status}","${date}","${period}"`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions_export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({ message: 'Error exporting transactions', error: error.message });
  }
};
