'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to the rentals table
    await queryInterface.addColumn('rentals', 'owner_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    });

    await queryInterface.addColumn('rentals', 'total_days', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('rentals', 'total_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await queryInterface.addColumn('rentals', 'status', {
      type: Sequelize.ENUM('pending_approval', 'approved', 'rejected', 'active', 'completed', 'cancelled'),
      defaultValue: 'pending_approval',
      allowNull: false,
    });

    await queryInterface.addColumn('rentals', 'payment_status', {
      type: Sequelize.ENUM('pending', 'paid', 'refunded', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    });

    await queryInterface.addColumn('rentals', 'payment_intent_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('rentals', 'stripe_session_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('rentals', 'pickup_location', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('rentals', 'dropoff_location', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('rentals', 'special_requests', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Add-ons
    await queryInterface.addColumn('rentals', 'has_insurance', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('rentals', 'has_gps', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('rentals', 'has_child_seat', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('rentals', 'has_additional_driver', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('rentals', 'insurance_cost', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });

    await queryInterface.addColumn('rentals', 'gps_cost', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });

    await queryInterface.addColumn('rentals', 'child_seat_cost', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });

    await queryInterface.addColumn('rentals', 'additional_driver_cost', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });

    await queryInterface.addColumn('rentals', 'approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('rentals', 'rejected_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('rentals', 'rejection_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Add timestamps if they don't exist
    await queryInterface.addColumn('rentals', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

    await queryInterface.addColumn('rentals', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns in reverse order
    await queryInterface.removeColumn('rentals', 'updated_at');
    await queryInterface.removeColumn('rentals', 'created_at');
    await queryInterface.removeColumn('rentals', 'rejection_reason');
    await queryInterface.removeColumn('rentals', 'rejected_at');
    await queryInterface.removeColumn('rentals', 'approved_at');
    await queryInterface.removeColumn('rentals', 'additional_driver_cost');
    await queryInterface.removeColumn('rentals', 'child_seat_cost');
    await queryInterface.removeColumn('rentals', 'gps_cost');
    await queryInterface.removeColumn('rentals', 'insurance_cost');
    await queryInterface.removeColumn('rentals', 'has_additional_driver');
    await queryInterface.removeColumn('rentals', 'has_child_seat');
    await queryInterface.removeColumn('rentals', 'has_gps');
    await queryInterface.removeColumn('rentals', 'has_insurance');
    await queryInterface.removeColumn('rentals', 'special_requests');
    await queryInterface.removeColumn('rentals', 'dropoff_location');
    await queryInterface.removeColumn('rentals', 'pickup_location');
    await queryInterface.removeColumn('rentals', 'stripe_session_id');
    await queryInterface.removeColumn('rentals', 'payment_intent_id');
    await queryInterface.removeColumn('rentals', 'payment_status');
    await queryInterface.removeColumn('rentals', 'status');
    await queryInterface.removeColumn('rentals', 'total_amount');
    await queryInterface.removeColumn('rentals', 'total_days');
    await queryInterface.removeColumn('rentals', 'owner_id');
  }
};
