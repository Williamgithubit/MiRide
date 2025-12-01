export default (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    rentalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rentals',
        key: 'id',
      },
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
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
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stripeAccountId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    ownerAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'usd',
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'processing', 'succeeded', 'failed', 'refunded'),
      defaultValue: 'pending',
      allowNull: false,
    },
    payoutStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    stripeTransferId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Rental, {
      foreignKey: 'rentalId',
      as: 'rental',
    });
    Payment.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner',
    });
    Payment.belongsTo(models.User, {
      foreignKey: 'customerId',
      as: 'customer',
    });
  };

  return Payment;
};
