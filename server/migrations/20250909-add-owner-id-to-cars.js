'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    // Check if column exists before adding it
    const tableDescription = await queryInterface.describeTable('cars');
    
    if (!tableDescription.owner_id) {
      await queryInterface.addColumn('cars', 'owner_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('cars');
    
    if (tableDescription.owner_id) {
      await queryInterface.removeColumn('cars', 'owner_id');
    }
  }
};
