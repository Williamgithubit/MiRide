export default (sequelize, DataTypes) => {
  const Refund = sequelize.define(
    "Refund",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      paymentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "payments",
          key: "id",
        },
      },
      rentalId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "rentals",
          key: "id",
        },
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      stripeRefundId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: true,
        defaultValue: "usd",
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "refunds",
      timestamps: true,
      underscored: true,
    }
  );

  Refund.associate = (models) => {
    Refund.belongsTo(models.Payment, {
      foreignKey: "paymentId",
      as: "payment",
    });
    Refund.belongsTo(models.Rental, { foreignKey: "rentalId", as: "rental" });
    Refund.belongsTo(models.User, { foreignKey: "ownerId", as: "owner" });
    Refund.belongsTo(models.User, { foreignKey: "customerId", as: "customer" });
  };

  return Refund;
};
