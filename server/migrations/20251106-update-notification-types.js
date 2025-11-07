'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // PostgreSQL requires a different approach to update ENUMs
    // We need to add new values to the existing ENUM type
    
    // First, check if we're using PostgreSQL
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'postgres') {
      // For PostgreSQL, we need to use raw SQL to add new ENUM values
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_notifications_type') THEN
            -- If the type doesn't exist, create it with all values
            CREATE TYPE enum_notifications_type AS ENUM (
              'booking_request', 
              'booking_approved', 
              'booking_rejected', 
              'booking_cancelled',
              'payment_received', 
              'payment_successful',
              'payment_failed',
              'rental_started', 
              'rental_completed',
              'customer_review',
              'system_alert',
              'maintenance_reminder',
              'system_message'
            );
          ELSE
            -- Add missing values if they don't exist
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'booking_cancelled' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_notifications_type')) THEN
              ALTER TYPE enum_notifications_type ADD VALUE 'booking_cancelled';
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'payment_successful' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_notifications_type')) THEN
              ALTER TYPE enum_notifications_type ADD VALUE 'payment_successful';
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'payment_failed' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_notifications_type')) THEN
              ALTER TYPE enum_notifications_type ADD VALUE 'payment_failed';
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'customer_review' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_notifications_type')) THEN
              ALTER TYPE enum_notifications_type ADD VALUE 'customer_review';
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'system_alert' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_notifications_type')) THEN
              ALTER TYPE enum_notifications_type ADD VALUE 'system_alert';
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'maintenance_reminder' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_notifications_type')) THEN
              ALTER TYPE enum_notifications_type ADD VALUE 'maintenance_reminder';
            END IF;
          END IF;
        END$$;
      `);
    } else {
      // For other databases (MySQL, SQLite, etc.), we can modify the column directly
      await queryInterface.changeColumn('notifications', 'type', {
        type: Sequelize.ENUM(
          'booking_request', 
          'booking_approved', 
          'booking_rejected', 
          'booking_cancelled',
          'payment_received', 
          'payment_successful',
          'payment_failed',
          'rental_started', 
          'rental_completed',
          'customer_review',
          'system_alert',
          'maintenance_reminder',
          'system_message'
        ),
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting ENUM changes is complex and risky
    // It's generally better to keep the new values
    // But if you really need to revert:
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect !== 'postgres') {
      await queryInterface.changeColumn('notifications', 'type', {
        type: Sequelize.ENUM(
          'booking_request', 
          'booking_approved', 
          'booking_rejected', 
          'payment_received', 
          'rental_started', 
          'rental_completed',
          'system_message'
        ),
        allowNull: false
      });
    }
    // For PostgreSQL, reverting ENUM values is not straightforward
    // and would require recreating the type and updating all references
  }
};
