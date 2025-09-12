'use strict';

const carBrands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Nissan'];
const locations = ['Downtown', 'Airport', 'City Center', 'West Side', 'East End'];
const features = [
  ['Bluetooth', 'GPS', 'Backup Camera', 'Heated Seats'],
  ['Sunroof', 'Bluetooth', 'Navigation', 'Leather Seats'],
  ['Bluetooth', 'Keyless Entry', 'USB Ports', 'Rear AC Vents'],
  ['Premium Sound', 'Heated Steering', 'Parking Sensors', 'Lane Assist'],
  ['Autopilot', 'Large Touchscreen', 'Premium Sound', 'Keyless Entry']
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all existing cars
    const cars = await queryInterface.sequelize.query(
      'SELECT id, name, model FROM cars',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Update each car with new fields
    const updates = cars.map(car => {
      const brand = getRandomElement(carBrands);
      const carFeatures = [...new Set([...getRandomElement(features)])]; // Ensure unique features
      
      return queryInterface.bulkUpdate('cars', {
        brand,
        rating: (Math.random() * 5).toFixed(1),
        reviews: getRandomInt(5, 200),
        seats: getRandomInt(2, 8),
        fuel_type: getRandomElement(['Petrol', 'Electric', 'Hybrid']),
        location: getRandomElement(locations),
        features: carFeatures,
        is_liked: Math.random() > 0.5,
        is_available: true,
        image_url: `https://source.unsplash.com/random/300x200/?${encodeURIComponent(brand + ' ' + car.model || 'car')}`
      }, {
        id: car.id
      });
    });

    return Promise.all(updates);
  },

  async down(queryInterface, Sequelize) {
    // We'll just reset the new fields to their default values
    // The migration's down method will handle removing the columns
    return queryInterface.bulkUpdate('cars', {
      brand: null,
      rating: 4.5,
      reviews: 0,
      seats: 5,
      fuel_type: 'Petrol',
      location: 'Downtown',
      features: [],
      is_liked: false,
      is_available: true
    }, {});
  }
};
