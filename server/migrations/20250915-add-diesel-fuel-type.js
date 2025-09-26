'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Add 'Diesel' to the existing enum_cars_fuel_type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_cars_fuel_type" ADD VALUE 'Diesel';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type and updating all references
    console.log('Cannot remove enum value in PostgreSQL. Manual intervention required.');
  }
};
