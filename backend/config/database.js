const mongoose = require('mongoose');

/**
 * MongoDB connection configuration
 * Handles connection options based on mongoose version
 */

/**
 * Get connection options based on environment and mongoose version
 */
const getConnectionOptions = () => {
  const options = {
    // Core connection options (always needed)
    serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    bufferCommands: false, // Disable mongoose buffering - prevents timeout issues
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 5, // Maintain at least 5 socket connections
    maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
  };

  // Note: useNewUrlParser and useUnifiedTopology are deprecated in MongoDB Driver 4.0+
  // but included here as per user requirements
  if (process.env.INCLUDE_DEPRECATED_OPTIONS !== 'false') {
    options.useNewUrlParser = true;
    options.useUnifiedTopology = true;
  }

  return options;
};

/**
 * Connect to MongoDB with proper error handling
 */
const connectDatabase = async (uri) => {
  try {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/admin';
    
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 MongoDB URI: ${mongoUri.replace(/:\/\/.*@/, '://***:***@')}`); // Hide credentials
    
    const options = getConnectionOptions();
    console.log('⚙️  Connection options:', Object.keys(options).join(', '));
    
    const conn = await mongoose.connect(mongoUri, options);
    
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    console.log(`⚡ Connection ready state: ${conn.connection.readyState} (1 = connected)`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide specific error guidance
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Make sure MongoDB is running on your system:');
      console.error('   - Windows: Start MongoDB service or run `mongod`');
      console.error('   - macOS: Run `brew services start mongodb-community`');
      console.error('   - Linux: Run `sudo systemctl start mongod`');
      console.error('   - Docker: Run `docker run -d -p 27017:27017 --name mongodb mongo`');
    } else if (error.name === 'MongoNetworkError') {
      console.error('🌐 Network error - check firewall settings and MongoDB server status');
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('🔐 Authentication failed - check MongoDB credentials');
    }
    
    throw error; // Re-throw to be handled by caller
  }
};

/**
 * Setup MongoDB connection event handlers
 */
const setupConnectionEventHandlers = () => {
  mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB successfully');
    console.log(`📡 Database: ${mongoose.connection.name}`);
    console.log(`🖥️  Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    console.log(`⚡ Ready state: ${mongoose.connection.readyState} (1 = connected)`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
    if (err.name === 'MongoNetworkError') {
      console.error('🌐 Network error - check MongoDB server status');
    } else if (err.name === 'MongoServerSelectionError') {
      console.error('🔌 Server selection error - MongoDB may not be running');
    }
  });

  mongoose.connection.on('disconnected', () => {
    console.log('📡 Mongoose disconnected from MongoDB');
    console.log('🔄 Will attempt to reconnect automatically...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 Mongoose reconnected to MongoDB');
  });

  mongoose.connection.on('close', () => {
    console.log('🚪 Mongoose connection closed');
  });

  // Handle application termination
  process.on('SIGINT', async () => {
    console.log('\n🔄 Gracefully shutting down server...');
    
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
};

/**
 * Check if database connection is ready
 */
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get connection status information
 */
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
    isConnected: readyState === 1,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
};

module.exports = {
  connectDatabase,
  setupConnectionEventHandlers,
  isDatabaseConnected,
  getConnectionStatus,
  getConnectionOptions
};
