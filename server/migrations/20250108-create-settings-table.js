'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    // Create settings table
    await queryInterface.createTable('settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      value: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      category: {
        type: Sequelize.ENUM('platform', 'notification', 'security', 'system'),
        allowNull: false,
        defaultValue: 'platform',
      },
      description: {
        type: Sequelize.TEXT,
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

    // Add two_factor_enabled column to users table
    await queryInterface.addColumn('users', 'two_factor_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    // Add two_factor_secret column to users table
    await queryInterface.addColumn('users', 'two_factor_secret', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add last_login column to users table if not exists
    try {
      await queryInterface.addColumn('users', 'last_login', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    } catch (error) {
      // Column might already exist
      console.log('last_login column might already exist');
    }

    // Add last_login_ip column to users table
    await queryInterface.addColumn('users', 'last_login_ip', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Insert default platform settings
    const defaultSettings = [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        key: 'platform_config',
        value: JSON.stringify({
          companyName: 'MiRide Rental Service',
          companyLogo: null,
          defaultCurrency: 'USD',
          taxPercentage: 10,
          serviceFeePercentage: 15,
          supportEmail: 'support@miride.com',
          supportPhone: '+1 (555) 123-4567',
          companyAddress: '123 Main Street, City, Country',
          commissionRate: 15,
          minBookingDuration: 1,
          maxBookingDuration: 30,
          cancellationPolicyHours: 24,
          lateFeePercentage: 10,
        }),
        category: 'platform',
        description: 'Platform-wide configuration settings',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        key: 'notification_preferences',
        value: JSON.stringify({
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          inAppNotifications: true,
          newBookings: true,
          ownerRegistrations: true,
          paymentConfirmations: true,
          systemUpdates: true,
        }),
        category: 'notification',
        description: 'Admin notification preferences',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        key: 'system_controls',
        value: JSON.stringify({
          maintenanceMode: false,
          systemVersion: 'v1.0.0',
          apiHealthStatus: 'healthy',
          uptime: '0d 0h 0m',
          lastBackup: null,
        }),
        category: 'system',
        description: 'System control settings',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    for (const setting of defaultSettings) {
      await queryInterface.sequelize.query(`
        INSERT INTO settings (id, key, value, category, description, created_at, updated_at)
        VALUES (gen_random_uuid(), '${setting.key}', '${setting.value}'::jsonb, '${setting.category}', '${setting.description}', NOW(), NOW())
        ON CONFLICT (key) DO NOTHING
      `);
    }
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('settings');
    await queryInterface.removeColumn('users', 'two_factor_enabled');
    await queryInterface.removeColumn('users', 'two_factor_secret');
    await queryInterface.removeColumn('users', 'last_login_ip');
}
