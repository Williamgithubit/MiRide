'use strict';

export default {
  async up(queryInterface, Sequelize) {
    // Add test customers
    await queryInterface.bulkInsert('customers', [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '098-765-4321',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Add test cars
    await queryInterface.bulkInsert('cars', [
      {
        name: 'Toyota',
        model: 'Camry',
        year: 2023,
        rentalPricePerDay: 50.00,
        isAvailable: true,
        imageUrl: 'https://example.com/camry.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Honda',
        model: 'Civic',
        year: 2023,
        rentalPricePerDay: 45.00,
        isAvailable: true,
        imageUrl: 'https://example.com/civic.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rentals', null, {});
    await queryInterface.bulkDelete('cars', null, {});
    await queryInterface.bulkDelete('customers', null, {});
  }
};
