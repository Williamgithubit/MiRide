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
        isFutureDate(value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const startDate = new Date(value);
          if (startDate <= today) {
            throw new Error('Start date must be a future date.');
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
  }, {
    timestamps: false,
    tableName: 'rentals',
    underscored: true
  });

  Rental.associate = (models) => {
    Rental.belongsTo(models.Car, {
      foreignKey: 'carId',
      as: 'Car'
    });
    Rental.belongsTo(models.User, {
      foreignKey: 'customerId',
      as: 'Customer'
    });
  };

  return Rental;
};

export default RentalModel;