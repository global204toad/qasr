const mongoose = require('mongoose');
const { getConnectionOptions } = require('../config/database');
require('dotenv').config();

/**
 * Database connection checker utility
 * Helps diagnose MongoDB connection issues
 */

const checkDatabaseConnection = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
  
  console.log('🔍 Database Connection Checker');
  console.log('================================');
  console.log(`📍 MongoDB URI: ${mongoUri}`);
  
  try {
    console.log('🔄 Testing connection...');
    
    const options = {
      ...getConnectionOptions(),
      serverSelectionTimeoutMS: 5000, // 5 second timeout for testing
    };
    
    const conn = await mongoose.connect(mongoUri, options);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`📊 Ready State: ${conn.connection.readyState} (1 = connected)`);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 Collection names:');
      collections.forEach(col => console.log(`   - ${col.name}`));
    } else {
      console.log('📋 No collections found (empty database)');
    }
    
    await mongoose.connection.close();
    console.log('✅ Connection test completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n💡 Troubleshooting steps:');
      console.error('1. Check if MongoDB is running:');
      console.error('   - Windows: Check Services or run `mongod`');
      console.error('   - macOS: Run `brew services start mongodb-community`');
      console.error('   - Linux: Run `sudo systemctl start mongod`');
      console.error('   - Docker: Run `docker run -d -p 27017:27017 --name mongodb mongo`');
      console.error('');
      console.error('2. Verify MongoDB is listening on the correct port:');
      console.error('   - Default port: 27017');
      console.error('   - Check with: `netstat -an | grep 27017`');
      console.error('');
      console.error('3. Check firewall settings');
      console.error('4. Verify the MongoDB URI is correct');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('\n💡 This usually means MongoDB is not running or not accessible');
    }
    
    return false;
  }
};

const getConnectionStatus = () => {
  const readyState = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: readyState,
    status: statusMap[readyState],
    isConnected: readyState === 1
  };
};

const waitForConnection = (timeoutMs = 30000) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Connection timeout after ${timeoutMs}ms`));
    }, timeoutMs);
    
    const checkConnection = () => {
      if (mongoose.connection.readyState === 1) {
        clearTimeout(timeout);
        resolve(true);
      } else {
        setTimeout(checkConnection, 100);
      }
    };
    
    checkConnection();
  });
};

// Run if called directly
if (require.main === module) {
  checkDatabaseConnection()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = {
  checkDatabaseConnection,
  getConnectionStatus,
  waitForConnection
};
