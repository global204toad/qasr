const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
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

// Initialize Passport
app.use(passport.initialize());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('✅ Connected to MongoDB');
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
      readyState: mongoose.connection.readyState
    },
    timestamp: new Date().toISOString()
  });
});

// Add request logging middleware (before routes)
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  next();
});

// Setup routes after DB connection
const setupRoutes = () => {
  console.log('🔗 Setting up API routes...');
  
  try {
    // Import and use route modules with error handling
    console.log('   📝 Loading auth routes...');
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    
    console.log('   📦 Loading products routes...');
    try {
      const productRoutes = require('./routes/products-simple');
      app.use('/api/products', productRoutes);
      console.log('   ✅ Simple products routes loaded successfully');
    } catch (error) {
      console.error('   ❌ Error loading products routes:', error.message);
      // Create a simple fallback route for testing
      app.get('/api/products', (req, res) => {
        res.json({
          success: true,
          data: [
            { id: 1, name: 'Test Product', price: 100 }
          ],
          pagination: {
            page: 1,
            totalPages: 1,
            total: 1
          }
        });
      });
      app.get('/api/products/categories', (req, res) => {
        res.json({
          success: true,
          data: [
            { name: 'Test Category', count: 1 }
          ]
        });
      });
      console.log('   ✅ Fallback products routes created');
    }
    
    console.log('   🛒 Loading cart routes...');
    const cartRoutes = require('./routes/cart');
    app.use('/api/cart', cartRoutes);
    
    console.log('   💳 Loading checkout routes...');
    const checkoutRoutes = require('./routes/checkout');
    app.use('/api/checkout', checkoutRoutes);
    
    console.log('   📋 Loading orders routes...');
    const orderRoutes = require('./routes/orders');
    app.use('/api/orders', orderRoutes);
    
    console.log('   ⚙️  Loading admin routes...');
    const adminRoutes = require('./routes/admin');
    app.use('/api/admin', adminRoutes);
    
    console.log('   💰 Loading payment routes...');
    const paymentRoutes = require('./routes/payment');
    app.use('/api/payment', paymentRoutes);
    
    console.log('✅ All routes configured successfully!');
    console.log('📍 Available endpoints:');
    console.log('   - GET  /api/health');
    console.log('   - POST /api/auth/login');
    console.log('   - POST /api/auth/register');
    console.log('   - GET  /api/auth/google');
    console.log('   - GET  /api/auth/facebook');
    console.log('   - GET  /api/products');
    console.log('   - GET  /api/products/categories');
    console.log('   - GET  /api/products/featured');
    console.log('   - GET  /api/products/:id');
    console.log('   - GET  /api/cart');
    console.log('   - POST /api/cart');
    console.log('   - POST /api/checkout');
    
    // 404 handler for undefined routes (MUST be after all route definitions)
    app.use('*', (req, res) => {
      console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
      res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
      });
    });
    
  } catch (error) {
    console.error('❌ Error setting up routes:', error);
    throw error;
  }
};

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
    // First connect to database
    const dbConnected = await connectDB();
    
    if (dbConnected) {
      // Setup routes after DB connection
      setupRoutes();
      
      // Start server
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
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
