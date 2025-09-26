import db from './models/index.js';

async function checkAndFixUserRole() {
  try {
    console.log('🔍 Checking user roles...');
    
    // Get all users
    const users = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isActive']
    });
    
    console.log('\n📋 Current Users:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
    });
    
    // Check if we have any users with 'customer' role
    const customers = users.filter(user => user.role === 'customer');
    const owners = users.filter(user => user.role === 'owner');
    const admins = users.filter(user => user.role === 'admin');
    
    console.log(`\n📊 Role Distribution:`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Owners: ${owners.length}`);
    console.log(`- Admins: ${admins.length}`);
    
    // If there are users but no customers, let's check what roles they have
    if (users.length > 0 && customers.length === 0) {
      console.log('\n⚠️  No customers found! This might be causing the 403 error.');
      console.log('Current user roles:', users.map(u => u.role));
      
      // Find the first user and check their role
      const firstUser = users[0];
      console.log(`\n🔧 First user (${firstUser.email}) has role: ${firstUser.role}`);
      
      if (firstUser.role !== 'customer') {
        console.log(`\n💡 This user needs 'customer' role to access customer rental endpoints.`);
        console.log(`Would you like to update ${firstUser.email} to have 'customer' role? (This script will do it)`);
        
        // Update the user's role to customer
        await db.User.update(
          { role: 'customer' },
          { where: { id: firstUser.id } }
        );
        
        console.log(`✅ Updated ${firstUser.email} role from '${firstUser.role}' to 'customer'`);
        
        // Verify the update
        const updatedUser = await db.User.findByPk(firstUser.id);
        console.log(`✅ Verification: ${updatedUser.email} now has role: ${updatedUser.role}`);
      }
    }
    
    // Also check for any rentals to see what's expected
    const rentalCount = await db.Rental.count();
    console.log(`\n📊 Total rentals in database: ${rentalCount}`);
    
    if (rentalCount > 0) {
      const sampleRentals = await db.Rental.findAll({
        limit: 3,
        include: [
          { model: db.User, as: 'customer', attributes: ['id', 'name', 'email', 'role'] },
          { model: db.Car, attributes: ['id', 'brand', 'model'] }
        ]
      });
      
      console.log('\n📋 Sample Rentals:');
      sampleRentals.forEach(rental => {
        console.log(`- Rental ID: ${rental.id}, Customer: ${rental.customer?.name} (${rental.customer?.email}), Role: ${rental.customer?.role}, Car: ${rental.Car?.brand} ${rental.Car?.model}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking user roles:', error);
  } finally {
    await db.sequelize.close();
  }
}

checkAndFixUserRole();
