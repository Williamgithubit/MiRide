export const up = async (queryInterface, Sequelize) => {
  // Add new notification types to the enum
  await queryInterface.sequelize.query(`
    ALTER TYPE "enum_notifications_type" 
    ADD VALUE IF NOT EXISTS 'booking_expired';
  `);
  
  await queryInterface.sequelize.query(`
    ALTER TYPE "enum_notifications_type" 
    ADD VALUE IF NOT EXISTS 'rental_expired';
  `);
};

export const down = async (queryInterface, Sequelize) => {
  // Note: PostgreSQL doesn't support removing enum values directly
  // You would need to recreate the enum type without these values
  // For now, we'll leave this as a no-op since removing enum values
  // can be complex and might affect existing data
  console.log('Rollback: Cannot remove enum values in PostgreSQL without recreating the type');
};
