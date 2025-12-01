import db from '../models/index.js';
import { Op } from 'sequelize';

// Get all bookings for admin dashboard
export const getAllBookings = async (req, res) => {
  try {
    console.log('getAllBookings - Request details:', {
      userId: req.userId,
      userRole: req.userRole,
      query: req.query
    });

    // Verify user is admin
    if (req.userRole !== 'admin') {
      console.log('getAllBookings - Access denied. User role:', req.userRole);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const {
      search = '',
      status = '',
      startDate = '',
      endDate = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build where clause
    const whereClause = {};

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    // Date range filter
    if (startDate && endDate) {
      whereClause.startDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    console.log('getAllBookings - Query parameters:', {
      whereClause,
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      offset
    });

    // Get bookings with pagination and related data
    const { count, rows: bookings } = await db.Rental.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year'],
          include: [
            {
              model: db.User,
              as: 'owner',
              attributes: ['id', 'name', 'email']
            },
            {
              model: db.CarImage,
              as: 'images',
              attributes: ['id', 'imageUrl', 'isPrimary'],
              required: false
            }
          ]
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset
    });

    // Filter by search term if provided (after database query for simplicity)
    let filteredBookings = bookings;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBookings = bookings.filter(booking => 
        booking.customer?.name?.toLowerCase().includes(searchLower) ||
        booking.customer?.email?.toLowerCase().includes(searchLower) ||
        booking.car?.name?.toLowerCase().includes(searchLower) ||
        booking.car?.model?.toLowerCase().includes(searchLower) ||
        booking.car?.owner?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Transform data to match frontend interface
    const transformedBookings = filteredBookings.map(booking => ({
      id: booking.id.toString(),
      car: {
        id: booking.car?.id?.toString() || '',
        name: booking.car?.name || 'Unknown Car',
        model: booking.car?.model || '',
        imageUrl: booking.car?.imageUrl || 'https://via.placeholder.com/200x150?text=Car'
      },
      customer: {
        id: booking.customer?.id?.toString() || '',
        name: booking.customer?.name || 'Unknown Customer',
        email: booking.customer?.email || ''
      },
      owner: {
        id: booking.car?.owner?.id?.toString() || '',
        name: booking.car?.owner?.name || 'Unknown Owner',
        email: booking.car?.owner?.email || ''
      },
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalCost: parseFloat(booking.totalAmount || booking.totalCost || 0),
      paymentStatus: booking.paymentStatus === 'paid' ? 'Paid' : 
                    booking.paymentStatus === 'pending' ? 'Pending' : 'Failed',
      bookingStatus: booking.status === 'pending_approval' ? 'Pending' :
                    booking.status === 'approved' ? 'Confirmed' :
                    booking.status === 'active' ? 'Confirmed' :
                    booking.status === 'completed' ? 'Completed' :
                    booking.status === 'cancelled' ? 'Cancelled' :
                    booking.status === 'rejected' ? 'Cancelled' : 'Pending'
    }));

    console.log('getAllBookings - Query results:', {
      count,
      bookingsCount: transformedBookings.length
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      bookings: transformedBookings,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages,
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1
    });

  } catch (error) {
    console.error('Error fetching bookings - Full error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get single booking by ID
export const getBookingById = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { bookingId } = req.params;

    const booking = await db.Rental.findByPk(bookingId, {
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'rentalPricePerDay'],
          include: [
            {
              model: db.User,
              as: 'owner',
              attributes: ['id', 'name', 'email', 'phone']
            },
            {
              model: db.CarImage,
              as: 'images',
              attributes: ['id', 'imageUrl', 'isPrimary'],
              required: false
            }
          ]
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Get primary image or first image
    const primaryImage = booking.car?.images?.find(img => img.isPrimary) || booking.car?.images?.[0];
    const imageUrl = primaryImage?.imageUrl || 'https://via.placeholder.com/200x150?text=Car';

    // Transform data to match frontend interface
    const transformedBooking = {
      id: booking.id.toString(),
      car: {
        id: booking.car?.id?.toString() || '',
        name: booking.car?.name || 'Unknown Car',
        model: booking.car?.model || '',
        imageUrl: imageUrl
      },
      customer: {
        id: booking.customer?.id?.toString() || '',
        name: booking.customer?.name || 'Unknown Customer',
        email: booking.customer?.email || ''
      },
      owner: {
        id: booking.car?.owner?.id?.toString() || '',
        name: booking.car?.owner?.name || 'Unknown Owner',
        email: booking.car?.owner?.email || ''
      },
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalCost: parseFloat(booking.totalAmount || booking.totalCost || 0),
      paymentStatus: booking.paymentStatus === 'paid' ? 'Paid' : 
                    booking.paymentStatus === 'pending' ? 'Pending' : 'Failed',
      bookingStatus: booking.status === 'pending_approval' ? 'Pending' :
                    booking.status === 'approved' ? 'Confirmed' :
                    booking.status === 'active' ? 'Confirmed' :
                    booking.status === 'completed' ? 'Completed' :
                    booking.status === 'cancelled' ? 'Cancelled' :
                    booking.status === 'rejected' ? 'Cancelled' : 'Pending'
    };

    res.status(200).json(transformedBooking);

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update booking status (admin can change any booking status)
export const updateBookingStatus = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending_approval', 'approved', 'active', 'completed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }

    // Find booking
    const booking = await db.Rental.findByPk(bookingId, {
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
          include: [
            {
              model: db.User,
              as: 'owner',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking status
    const updatedBooking = await booking.update({ status });

    // Update car availability based on status
    if (status === 'approved' || status === 'active') {
      await db.Car.update(
        { isAvailable: false },
        { where: { id: booking.carId } }
      );
    } else if (status === 'completed' || status === 'cancelled' || status === 'rejected') {
      await db.Car.update(
        { isAvailable: true },
        { where: { id: booking.carId } }
      );
    }

    // Transform data to match frontend interface
    const transformedBooking = {
      id: updatedBooking.id.toString(),
      car: {
        id: updatedBooking.car?.id?.toString() || '',
        name: updatedBooking.car?.name || 'Unknown Car',
        model: updatedBooking.car?.model || '',
        imageUrl: updatedBooking.car?.imageUrl || 'https://via.placeholder.com/200x150?text=Car'
      },
      customer: {
        id: updatedBooking.customer?.id?.toString() || '',
        name: updatedBooking.customer?.name || 'Unknown Customer',
        email: updatedBooking.customer?.email || ''
      },
      owner: {
        id: updatedBooking.car?.owner?.id?.toString() || '',
        name: updatedBooking.car?.owner?.name || 'Unknown Owner',
        email: updatedBooking.car?.owner?.email || ''
      },
      startDate: updatedBooking.startDate,
      endDate: updatedBooking.endDate,
      totalCost: parseFloat(updatedBooking.totalAmount || updatedBooking.totalCost || 0),
      paymentStatus: updatedBooking.paymentStatus === 'paid' ? 'Paid' : 
                    updatedBooking.paymentStatus === 'pending' ? 'Pending' : 'Failed',
      bookingStatus: updatedBooking.status === 'pending_approval' ? 'Pending' :
                    updatedBooking.status === 'approved' ? 'Confirmed' :
                    updatedBooking.status === 'active' ? 'Confirmed' :
                    updatedBooking.status === 'completed' ? 'Completed' :
                    updatedBooking.status === 'cancelled' ? 'Cancelled' :
                    updatedBooking.status === 'rejected' ? 'Cancelled' : 'Pending'
    };

    console.log(`Admin ${req.userId} updated booking ${bookingId} status to ${status}`);

    res.status(200).json(transformedBooking);

  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
