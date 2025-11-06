'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class CarImage extends Model {
    static associate(models) {
      CarImage.belongsTo(models.Car, {
        foreignKey: 'carId',
        as: 'car',
        onDelete: 'CASCADE'
      });
    }
  }
  
  CarImage.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'image_url'
    },
    carId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'car_id',
      references: {
        model: 'cars',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_primary'
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'CarImage',
    tableName: 'car_images',
    timestamps: true,
    underscored: true
  });

  return CarImage;
};
