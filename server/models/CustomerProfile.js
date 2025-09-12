export default (sequelize, DataTypes) => {
  const CustomerProfile = sequelize.define('CustomerProfile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    driverLicense: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferredPaymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Add any other customer-specific fields here
  }, {
    tableName: 'customer_profiles',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });

  CustomerProfile.associate = (models) => {
    // Define association to User model
    CustomerProfile.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return CustomerProfile;
};
