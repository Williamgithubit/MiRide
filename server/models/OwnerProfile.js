export default (sequelize, DataTypes) => {
  const OwnerProfile = sequelize.define('OwnerProfile', {
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
    businessName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    businessAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taxId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    businessPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    businessEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    // Add any other owner-specific fields here
  }, {
    tableName: 'owner_profiles',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });

  OwnerProfile.associate = (models) => {
    // Define association to User model
    OwnerProfile.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return OwnerProfile;
};
