import db from "../models/index.js";
import NotificationService from "../services/notificationService.js";
import { Op } from 'sequelize';

// Using db.Rental directly for better clarity

// Rent a car
export const getStats = async (req, res) => {
  try {
    const totalRentals = await db.Rental.count();
    const activeRentals = await db.Rental.count({
      where: {
        endDate: { [Op.gte]: new Date() }
      }
    });

    const totalRevenue = await db.Rental.sum('totalCost');

    const popularCars = await db.Rental.findAll({
      attributes: [
        'carId',
        [db.sequelize.fn('COUNT', 'carId'), 'rentCount']
      ],
      include: [{
        model: db.Car,
        as: 'car',
        attributes: ['id', 'name', 'model', 'imageUrl', 'rentalPricePerDay']
      }],
      group: ['carId', 'car.id', 'car.name', 'car.model'],
      order: [[db.sequelize.fn('COUNT', 'carId'), 'DESC']],
      limit: 5
    });

    res.json({
      totalRentals,
      activeRentals,
      totalRevenue: totalRevenue || 0,
      popularCars: popularCars.map(rental => ({
        carId: rental.carId,
        name: rental.car.name,
        model: rental.car.model,
        rentCount: parseInt(rental.get('rentCount'))
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActive = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;

    const rentals = await db.Rental.findAll({
      where: {
        customerId: userId,
        status: 'active',
        endDate: { [Op.gte]: new Date() }
      },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'rentalPricePerDay', 'brand', 'year', 'imageUrl']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['endDate', 'ASC']]
    });

    // Return single active booking or null
    const activeBooking = rentals.length > 0 ? rentals[0] : null;
    res.json(activeBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current customer bookings (pending_approval, approved, active)
export const getCurrentBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;

    const rentals = await db.Rental.findAll({
      where: {
        customerId: userId,
        status: {
          [Op.in]: ['pending_approval', 'approved', 'active']
        },
        endDate: { [Op.gte]: new Date() }
      },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'rentalPricePerDay', 'brand', 'year', 'imageUrl']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['startDate', 'ASC']]
    });

    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customer booking history (completed, cancelled, rejected)
export const getBookingHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;

    const rentals = await db.Rental.findAll({
      where: {
        customerId: userId,
        [Op.or]: [
          { status: { [Op.in]: ['completed', 'cancelled', 'rejected'] } },
          { 
            status: { [Op.in]: ['approved', 'active'] },
            endDate: { [Op.lt]: new Date() }
          }
        ]
      },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'rentalPricePerDay', 'brand', 'year', 'imageUrl']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['endDate', 'DESC']]
    });

    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customer booking statistics
export const getCustomerBookingStats = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;

    // Get all customer bookings
    const allBookings = await db.Rental.findAll({
      where: { customerId: userId },
      attributes: ['id', 'status', 'totalCost', 'totalAmount', 'startDate', 'endDate']
    });

    // Calculate statistics
    const totalBookings = allBookings.length;
    const activeBookings = allBookings.filter(booking => 
      booking.status === 'active' && new Date(booking.endDate) >= new Date()
    ).length;
    const completedBookings = allBookings.filter(booking => 
      booking.status === 'completed' || 
      (booking.status === 'active' && new Date(booking.endDate) < new Date())
    ).length;
    const upcomingBookings = allBookings.filter(booking => 
      ['pending_approval', 'approved'].includes(booking.status) && 
      new Date(booking.startDate) > new Date()
    ).length;

    // Calculate total spent (use totalAmount if available, fallback to totalCost)
    const totalSpent = allBookings.reduce((sum, booking) => {
      const amount = Number(booking.totalAmount || booking.totalCost || 0);
      return sum + amount;
    }, 0);

    const averageBookingValue = totalBookings > 0 ? totalSpent / totalBookings : 0;

    res.json({
      totalBookings,
      activeBookings,
      completedBookings,
      upcomingBookings,
      totalSpent,
      averageBookingValue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customer's rentals
export const getCustomerRentals = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;

    const rentals = await db.Rental.findAll({
      where: {
        customerId: userId
      },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'rentalPricePerDay', 'brand', 'year', 'imageUrl']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['startDate', 'DESC']]
    });

    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
                [Op.between]: [startDate, endDate]
              }
            },
            {
              endDate: {
                [Op.between]: [startDate, endDate]
              }
            }
          ]
        },
        include: [
          { 
            model: db.Car,
            as: 'car',
            attributes: ['id', 'name', 'model', 'rentalPricePerDay']
          },
          {
            model: db.User,
            as: 'customer',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['startDate', 'DESC']]
      });
      return res.json(rentals);
    }

    // Otherwise, return all rentals
    const rentals = await db.Rental.findAll({
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'rentalPricePerDay']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['startDate', 'DESC']]
    });
    res.json(rentals);
  } catch (error) {
    console.error('Error getting rentals:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getOwnerRentals = async (req, res) => {
  try {
    // Get ownerId from params (if provided) or use authenticated user's ID
    const { ownerId } = req.params;
    const ownerIdToUse = ownerId || req.user?.id || req.userId;
    
    if (!ownerIdToUse) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log('Getting rentals for owner:', ownerIdToUse);
    
    const rentals = await db.Rental.findAll({
      where: {
        ownerId: ownerIdToUse
      },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'rentalPricePerDay', 'imageUrl']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${rentals.length} rentals for owner ${ownerIdToUse}`);
    res.json(rentals);
  } catch (error) {
    console.error('Error getting owner rentals:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const rental = await db.Rental.findByPk(id, {
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'rentalPricePerDay', 'imageUrl']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    
    await rental.update({ status });
    
    res.json(rental);
  } catch (error) {
    console.error('Error updating rental status:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getRevenue = async (req, res) => {
  try {
    const { period } = req.query;
    
    // Validate period
    const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Must be one of: daily, weekly, monthly, yearly' });
    }
    
    // Generate mock revenue data for now since we don't have real historical data
    const generateRevenueData = (period) => {
      const data = [];
      const now = new Date();
      
      switch (period) {
        case 'monthly':
          for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            data.push({
              period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              revenue: Math.floor(Math.random() * 5000) + 1000,
              bookings: Math.floor(Math.random() * 20) + 5
            });
          }
          break;
        case 'daily':
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
              period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              revenue: Math.floor(Math.random() * 500) + 100,
              bookings: Math.floor(Math.random() * 5) + 1
            });
          }
          break;
        case 'weekly':
          for (let i = 7; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7));
            data.push({
              period: `Week ${date.getWeek()}`,
              revenue: Math.floor(Math.random() * 2000) + 500,
              bookings: Math.floor(Math.random() * 10) + 3
            });
          }
          break;
        case 'yearly':
          for (let i = 2; i >= 0; i--) {
            const year = now.getFullYear() - i;
            data.push({
              period: year.toString(),
              revenue: Math.floor(Math.random() * 50000) + 20000,
              bookings: Math.floor(Math.random() * 200) + 100
            });
          }
          break;
      }
      
      return data;
    };
    
    const revenueData = generateRevenueData(period);
    res.json(revenueData);
  } catch (error) {
    console.error('Error getting revenue data:', error);
    res.status(500).json({ error: error.message });
  }
};


export const createRental = async (req, res) => {
  console.log(req.body)  
  try {
    // This function is now handled by the Stripe webhook
    // But we can keep it for manual rental creation if needed
    res.status(501).json({ message: 'Rental creation is handled via payment webhook' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending bookings for owner approval
export const getPendingBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const ownerId = req.user.id;

    // Get pending bookings for the owner
    console.log('Getting pending bookings for owner:', ownerId);
    const pendingRentals = await db.Rental.findAll({
      where: {
        ownerId: ownerId,
        status: 'pending_approval'
      },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'rentalPricePerDay', 'imageUrl']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${pendingRentals.length} rentals:`, pendingRentals.map(r => ({
      id: r.id,
      status: r.status,
      customerId: r.customerId,
      carId: r.carId,
      createdAt: r.createdAt
    })));

    res.json(pendingRentals);
  } catch (error) {
    console.error('Error getting pending bookings:', error);
    res.status(500).json({ error: error.message });
  }
};

// Approve a booking
export const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const rental = await db.Rental.findOne({
      where: {
        id: id,
        status: 'pending_approval'
      },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!rental) {
      return res.status(404).json({ message: 'Booking not found or already processed' });
    }

    // Update rental status and set approval timestamp
    await rental.update({
      status: 'approved',
      approvedAt: new Date()
    });

    // Update car availability for the rental period
    // Note: In a real system, you'd implement a more sophisticated availability system
    // that checks for overlapping bookings
    await db.Car.update(
      { isAvailable: false },
      { where: { id: rental.carId } }
    );

    console.log(`Booking ${rental.id} approved by owner ${req.user.id}`);
    
    // Send notification to customer about approval
    const notificationResult = await NotificationService.notifyCustomerBookingStatus(rental, 'approved');
    if (notificationResult.success) {
      console.log(`✅ Customer notification sent successfully for rental ${rental.id}`);
    } else {
      console.error(`❌ Failed to send customer notification: ${notificationResult.error}`);
    }

    res.json({
      message: 'Booking approved successfully',
      rental: rental
    });
  } catch (error) {
    console.error('Error approving booking:', error);
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
      return res.status(401).json({ message: 'Authentication required' });
    }

    const rental = await db.Rental.findOne({
      where: {
        id: id,
        status: 'pending_approval'
      },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!rental) {
      return res.status(404).json({ message: 'Booking not found or already processed' });
    }

    // Update rental status and set rejection details
    await rental.update({
      status: 'rejected',
      rejectedAt: new Date(),
      rejectionReason: rejectionReason || 'No reason provided'
    });

    console.log(`Booking ${rental.id} rejected by owner ${req.user.id}`);
    
    // Make car available again since booking is rejected
    await db.Car.update(
      { isAvailable: true },
      { where: { id: rental.carId } }
    );
    
    // Send notification to customer about rejection
    const notificationResult = await NotificationService.notifyCustomerBookingStatus(rental, 'rejected', rejectionReason);
    if (notificationResult.success) {
      console.log(`✅ Customer notification sent successfully for rental ${rental.id}`);
    } else {
      console.error(`❌ Failed to send customer notification: ${notificationResult.error}`);
    }
    
    // TODO: Process refund via Stripe
    console.log(`Refund should be processed for customer ${rental.customerId} for booking ${rental.id}`);

    res.json({
      message: 'Booking rejected successfully',
      rental: rental
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
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
                    as: 'car',
                    attributes: ['id', 'name', 'model', 'rentalPricePerDay']
                },
                {
                    model: db.User,
                    as: 'customer',
                    attributes: ['id', 'name', 'email']
                }
            ]
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

// Cancel a rental (customer-initiated cancellation)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const rental = await db.Rental.findOne({
      where: {
        id: id,
        customerId: req.user.id
      },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!rental) {
      return res.status(404).json({ message: "Rental not found or you don't have permission to cancel it" });
    }

    // Check if rental can be cancelled
    if (rental.status === 'completed' || rental.status === 'cancelled') {
      return res.status(400).json({ 
        message: "Cannot cancel a completed or already cancelled rental" 
      });
    }

    // Check if rental is already started (active)
    if (rental.status === 'active') {
      return res.status(400).json({ 
        message: "Cannot cancel an active rental. Please contact support." 
      });
    }

    // Update rental status to cancelled
    await rental.update({ 
      status: 'cancelled',
      rejectionReason: reason || 'Cancelled by customer'
    });

    // Make the car available again
    const car = await db.Car.findByPk(rental.carId);
    if (car) {
      await car.update({ isAvailable: true });
    }

    // Send notification to owner about cancellation
    const notificationResult = await NotificationService.notifyOwnerBookingCancelled(rental, reason);
    if (notificationResult.success) {
      console.log(`✅ Owner notification sent successfully for cancelled rental ${rental.id}`);
    } else {
      console.error(`❌ Failed to send owner notification: ${notificationResult.error}`);
    }

    // TODO: Process refund via Stripe if payment was made
    console.log(`Refund should be processed for customer ${rental.customerId} for cancelled booking ${rental.id}`);

    res.json({
      message: 'Booking cancelled successfully',
      rental: rental
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: error.message });
  }
};

