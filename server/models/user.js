import bcrypt from 'bcryptjs';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('customer', 'owner', 'admin'),
      defaultValue: 'customer',
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.prototype.validPassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    // Define associations to profile models
    User.hasOne(models.CustomerProfile, {
      foreignKey: 'userId',
      as: 'customerProfile',
      onDelete: 'CASCADE',
    });
    
    User.hasOne(models.OwnerProfile, {
      foreignKey: 'userId',
      as: 'ownerProfile',
      onDelete: 'CASCADE',
    });

    User.hasMany(models.Car, {
      foreignKey: 'ownerId',
      as: 'cars',
      onDelete: 'SET NULL'
    });

    User.hasMany(models.Rental, {
      foreignKey: 'customerId',
      as: 'rentals',
      onDelete: 'CASCADE'
    });

    User.hasMany(models.Review, {
      foreignKey: 'customerId',
      as: 'reviews',
      onDelete: 'CASCADE'
    });
  };

  return User;
};
