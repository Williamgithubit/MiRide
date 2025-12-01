'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    // Add Stripe Connect fields to owner_profiles table
    await queryInterface.addColumn('owner_profiles', 'stripe_account_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn('owner_profiles', 'stripe_onboarding_complete', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('owner_profiles', 'stripe_charges_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('owner_profiles', 'stripe_payouts_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('owner_profiles', 'stripe_details_submitted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('owner_profiles', 'total_earnings', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
    });

    await queryInterface.addColumn('owner_profiles', 'available_balance', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
    });

    await queryInterface.addColumn('owner_profiles', 'pending_balance', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
    });

    await queryInterface.addColumn('owner_profiles', 'total_withdrawn', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
    });
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('owner_profiles', 'stripe_account_id');
    await queryInterface.removeColumn('owner_profiles', 'stripe_onboarding_complete');
    await queryInterface.removeColumn('owner_profiles', 'stripe_charges_enabled');
    await queryInterface.removeColumn('owner_profiles', 'stripe_payouts_enabled');
    await queryInterface.removeColumn('owner_profiles', 'stripe_details_submitted');
    await queryInterface.removeColumn('owner_profiles', 'total_earnings');
    await queryInterface.removeColumn('owner_profiles', 'available_balance');
    await queryInterface.removeColumn('owner_profiles', 'pending_balance');
    await queryInterface.removeColumn('owner_profiles', 'total_withdrawn');
}
