const Car = (sequelize, DataTypes) => {
  const Car = sequelize.define("Car", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1900,
        max: new Date().getFullYear() + 1,
      },
    },
    rentalPricePerDay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      field: 'rental_price_per_day'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      defaultValue: 4.5,
      validate: {
        min: 0,
        max: 5,
      },
    },
    reviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
    fuelType: {
      type: DataTypes.ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid'),
      allowNull: false,
      field: 'fuel_type',
      defaultValue: 'Petrol',
    },
    transmission: {
      type: DataTypes.ENUM('Automatic', 'Manual'),
      allowNull: false,
      defaultValue: 'Automatic',
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Downtown',
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    isLiked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_liked',
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_available',
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'owner_id',
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'cars',
    timestamps: true,
    underscored: true
  });

  // Add virtual field for imageUrl that gets the primary image from the images array
  Car.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Add imageUrl as a computed property from images array
    if (this.images && this.images.length > 0) {
      const primaryImage = this.images.find(img => img.isPrimary);
      values.imageUrl = primaryImage ? primaryImage.imageUrl : this.images[0].imageUrl;
    } else {
      values.imageUrl = null;
    }
    
    return values;
  };

  Car.associate = (models) => {
    Car.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner',
      onDelete: 'SET NULL'
    });
    Car.hasMany(models.Maintenance, {
      foreignKey: 'carId',
      as: 'maintenances',
      onDelete: 'CASCADE'
    });
    Car.hasMany(models.Rental, {
      foreignKey: 'carId',
      as: 'rentals',
      onDelete: 'CASCADE'
    });
    Car.hasMany(models.Review, {
      foreignKey: 'carId',
      as: 'carReviews',
      onDelete: 'CASCADE'
    });
    
    Car.hasMany(models.CarImage, {
      foreignKey: 'carId',
      as: 'images',
      onDelete: 'CASCADE'
    });
  };

  return Car;
};

export default Car;
