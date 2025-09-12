'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Customers', [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        created_at: new Date(),
        updated_at: new Date(),
        password: 'password123'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '234-567-8901',
        created_at: new Date(),
        updated_at: new Date(),
        password: 'password123'
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '345-678-9012',
        created_at: new Date(),
        updated_at: new Date(),
        password: 'password123'
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Customers', null, {});
  }
};
