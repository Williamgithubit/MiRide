'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      rental_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rentals',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      stripe_payment_intent_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      stripe_account_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      platform_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      owner_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'usd',
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'processing', 'succeeded', 'failed', 'refunded'),
        defaultValue: 'pending',
        allowNull: false,
      },
      payout_status: {
        type: Sequelize.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending',
        allowNull: false,
      },
      stripe_transfer_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('payments', ['rental_id']);
    await queryInterface.addIndex('payments', ['owner_id']);
    await queryInterface.addIndex('payments', ['customer_id']);
    await queryInterface.addIndex('payments', ['stripe_payment_intent_id']);
    await queryInterface.addIndex('payments', ['payment_status']);
    await queryInterface.addIndex('payments', ['payout_status']);
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
}
