'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('cars', 'imageUrl', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'https://via.placeholder.com/400x300?text=No+Image+Available'
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('cars', 'imageUrl');
    } catch (error) {
      // Table might not exist, ignore the error
      console.log('Table cars might not exist, skipping column removal');
    }
  }
};
