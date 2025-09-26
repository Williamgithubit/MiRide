'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    try {
      // Check if the enum value already exists
      const result = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'Diesel' 
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_cars_fuel_type'
          )
        ) as exists;
      `, { type: Sequelize.QueryTypes.SELECT });

      if (!result[0].exists) {
        // Add 'Diesel' to the existing enum_cars_fuel_type
        await queryInterface.sequelize.query(`
          ALTER TYPE "enum_cars_fuel_type" ADD VALUE 'Diesel';
        `);
        console.log('Successfully added Diesel to fuel type enum');
      } else {
        console.log('Diesel already exists in fuel type enum');
      }
    } catch (error) {
      console.error('Error adding Diesel to fuel type enum:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type and updating all references
    console.log('Cannot remove enum value in PostgreSQL. Manual intervention required.');
  }
};
