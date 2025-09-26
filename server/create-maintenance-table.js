// Temporary script to create maintenance table
import db from './models/index.js';

async function createMaintenanceTable() {
  try {
    console.log('Checking if maintenance table exists...');
    
    // Try to sync the Maintenance model
    await db.Maintenance.sync({ force: false });
    console.log('✅ Maintenance table created/verified successfully');
    
    // Test the table by trying to fetch records
    const count = await db.Maintenance.count();
    console.log(`📊 Current maintenance records: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating maintenance table:', error);
    process.exit(1);
  }
}

createMaintenanceTable();
