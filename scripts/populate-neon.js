const { initializeDatabase } = require('../lib/database-postgres');

async function populateNeonDatabase() {
  try {
    console.log('Initializing Neon PostgreSQL database...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully with tables and sample data');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

populateNeonDatabase();