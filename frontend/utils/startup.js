const { checkDatabaseConnection } = require('./dbChecker');
const { seedDatabase } = require('./seedData');
const { getConnectionOptions } = require('../config/database');

/**
 * Startup utility to ensure database is ready before starting the server
 */

const ensureDatabaseReady = async () => {
  console.log('🚀 Starting application...');
  
  try {
    // Check if database is accessible
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      console.error('❌ Cannot start server: Database is not accessible');
      console.error('💡 Please ensure MongoDB is running and try again');
      process.exit(1);
    }
    
    // Optionally seed database if empty
    const mongoose = require('mongoose');
    const Product = require('../models/Product');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', getConnectionOptions());
    
    const productCount = await Product.countDocuments();
    
    if (productCount === 0) {
      console.log('📊 Database appears to be empty');
      console.log('💡 Consider running `npm run db:seed` to add sample data');
    } else {
      console.log(`📊 Database contains ${productCount} products`);
    }
    
    await mongoose.connection.close();
    console.log('✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Startup check failed:', error.message);
    process.exit(1);
  }
};

// Export for use in other modules
module.exports = { ensureDatabaseReady };

// Run if called directly
if (require.main === module) {
  ensureDatabaseReady();
}
