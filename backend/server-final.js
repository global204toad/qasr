const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

// Health check route (always available)
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isConnected ? 'OK' : 'ERROR',
    message: 'Server is running',
    database: {
      status: isConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name
    },
    timestamp: new Date().toISOString()
  });
});

// Setup routes
const setupRoutes = () => {
  console.log('🔗 Setting up API routes...');
  
  try {
    // Import and mount routes
    const productRoutes = require('./routes/productRoutes');
    const authRoutes = require('./routes/auth');
    
    // Mount routes with explicit logging
    console.log('   📦 Mounting product routes on /api...');
    app.use('/api', productRoutes);  // This handles /api/products, /api/products/categories, etc.
    
    console.log('   🔐 Mounting auth routes on /api/auth...');
    app.use('/api/auth', authRoutes);
    
    // Add cart and checkout routes if they exist
    try {
      const cartRoutes = require('./routes/cart');
      const checkoutRoutes = require('./routes/checkout');
      app.use('/api/cart', cartRoutes);
      app.use('/api/checkout', checkoutRoutes);
      console.log('   🛒 Cart and checkout routes loaded');
    } catch (e) {
      console.log('   ⚠️  Cart/checkout routes not found, skipping...');
    }
    
    // Add admin and other routes if they exist
    try {
      const adminRoutes = require('./routes/admin');
      const orderRoutes = require('./routes/orders');
      const paymentRoutes = require('./routes/payment');
      app.use('/api/admin', adminRoutes);
      app.use('/api/orders', orderRoutes);
      app.use('/api/payment', paymentRoutes);
      console.log('   ⚙️  Admin, orders, and payment routes loaded');
    } catch (e) {
      console.log('   ⚠️  Admin/orders/payment routes not found, skipping...');
    }
    
    console.log('✅ All available routes configured successfully!');
    console.log('📍 Core endpoints:');
    console.log('   - GET  /api/health');
    console.log('   - GET  /api/products?page=1&limit=12');
    console.log('   - GET  /api/products/categories');
    console.log('   - GET  /api/products/featured');
    console.log('   - GET  /api/products/:id');
    console.log('   - POST /api/auth/login');
    console.log('   - POST /api/auth/register');
    
  } catch (error) {
    console.error('❌ Error setting up routes:', error);
    throw error;
  }
};

// 404 handler for undefined routes
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /api/health',
      'GET /api/products',
      'GET /api/products/categories',
      'GET /api/products/featured',
      'POST /api/auth/login',
      'POST /api/auth/register'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    const dbConnected = await connectDB();
    
    if (dbConnected) {
      // Setup routes after DB connection
      setupRoutes();
      
      // Start server
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
        console.log(`🏷️  Categories API: http://localhost:${PORT}/api/products/categories`);
        console.log(`📱 Frontend URL: http://localhost:3000`);
      });
    } else {
      console.error('❌ Failed to connect to database. Server not started.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer();
