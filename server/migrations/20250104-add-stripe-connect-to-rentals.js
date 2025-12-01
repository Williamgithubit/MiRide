'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    // Add Stripe Connect fields to rentals table for tracking commission
    await queryInterface.addColumn('rentals', 'platform_fee', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
    });

    await queryInterface.addColumn('rentals', 'owner_payout', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
    });

    await queryInterface.addColumn('rentals', 'stripe_transfer_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('rentals', 'payout_status', {
      type: Sequelize.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    });
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('rentals', 'platform_fee');
    await queryInterface.removeColumn('rentals', 'owner_payout');
    await queryInterface.removeColumn('rentals', 'stripe_transfer_id');
    await queryInterface.removeColumn('rentals', 'payout_status');
}
