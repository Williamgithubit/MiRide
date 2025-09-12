import db from "../models/index.js";

// Add new car
export const createCar = async (req, res) => {
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
    imageUrl,
  } = req.body;

  try {
    // Log which user is creating the car (if middleware attached user)
    if (req.user) {
      console.log("createCar - authenticated user:", {
        id: req.user.id,
        role: req.user.role,
      });
    } else {
      console.log("createCar - no req.user present");
    }
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
      imageUrl:
        imageUrl ||
        `https://source.unsplash.com/random/300x200/?${encodeURIComponent(
          (brand || "") + " " + (model || "car")
        )}`,
      // Associate created car with the authenticated owner when available
      ownerId: req.user ? req.user.id : req.body.ownerId || null,
      isAvailable: true,
      rating: 4.5,
      reviews: 0,
      isLiked: false,
    });
    return res.status(201).json(newCar);
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
export const getCars = async (req, res) => {
  const {
    brand,
    minPrice,
    maxPrice,
    fuelType,
    seats,
    location,
    sortBy = "name",
    sortOrder = "ASC",
    page = 1,
    limit = 12,
    search,
  } = req.query;

  try {
    const where = {};

    // Build filter conditions
    if (brand) where.brand = brand;
    if (fuelType) where.fuelType = fuelType;
    if (location) where.location = location;
    if (seats) where.seats = { [db.Sequelize.Op.gte]: seats };

    // Search functionality
    if (search) {
      where[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { brand: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { model: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.rentalPricePerDay = {};
      if (minPrice)
        where.rentalPricePerDay[db.Sequelize.Op.gte] = parseFloat(minPrice);
      if (maxPrice)
        where.rentalPricePerDay[db.Sequelize.Op.lte] = parseFloat(maxPrice);
    }

    // Define sort order
    const order = [];
    if (
      [
        "name",
        "brand",
        "rentalPricePerDay",
        "rating",
        "reviews",
        "year",
      ].includes(sortBy)
    ) {
      order.push([sortBy, sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]);
    } else {
      order.push(["name", "ASC"]); // Default sort
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 12, 50); // Max 50 items per page
    const offset = (pageNum - 1) * limitNum;

    // Use findAndCountAll for pagination info
    const result = await db.Car.findAndCountAll({
      where,
      order,
      limit: limitNum,
      offset: offset,
      attributes: [
        "id",
        "name",
        "brand",
        "model",
        "year",
        "rentalPricePerDay",
        "imageUrl",
        "isAvailable",
        "rating",
        "reviews",
        "seats",
        "fuelType",
        "location",
        "features",
        "isLiked",
      ],
    });

    // Calculate pagination info
    const totalPages = Math.ceil(result.count / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return res.status(200).json({
      cars: result.rows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: result.count,
        itemsPerPage: limitNum,
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
export const getCar = async (req, res) => {
  const { id } = req.params;

  try {
    const car = await db.Car.findByPk(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    return res.status(200).json(car);
  } catch (error) {
    console.error("Error fetching car:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get cars by owner
export const getCarsByOwner = async (req, res) => {
  try {
    // Get owner ID from authenticated user or URL params
    const ownerId = req.params.ownerId || req.user?.id;
    
    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const cars = await db.Car.findAll({
      where: { ownerId },
      attributes: [
        "id",
        "name",
        "brand",
        "model",
        "year",
        "rentalPricePerDay",
        "imageUrl",
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

    return res.status(200).json({
      cars,
      count: cars.length
    });
  } catch (error) {
    console.error("Error fetching cars by owner:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update car info
export const updateCar = async (req, res) => {
  const { id } = req.params;
  const updateFields = { ...req.body };

  // Remove fields that shouldn't be updated
  delete updateFields.id;
  delete updateFields.rating; // Prevent direct rating updates
  delete updateFields.reviews; // Prevent direct reviews updates

  try {
    const car = await db.Car.findByPk(id);
    if (!car) {
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
      "imageUrl",
      "seats",
      "fuelType",
      "location",
      "features",
      "isLiked",
    ];

    allowedFields.forEach((field) => {
      if (updateFields[field] !== undefined) {
        car[field] = updateFields[field];
      }
    });

    await car.save();
    return res.status(200).json(car);
  } catch (error) {
    console.error("Error updating car:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle like status for a car
export const toggleLike = async (req, res) => {
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
export const addReview = async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const car = await db.Car.findByPk(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Calculate new average rating
    const newReviews = car.reviews + 1;
    const newRating =
      (car.rating * car.reviews + parseFloat(rating)) / newReviews;

    // Update car with new rating and review count
    car.rating = parseFloat(newRating.toFixed(1));
    car.reviews = newReviews;
    await car.save();

    return res.status(200).json({
      success: true,
      rating: car.rating,
      reviews: car.reviews,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Remove a car
export const deleteCar = async (req, res) => {
  const { id } = req.params;

  try {
    const car = await db.Car.findByPk(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    await car.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting car:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
