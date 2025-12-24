'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new notification types to the enum
    // PostgreSQL requires ALTER TYPE to add new enum values
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'booking_timeout';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'booking_reminder';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'rental_upcoming';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'refund_processed';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values easily
    // You would need to recreate the enum type without these values
    // This is left as a no-op for safety
    console.log('Removing enum values is not supported in PostgreSQL without recreating the type');
  }
};
