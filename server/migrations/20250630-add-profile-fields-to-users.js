'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to users table
    await queryInterface.addColumn('users', 'date_of_birth', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove columns if rolling back
    await queryInterface.removeColumn('users', 'date_of_birth');
    await queryInterface.removeColumn('users', 'avatar');
    await queryInterface.removeColumn('users', 'address');
  }
};
