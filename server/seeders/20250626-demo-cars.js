'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Cars', [
      {
        name: 'Toyota',
        model: 'Camry',
        year: 2024,
        rental_price_per_day: 75.00,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date(),
        image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'
      },
      {
        name: 'Honda',
        model: 'Civic',
        year: 2024,
        rental_price_per_day: 65.00,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date(),
        image_url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800'
      },
      {
        name: 'Tesla',
        model: 'Model 3',
        year: 2024,
        rental_price_per_day: 120.00,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date(),
        image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800'
      },
      {
        name: 'BMW',
        model: '3 Series',
        year: 2024,
        rental_price_per_day: 110.00,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date(),
        image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Cars', null, {});
  }
};
