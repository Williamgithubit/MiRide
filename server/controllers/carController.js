import db from "../models/index.js";
import { uploadFiles } from "../utils/uploadConfig.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to handle file uploads for car images
const uploadCarImagesMiddleware = (req, res, next) => {
  uploadFiles(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Add new car
const createCar = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const {
      name,
      brand,
      model,
      year,
      rentalPricePerDay,
      seats,
      fuelType,
      location,
      features,
    } = req.body;

    // Log which user is creating the car (if middleware attached user)
    if (req.user) {
      console.log("createCar - authenticated user:", {
        id: req.user.id,
        role: req.user.role,
      });
    } else {
      console.log("createCar - no req.user present");
    }

    // Create the car
    const newCar = await db.Car.create({
      name,
      brand: brand || "Unknown",
      model,
      year,
      rentalPricePerDay,
      seats: seats || 5,
      fuelType: fuelType || "Petrol",
      location: location || "Downtown",
      features: features || [],
      ownerId: req.user ? req.user.id : req.body.ownerId || null,
      isAvailable: true,
      rating: 4.5,
      reviews: 0,
      isLiked: false,
    }, { transaction });

    // If there are uploaded files, create image records
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => {
        return db.CarImage.create({
          imageUrl: `/uploads/cars/${file.filename}`,
          carId: newCar.id,
          isPrimary: index === 0, // First image is primary by default
          order: index
        }, { transaction });
      });
      
      await Promise.all(imagePromises);
    }

    await transaction.commit();
    
    // Fetch the car with its images
    const carWithImages = await db.Car.findByPk(newCar.id, {
      include: [
        { 
          model: db.CarImage, 
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary', 'order'],
          order: [['order', 'ASC']]
        }
      ]
    });

    return res.status(201).json(carWithImages);
  } catch (error) {
    console.error("Error creating car:", {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      user: req.user || 'No user in request'
    });
    return res.status(500).json({ 
      message: "Error creating car",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// List all cars with filtering, sorting, and pagination
const getCars = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100, // Increased default limit to show more cars
      sortBy = "createdAt",
      sortOrder = "DESC",
      minPrice,
      maxPrice,
      fuelType,
      seats,
      location,
      search,
      available,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};
    const { Op } = db.Sequelize;

    // Apply filters
    if (minPrice || maxPrice) {
      whereClause.rentalPricePerDay = {};
      if (minPrice) whereClause.rentalPricePerDay[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.rentalPricePerDay[Op.lte] = parseFloat(maxPrice);
    }

    if (fuelType) whereClause.fuelType = fuelType;
    if (seats) whereClause.seats = { [Op.gte]: parseInt(seats) };
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
    if (available !== undefined) whereClause.isAvailable = available === 'true';
    
    // Search across multiple fields
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: cars } = await db.Car.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: db.CarImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary', 'order'],
          separate: true, // Use separate query to properly handle ordering and limiting
          order: [['isPrimary', 'DESC'], ['order', 'ASC']],
          limit: 1 // Only get the primary image for listing
        }
      ],
      attributes: [
        "id",
        "name",
        "brand",
        "model",
        "year",
        "rentalPricePerDay",
        "seats",
        "fuelType",
        "location",
        "rating",
        "reviews",
        "isLiked",
        "isAvailable",
        "createdAt",
        "updatedAt",
      ],
    });

    // Transform cars to include primary imageUrl for backward compatibility
    const transformedCars = cars.map(car => {
      const carData = car.toJSON();
      // Set imageUrl to the primary image or first image if available
      if (carData.images && carData.images.length > 0) {
        const primaryImage = carData.images.find(img => img.isPrimary) || carData.images[0];
        carData.imageUrl = primaryImage.imageUrl;
      } else {
        // Set a placeholder if no images
        carData.imageUrl = '/uploads/cars/placeholder.jpg';
      }
      return carData;
    });

    console.log(`getCars - Found ${count} total cars, returning ${transformedCars.length} cars for page ${page}`);

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    return res.status(200).json({
      cars: transformedCars,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get single car details
const getCar = async (req, res) => {
  const { id } = req.params;

  try {
    const car = await db.Car.findByPk(id, {
      include: [
        {
          model: db.CarImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary', 'order'],
          order: [['isPrimary', 'DESC'], ['order', 'ASC']]
        },
        {
          model: db.User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'role']
        }
      ]
    });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    return res.status(200).json(car);
  } catch (error) {
    console.error("Error fetching car:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get available cars based on date range
const getAvailableCars = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { Op } = db.Sequelize;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Start date and end date are required" 
      });
    }

    // Parse dates
    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
      return res.status(400).json({ 
        message: "Invalid date format" 
      });
    }

    if (requestedStart >= requestedEnd) {
      return res.status(400).json({ 
        message: "End date must be after start date" 
      });
    }

    // Get all cars that are marked as available
    const allCars = await db.Car.findAll({
      where: { isAvailable: true },
      include: [
        {
          model: db.CarImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary', 'order'],
          order: [['isPrimary', 'DESC'], ['order', 'ASC']]
        }
      ],
      attributes: [
        "id",
        "name",
        "brand",
        "model",
        "year",
        "rentalPricePerDay",
        "seats",
        "fuelType",
        "location",
        "features",
        "rating",
        "reviews",
        "isLiked",
        "isAvailable",
        "createdAt",
        "updatedAt"
      ]
    });

    // Check each car for conflicting rentals
    const availableCars = [];
    
    for (const car of allCars) {
      // Find any rentals that overlap with the requested dates
      const conflictingRentals = await db.Rental.findAll({
        where: {
          carId: car.id,
          status: {
            [Op.in]: ['pending_approval', 'approved', 'active']
          },
          [Op.or]: [
            {
              // Rental starts during requested period
              startDate: {
                [Op.between]: [requestedStart, requestedEnd]
              }
            },
            {
              // Rental ends during requested period
              endDate: {
                [Op.between]: [requestedStart, requestedEnd]
              }
            },
            {
              // Rental completely encompasses requested period
              [Op.and]: [
                { startDate: { [Op.lte]: requestedStart } },
                { endDate: { [Op.gte]: requestedEnd } }
              ]
            }
          ]
        }
      });

      // If no conflicting rentals, car is available
      if (conflictingRentals.length === 0) {
        availableCars.push(car);
      }
    }

    // Format the response
    const formattedCars = availableCars.map(car => {
      const carData = car.get({ plain: true });
      return carData;
    });

    console.log(`getAvailableCars - Found ${formattedCars.length} available cars for ${startDate} to ${endDate}`);
    
    return res.status(200).json(formattedCars);
  } catch (error) {
    console.error("Error fetching available cars:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get cars by owner
const getCarsByOwner = async (req, res) => {
  try {
    // Get owner ID from authenticated user or URL params
    const ownerId = req.params.ownerId || req.user?.id;
    
    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const cars = await db.Car.findAll({
      where: { ownerId },
      include: [
        {
          model: db.CarImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary', 'order'],
          order: [['isPrimary', 'DESC'], ['order', 'ASC']],
          limit: 1 // Only get the primary image for listing
        }
      ],
      attributes: [
        "id",
        "name",
        "brand",
        "model",
        "year",
        "rentalPricePerDay",
        "isAvailable",
        "rating",
        "reviews",
        "seats",
        "fuelType",
        "location",
        "features",
        "isLiked",
        "ownerId",
        "createdAt",
        "updatedAt"
      ],
      order: [["createdAt", "DESC"]]
    });

    // Format the response to include the primary image URL
    const formattedCars = cars.map(car => {
      const carData = car.get({ plain: true });
      // Use the primary image if available, otherwise use a placeholder
      const primaryImage = carData.images && carData.images.length > 0 
        ? carData.images[0].imageUrl 
        : '/uploads/cars/placeholder.jpg';
      
      return {
        ...carData,
        imageUrl: primaryImage, // For backward compatibility
        images: carData.images // Include all images
      };
    });

    // Return array directly for frontend compatibility
    return res.status(200).json(formattedCars);
  } catch (error) {
    console.error("Error fetching cars by owner:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update car info
const updateCar = async (req, res) => {
  const { id } = req.params;
  const updateFields = { ...req.body };
  const transaction = await db.sequelize.transaction();

  try {
    // Remove fields that shouldn't be updated
    delete updateFields.id;
    delete updateFields.rating; // Prevent direct rating updates
    delete updateFields.reviews; // Prevent direct reviews updates
    delete updateFields.images; // Handle images separately

    const car = await db.Car.findByPk(id, { transaction });
    if (!car) {
      await transaction.rollback();
      return res.status(404).json({ message: "Car not found" });
    }

    // Update only the fields that are provided in the request
    const allowedFields = [
      "name",
      "brand",
      "model",
      "year",
      "rentalPricePerDay",
      "isAvailable",
      "seats",
      "fuelType",
      "location",
      "features",
      "isLiked",
    ];

    // Update car fields
    await car.update(updateFields, { transaction });

    // Handle image reordering if provided
    if (req.body.orderedImageIds && Array.isArray(req.body.orderedImageIds)) {
      const updatePromises = req.body.orderedImageIds.map((imageId, index) => {
        return db.CarImage.update(
          { order: index },
          { 
            where: { 
              id: imageId,
              carId: id 
            },
            transaction 
          }
        );
      });
      
      await Promise.all(updatePromises);
    }

    // Handle new image uploads if any
    if (req.files && req.files.length > 0) {
      // Get current image count
      const imageCount = await db.CarImage.count({ 
        where: { carId: id },
        transaction 
      });
      
      const remainingSlots = 4 - imageCount;
      if (remainingSlots > 0) {
        const filesToProcess = req.files.slice(0, remainingSlots);
        
        const imagePromises = filesToProcess.map((file, index) => {
          return db.CarImage.create({
            imageUrl: `/uploads/cars/${file.filename}`,
            carId: id,
            isPrimary: imageCount === 0 && index === 0, // First image is primary if no images exist
            order: imageCount + index
          }, { transaction });
        });
        
        await Promise.all(imagePromises);
      }
    }

    await transaction.commit();
    
    // Fetch the updated car with images
    const updatedCar = await db.Car.findByPk(id, {
      include: [
        { 
          model: db.CarImage, 
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary', 'order'],
          order: [['isPrimary', 'DESC'], ['order', 'ASC']]
        }
      ]
    });

    return res.status(200).json(updatedCar);
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating car:", error);
    return res.status(500).json({ 
      message: "Error updating car",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Toggle like status for a car
const toggleLike = async (req, res) => {
  const { id } = req.params;

  try {
    const car = await db.Car.findByPk(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    car.isLiked = !car.isLiked;
    await car.save();

    return res.status(200).json({
      success: true,
      isLiked: car.isLiked,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Add a review to a car
const addReview = async (req, res) => {
  try {
    const { carId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user already reviewed this car
    const existingReview = await Review.findOne({ userId, carId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You can only review a car once'
      });
    }

    const review = await Review.create({
      userId,
      carId: parseInt(carId),
      rating: parseInt(rating),
      comment: comment || '',
      createdAt: new Date()
    });

    // Update car's average rating
    // await updateCarAverageRating(carId);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove a car
const deleteCar = async (req, res) => {
  const { id } = req.params;
  const transaction = await db.sequelize.transaction();

  try {
    // Find the car with its images
    const car = await db.Car.findByPk(id, {
      include: [
        {
          model: db.CarImage,
          as: 'images',
          attributes: ['id', 'imageUrl']
        }
      ],
      transaction
    });
    
    if (!car) {
      await transaction.rollback();
      return res.status(404).json({ message: "Car not found" });
    }

    // Delete all associated images from storage
    const deletePromises = car.images.map(image => {
      const filePath = path.join(__dirname, '../../public', image.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return image.destroy({ transaction });
    });

    // Wait for all images to be deleted
    await Promise.all(deletePromises);
    
    // Delete the car
    await car.destroy({ transaction });
    
    await transaction.commit();
    return res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting car:", error);
    return res.status(500).json({ 
      message: "Error deleting car",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all images for a car
const getCarImages = async (req, res) => {
  try {
    const { carId } = req.params;

    const car = await db.Car.findByPk(carId, {
      include: [
        {
          model: db.CarImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary', 'order'],
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car.images);
  } catch (error) {
    console.error('Error getting car images:', error);
    res.status(500).json({ 
      message: 'Error getting car images',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Named exports for ES modules
export {
  uploadCarImagesMiddleware,
  createCar,
  getCars,
  getCar,
  getAvailableCars,
  getCarsByOwner,
  updateCar,
  toggleLike,
  addReview,
  deleteCar,
  getCarImages
};

// Default export for CommonJS compatibility
export default {
  uploadCarImagesMiddleware,
  createCar,
  getCars,
  getCar,
  getAvailableCars,
  getCarsByOwner,
  updateCar,
  toggleLike,
  addReview,
  deleteCar,
  getCarImages
};
