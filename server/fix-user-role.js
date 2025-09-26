import db from './models/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Script to update user role from 'customer' to 'owner'
const fixUserRole = async () => {
  try {
    console.log('🔍 Looking for users to update...');
    
    // Find all users with 'customer' role
    const customers = await db.User.findAll({
      where: { role: 'customer' },
      attributes: ['id', 'name', 'email', 'role']
    });
    
    console.log(`Found ${customers.length} customer(s):`);
    customers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    if (customers.length === 0) {
      console.log('❌ No customers found to update');
      process.exit(0);
    }
    
    // Update the first customer to be an owner (or you can specify a particular email)
    const userToUpdate = customers[0]; // Change this if you want a specific user
    
    console.log(`\n🔄 Updating user: ${userToUpdate.name} (${userToUpdate.email})`);
    console.log(`   From role: '${userToUpdate.role}' → To role: 'owner'`);
    
    await db.User.update(
      { role: 'owner' },
      { where: { id: userToUpdate.id } }
    );
    
    // Verify the update
    const updatedUser = await db.User.findByPk(userToUpdate.id);
    console.log(`✅ Successfully updated! New role: '${updatedUser.role}'`);
    
    console.log('\n🎉 User role updated successfully!');
    console.log('You can now access the Owner Dashboard with this user account.');
    
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
};

// Run the script
fixUserRole();