// Temporary function to create test data
export const createTestBooking = async (req, res) => {
  try {
    // First, assign current user as owner of all cars that don't have an owner
    const carsWithoutOwner = await db.Car.findAll({
      where: {
        ownerId: null
      }
    });

    if (carsWithoutOwner.length > 0) {
      await db.Car.update(
        { ownerId: req.user.id },
        { where: { ownerId: null } }
      );
      console.log(`Assigned ${carsWithoutOwner.length} cars to owner ${req.user.id}`);
    }

    // Create a test customer if none exists
    let testCustomer = await db.User.findOne({ where: { role: 'customer' } });
    if (!testCustomer) {
      testCustomer = await db.User.create({
        name: 'Test Customer',
        email: 'test@customer.com',
        password: 'hashedpassword',
        role: 'customer',
        isActive: true
      });
    }

    // Get the first available car
    const car = await db.Car.findOne({ where: { ownerId: req.user.id } });
    if (!car) {
      return res.status(404).json({ message: 'No cars found for this owner' });
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
      status: 'pending_approval',
      paymentStatus: 'paid',
      pickupLocation: 'Test Location',
      dropoffLocation: 'Test Location',
      hasInsurance: true,
      hasGPS: false,
      hasChildSeat: false,
      hasAdditionalDriver: false
    });

    res.json({
      message: 'Test booking created successfully',
      rental: testRental,
      carsAssigned: carsWithoutOwner.length
    });
  } catch (error) {
    console.error('Error creating test booking:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteRental = async (req, res) => {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const rental = await db.Rental.findOne({
            where: {
                id: id,
                customerId: req.user.id
            }
        });

        if (!rental) {
            return res.status(404).json({ message: "Rental not found or you don't have permission to cancel it" });
        }

        // Check if rental is already completed
        if (new Date(rental.endDate) < new Date()) {
            return res.status(400).json({ 
                message: "Cannot cancel a completed rental" 
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
