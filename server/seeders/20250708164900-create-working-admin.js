const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await queryInterface.bulkInsert('Users', [
      {
        id: '11111111-1111-1111-1111-111111111111', // Fixed UUID for easy reference
        name: 'Admin User',
        email: 'admin@carental.com',
        phone: '+1234567890',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@carental.com');
    console.log('Password: admin123');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {
      email: 'admin@carental.com',
    }, {});
  },
};
