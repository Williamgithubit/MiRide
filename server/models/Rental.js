const RentalModel = (sequelize, DataTypes) => {
  const Rental = sequelize.define("Rental", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    carId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cars',  // References the 'cars' table
        key: 'id',      // References the 'id' column in 'cars'
      },
      onDelete: 'CASCADE', // Optional: Delete rental if car is deleted
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', // References the 'users' table
        key: 'id',
      },
      onDelete: 'CASCADE', // Optional: Delete rental if customer is deleted
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        isFutureOrTodayDate(value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const startDate = new Date(value);
          if (startDate < today) {
            throw new Error('Start date cannot be in the past.');
          }
        }
      },
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterStartDate(value) { // Custom validator
          if (value <= this.startDate) {
            throw new Error('End date must be after start date.');
          }
        },
      },
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // New fields for enhanced booking system
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    totalDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending_approval', 'approved', 'rejected', 'active', 'completed', 'cancelled'),
      defaultValue: 'pending_approval',
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded', 'partial_refund', 'cancelled_no_refund', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeSessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pickupLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dropoffLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Add-ons
    hasInsurance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hasGPS: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hasChildSeat: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hasAdditionalDriver: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    insuranceCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    gpsCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    childSeatCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    additionalDriverCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Stripe Connect commission fields
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
    },
    ownerPayout: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
    },
    stripeTransferId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payoutStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'rentals',
    underscored: true
  });

  Rental.associate = (models) => {
    Rental.belongsTo(models.Car, {
      foreignKey: 'carId',
      as: 'car'
    });
    Rental.belongsTo(models.User, {
      foreignKey: 'customerId',
      as: 'customer'
    });
    Rental.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
  };

  return Rental;
};

export default RentalModel;