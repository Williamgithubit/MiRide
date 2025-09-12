import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('basic_api', 'postgres', 'Tealobreeze~8', {
  host: '127.0.0.1',
  dialect: 'postgres',
  logging: console.log
});

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    const [results] = await sequelize.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public'`
    );
    
    console.log('Tables in database:');
    console.log(results);
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();
