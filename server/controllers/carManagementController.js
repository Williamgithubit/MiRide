import db from '../models/index.js';
import { Op, fn, col } from 'sequelize';

// Get paginated cars list with filters for admin
export const getCars = async (req, res) => {
  try {
    console.log('getCars - Request details:', {
      userId: req.userId,
      userRole: req.userRole,
      query: req.query
    });

    // Verify user is admin
    if (req.userRole !== 'admin') {
      console.log('getCars - Access denied. User role:', req.userRole);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const {
      search = '',
      status = 'all',
      owner = 'all',
      minPrice = '',
      maxPrice = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build where clause
    const whereClause = {};

    // Search filter (car name, model, brand)
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } }
      ];
    }

    // Status filter - map to isAvailable field
    if (status !== 'all') {
      if (status === 'available') {
        whereClause.isAvailable = true;
      } else if (status === 'rented' || status === 'maintenance' || status === 'inactive') {
        whereClause.isAvailable = false;
      }
      // For now, we'll ignore pending_approval and rejected since they don't exist in the model
    }

    // Price range filter
    if (minPrice || maxPrice) {
      whereClause.rentalPricePerDay = {};
      if (minPrice) whereClause.rentalPricePerDay[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.rentalPricePerDay[Op.lte] = parseFloat(maxPrice);
    }

    // Owner filter
    let ownerWhereClause = {};
    if (owner !== 'all') {
      ownerWhereClause.id = owner;
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    console.log('getCars - Query parameters:', {
      whereClause,
      ownerWhereClause,
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      offset
    });

    // Get cars with pagination and owner info
    const { count, rows: cars } = await db.Car.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
          where: Object.keys(ownerWhereClause).length > 0 ? ownerWhereClause : undefined,
          required: false // Allow cars without owners
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset
    });

    console.log('getCars - Query results:', {
      count,
      carsCount: cars.length
    });

    // Transform cars to include status field
    const transformedCars = cars.map(car => {
      const carData = car.toJSON();
      // Map isAvailable to status field for frontend
      // Check both camelCase and snake_case versions (Sequelize with underscored: true)
      const availabilityStatus = carData.isAvailable !== undefined ? carData.isAvailable : carData.is_available;
      carData.status = availabilityStatus ? 'available' : 'rented';
      return carData;
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      cars: transformedCars,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages,
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1
    });

  } catch (error) {
    console.error('Error fetching cars - Full error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get single car by ID
export const getCarById = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { carId } = req.params;

    const car = await db.Car.findByPk(carId, {
      include: [
        {
          model: db.User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone'],
          required: false // Allow cars without owners
        }
      ]
    });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Transform car to include status field
    const carData = car.toJSON();
    const availabilityStatus = carData.isAvailable !== undefined ? carData.isAvailable : carData.is_available;
    carData.status = availabilityStatus ? 'available' : 'rented';

    res.status(200).json(carData);

  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update car (admin can edit any car)
export const updateCar = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { carId } = req.params;
    const { name, model, brand, year, rentalPricePerDay, status, features } = req.body;

    // Find car
    const car = await db.Car.findByPk(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Map status to isAvailable field
    let carAvailability = car.isAvailable;
    if (status) {
      carAvailability = status === 'available';
    }

    // Update car (only fields that exist in the model)
    const updatedCar = await car.update({
      name: name || car.name,
      model: model || car.model,
      brand: brand || car.brand,
      year: year || car.year,
      rentalPricePerDay: rentalPricePerDay || car.rentalPricePerDay,
      isAvailable: carAvailability,
      features: features || car.features
    });

    // Return updated car with owner info
    const carWithOwner = await db.Car.findByPk(updatedCar.id, {
      include: [
        {
          model: db.User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
          required: false // Allow cars without owners
        }
      ]
    });

    // Transform car to include status field
    const carData = carWithOwner.toJSON();
    const availabilityStatus = carData.isAvailable !== undefined ? carData.isAvailable : carData.is_available;
    carData.status = availabilityStatus ? 'available' : 'rented';

    res.status(200).json(carData);
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete car
export const deleteCar = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    const { carId } = req.params;
    // Find car
    const car = await db.Car.findByPk(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    // Check if car has active rentals
    const activeRentals = await db.Rental.count({
      where: {
        carId: carId,
        status: ['pending_approval', 'approved', 'active']
      }
    });

    if (activeRentals > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete car with active or pending rentals' 
      });
    }

    // Delete car
    await car.destroy();

    res.status(200).json({ message: 'Car deleted successfully' });

  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update car status (approve/reject/deactivate)
export const updateCarStatus = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { carId } = req.params;
    const { status, rejectionReason } = req.body;

    // Validate status
    const validStatuses = ['available', 'rented', 'maintenance', 'pending_approval', 'rejected', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find car
    const car = await db.Car.findByPk(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Map status to isAvailable field (since status field doesn't exist in model)
    const carAvailability = status === 'available';
    
    // Update car availability (we can't store rejection reason since field doesn't exist)
    const updatedCar = await car.update({ isAvailable: carAvailability });

    // Return updated car with owner info
    const carWithOwner = await db.Car.findByPk(updatedCar.id, {
      include: [
        {
          model: db.User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
          required: false // Allow cars without owners
        }
      ]
    });

    // Transform car to include status field
    const carData = carWithOwner.toJSON();
    const availabilityStatus = carData.isAvailable !== undefined ? carData.isAvailable : carData.is_available;
    carData.status = availabilityStatus ? 'available' : 'rented';

    res.status(200).json(carData);

  } catch (error) {
    console.error('Error updating car status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Bulk actions on cars
export const bulkCarAction = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { carIds, action } = req.body;

    if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
      return res.status(400).json({ message: 'Car IDs array is required' });
    }

    if (!['approve', 'reject', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve, reject, deactivate, or delete' });
    }

    let affectedCount = 0;

    switch (action) {
      case 'approve':
        const [approveCount] = await db.Car.update(
          { isAvailable: true },
          { where: { id: { [Op.in]: carIds } } }
        );
        affectedCount = approveCount;
        break;

      case 'reject':
        const [rejectCount] = await db.Car.update(
          { isAvailable: false },
          { where: { id: { [Op.in]: carIds } } }
        );
        affectedCount = rejectCount;
        break;

      case 'deactivate':
        const [deactivateCount] = await db.Car.update(
          { isAvailable: false },
          { where: { id: { [Op.in]: carIds } } }
        );
        affectedCount = deactivateCount;
        break;

      case 'delete':
        // Check for active rentals before deleting
        const carsWithActiveRentals = await db.Rental.findAll({
          where: {
            carId: { [Op.in]: carIds },
            status: ['pending_approval', 'approved', 'active']
          },
          attributes: ['carId'],
          group: ['carId']
        });

        const carsWithActiveRentalsIds = carsWithActiveRentals.map(rental => rental.carId);
        const carsToDelete = carIds.filter(id => !carsWithActiveRentalsIds.includes(id));

        if (carsToDelete.length === 0) {
          return res.status(400).json({ 
            message: 'Cannot delete cars with active or pending rentals' 
          });
        }

        affectedCount = await db.Car.destroy({
          where: { id: { [Op.in]: carsToDelete } }
        });
        break;
    }

    res.status(200).json({
      message: `Bulk ${action} completed successfully`,
      affectedCount: Array.isArray(affectedCount) ? affectedCount[0] : affectedCount
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get car statistics for admin dashboard
export const getCarStats = async (req, res) => {
  try {
    console.log('getCarStats - Request details:', {
      userId: req.userId,
      userRole: req.userRole
    });

    // Verify user is admin
    if (req.userRole !== 'admin') {
      console.log('getCarStats - Access denied. User role:', req.userRole);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    console.log('getCarStats - Fetching car counts...');
    // Get car counts by availability (since we don't have status field)
    const totalCars = await db.Car.count();
    const availableCars = await db.Car.count({ where: { isAvailable: true } });
    const rentedCars = await db.Car.count({ where: { isAvailable: false } });
    const maintenanceCars = 0; // Not tracked in current model
    const pendingApprovalCars = 0; // Not tracked in current model
    const rejectedCars = 0; // Not tracked in current model
    const inactiveCars = await db.Car.count({ where: { isAvailable: false } });

    console.log('getCarStats - Car counts:', { totalCars, availableCars, rentedCars });

    // Get new cars this month
    console.log('getCarStats - Fetching new cars this month...');
    const newCarsThisMonth = await db.Car.count({
      where: {
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    console.log('getCarStats - New cars this month:', newCarsThisMonth);

    // Get average rental price
    console.log('getCarStats - Fetching average rental price...');
    const avgRentalPrice = await db.Car.findOne({
      attributes: [
        [fn('AVG', col('rental_price_per_day')), 'avgPrice']
      ],
      raw: true
    });

    console.log('getCarStats - Average rental price result:', avgRentalPrice);

    const stats = {
      totalCars,
      availableCars,
      rentedCars,
      maintenanceCars,
      pendingApprovalCars,
      rejectedCars,
      inactiveCars,
      newCarsThisMonth,
      averageRentalPrice: parseFloat(avgRentalPrice?.avgPrice || 0)
    };

    console.log('getCarStats - Sending response:', stats);
    res.status(200).json(stats);

  } catch (error) {
    console.error('Error fetching car stats - Full error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all owners for filter dropdown
export const getOwners = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const owners = await db.User.findAll({
      where: { role: 'owner' },
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']]
    });

    res.status(200).json(owners);

  } catch (error) {
    console.error('Error fetching owners:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
