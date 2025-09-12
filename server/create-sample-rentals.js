import db from './models/index.js';

async function createSampleRentals() {
  try {
    console.log('Creating sample rental data...');
    
    // Get existing users and cars
    const users = await db.User.findAll({ limit: 5 });
    const cars = await db.Car.findAll({ limit: 10 });
    
    if (users.length === 0) {
      console.log('No users found. Creating sample users...');
      const sampleUsers = await db.User.bulkCreate([
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: '$2b$10$hashedpassword1',
          role: 'customer'
        },
        {
          name: 'Jane Smith', 
          email: 'jane@example.com',
          password: '$2b$10$hashedpassword2',
          role: 'customer'
        },
        {
          name: 'Mike Johnson',
          email: 'mike@example.com', 
          password: '$2b$10$hashedpassword3',
          role: 'owner'
        }
      ]);
      users.push(...sampleUsers);
    }
    
    if (cars.length === 0) {
      console.log('No cars found. Creating sample cars...');
      const sampleCars = await db.Car.bulkCreate([
        {
          name: 'Toyota Camry',
          model: 'Camry',
          brand: 'Toyota',
          year: 2023,
          rentalPricePerDay: 50.00,
          isAvailable: true,
          ownerId: users[2]?.id || users[0]?.id
        },
        {
          name: 'Honda Civic',
          model: 'Civic', 
          brand: 'Honda',
          year: 2022,
          rentalPricePerDay: 45.00,
          isAvailable: true,
          ownerId: users[2]?.id || users[0]?.id
        }
      ]);
      cars.push(...sampleCars);
    }
    
    console.log(`Found ${users.length} users and ${cars.length} cars`);
    
    // Create sample rentals
    const rentals = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - Math.floor(Math.random() * 180)); // Random date in past 6 months
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days rental
      
      const car = cars[Math.floor(Math.random() * cars.length)];
      const customer = users[Math.floor(Math.random() * users.length)];
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const totalCost = days * (car.rentalPricePerDay || 50);

      rentals.push({
        carId: car.id,
        customerId: customer.id,
        startDate: startDate,
        endDate: endDate,
        totalCost: totalCost
      });
    }

    const createdRentals = await db.Rental.bulkCreate(rentals);
    console.log(`Created ${createdRentals.length} sample rentals`);
    
    // Verify the data
    const totalRentals = await db.Rental.count();
    console.log(`Total rentals in database: ${totalRentals}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample rentals:', error);
    process.exit(1);
  }
}

createSampleRentals();
