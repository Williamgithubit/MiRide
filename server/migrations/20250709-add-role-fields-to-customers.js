'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    // Helper function to check if column exists
    const columnExists = async (tableName, columnName) => {
      try {
        const tableDescription = await queryInterface.describeTable(tableName);
        return !!tableDescription[columnName];
      } catch (error) {
        console.log(`Error checking if column ${columnName} exists:`, error.message);
        return false;
      }
    };

    // Add role ENUM type
    await queryInterface.sequelize.query(
      `CREATE TYPE enum_customers_role AS ENUM ('customer', 'owner', 'admin');`
    ).catch(error => {
      // Ignore if ENUM already exists
      console.log('ENUM type might already exist:', error.message);
    });
    
    // Add new columns
    return queryInterface.sequelize.transaction(async (transaction) => {
      try {
        // Make phone optional
        await queryInterface.changeColumn(
          'customers',
          'phone',
          {
            type: Sequelize.STRING,
            allowNull: true,
          },
          { transaction }
        ).catch(error => {
          console.log('Error changing phone column:', error.message);
        });
      } catch (error) {
        console.log('Error changing phone column:', error.message);
      }
      
      // Add role field if it doesn't exist
      if (!(await columnExists('customers', 'role'))) {
        await queryInterface.addColumn(
          'customers',
          'role',
          {
            type: Sequelize.ENUM('customer', 'owner', 'admin'),
            allowNull: false,
            defaultValue: 'customer',
          },
          { transaction }
        );
      }
      
      // Add isActive field if it doesn't exist
      if (!(await columnExists('customers', 'is_active'))) {
        await queryInterface.addColumn(
          'customers',
          'is_active',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          { transaction }
        );
      
      // Add imageUrl field if it doesn't exist
      if (!(await columnExists('customers', 'image_url'))) {
        await queryInterface.addColumn(
          'customers',
          'image_url',
          {
            type: Sequelize.STRING,
            allowNull: true,
          },
          { transaction }
        );
      }
      
      // Add lastLogin field if it doesn't exist
      if (!(await columnExists('customers', 'last_login'))) {
        await queryInterface.addColumn(
          'customers',
          'last_login',
          {
            type: Sequelize.DATE,
            allowNull: true,
          },
          { transaction }
        );
      }
      
      // Add address field if it doesn't exist
      if (!(await columnExists('customers', 'address'))) {
        await queryInterface.addColumn(
          'customers',
          'address',
          {
            type: Sequelize.STRING,
            allowNull: true,
          },
          { transaction }
        );
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Revert phone to required
      await queryInterface.changeColumn(
        'customers',
        'phone',
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
        { transaction }
      );
      
      // Remove added columns
      await queryInterface.removeColumn('customers', 'role', { transaction });
      await queryInterface.removeColumn('customers', 'is_active', { transaction });
      await queryInterface.removeColumn('customers', 'image_url', { transaction });
      await queryInterface.removeColumn('customers', 'last_login', { transaction });
      await queryInterface.removeColumn('customers', 'address', { transaction });
      
      // Drop ENUM type
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS enum_customers_role;`
      ).catch(error => {
        console.log('Error dropping ENUM type:', error.message);
      });
    });
  }
};
