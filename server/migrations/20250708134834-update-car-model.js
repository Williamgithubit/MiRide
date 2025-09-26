'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Helper function to check if column exists
    const columnExists = async (tableName, columnName) => {
      const tableDescription = await queryInterface.describeTable(tableName);
      return !!tableDescription[columnName];
    };

    // Create ENUM type if it doesn't exist
    try {
      await queryInterface.sequelize.query('CREATE TYPE "enum_cars_fuel_type" AS ENUM(\'Petrol\', \'Electric\', \'Hybrid\')');
    } catch (error) {
      console.log('ENUM type might already exist:', error.message);
    }
    
    // Add brand column if it doesn't exist
    if (!(await columnExists('cars', 'brand'))) {
      await queryInterface.addColumn('cars', 'brand', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Unknown'
      });
    }

    // Try to rename column, but skip if it fails (likely already renamed)
    try {
      await queryInterface.renameColumn('cars', 'rentalPricePerDay', 'rental_price_per_day');
    } catch (error) {
      console.log('Column rename failed (may already be renamed):', error.message);
    }

    // Add rating column if it doesn't exist
    if (!(await columnExists('cars', 'rating'))) {
      await queryInterface.addColumn('cars', 'rating', {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: false,
        defaultValue: 4.5
      });
    }

    // Add reviews column if it doesn't exist
    if (!(await columnExists('cars', 'reviews'))) {
      await queryInterface.addColumn('cars', 'reviews', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      });
    }

    // Add seats column if it doesn't exist
    if (!(await columnExists('cars', 'seats'))) {
      await queryInterface.addColumn('cars', 'seats', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      });
    }

    // Add fuel_type column if it doesn't exist
    if (!(await columnExists('cars', 'fuel_type'))) {
      await queryInterface.addColumn('cars', 'fuel_type', {
        type: 'enum_cars_fuel_type',
        allowNull: false,
        defaultValue: 'Petrol'
      });
    }

    // Add location column if it doesn't exist
    if (!(await columnExists('cars', 'location'))) {
      await queryInterface.addColumn('cars', 'location', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Downtown'
      });
    }

    // Add features column if it doesn't exist
    if (!(await columnExists('cars', 'features'))) {
      await queryInterface.addColumn('cars', 'features', {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: []
      });
    }

    // Add is_liked column if it doesn't exist
    if (!(await columnExists('cars', 'is_liked'))) {
      await queryInterface.addColumn('cars', 'is_liked', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    // Try to rename columns, but skip if they fail (likely already renamed)
    try {
      await queryInterface.renameColumn('cars', 'isAvailable', 'is_available');
    } catch (error) {
      console.log('Column rename failed (may already be renamed):', error.message);
    }
    
    try {
      await queryInterface.renameColumn('cars', 'imageUrl', 'image_url');
    } catch (error) {
      console.log('Column rename failed (may already be renamed):', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('cars', 'brand');
    await queryInterface.renameColumn('cars', 'rental_price_per_day', 'rentalPricePerDay');
    await queryInterface.removeColumn('cars', 'rating');
    await queryInterface.removeColumn('cars', 'reviews');
    await queryInterface.removeColumn('cars', 'seats');
    await queryInterface.removeColumn('cars', 'fuel_type');
    await queryInterface.removeColumn('cars', 'location');
    await queryInterface.removeColumn('cars', 'features');
    await queryInterface.removeColumn('cars', 'is_liked');
    await queryInterface.renameColumn('cars', 'is_available', 'isAvailable');
    await queryInterface.renameColumn('cars', 'image_url', 'imageUrl');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_cars_fuel_type"');
  }
};
