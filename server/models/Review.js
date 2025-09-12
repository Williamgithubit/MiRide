// server/models/Review.js
export default (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    carId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cars',
        key: 'id',
      },
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    rentalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'rentals',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    helpfulCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'reviews',
    timestamps: true,
  });

  Review.associate = (models) => {
    Review.belongsTo(models.Car, {
      foreignKey: 'carId',
      as: 'car',
    });
    Review.belongsTo(models.User, {
      foreignKey: 'customerId',
      as: 'customer',
    });
    Review.belongsTo(models.Rental, {
      foreignKey: 'rentalId',
      as: 'rental',
    });
  };

  return Review;
};
