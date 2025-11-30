'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('cars', 'transmission', {
      type: Sequelize.ENUM('Automatic', 'Manual'),
      allowNull: false,
      defaultValue: 'Automatic',
      after: 'fuel_type'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('cars', 'transmission');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_cars_transmission";');
  }
};
