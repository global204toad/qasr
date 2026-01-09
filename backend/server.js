const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Load environment variables FIRST
require('dotenv').config();

const { connectDatabase, setupConnectionEventHandlers, isDatabaseConnected, getConnectionStatus } = require('./config/database');

// Verify environment variables are loaded
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Environment variables loaded:');
  console.log(`   PORT: ${process.env.PORT || 'default (5000)'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'default (development)'}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Using default'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST ? '✅ Set' : '❌ Missing'}`);
}

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    },
  },
}));

// Rate limiting - increased for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: Math.ceil(15 * 60) // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false
});

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.6:3000', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// No session or OAuth needed for email-only authentication

// Connect to MongoDB with improved error handling and connection management
const connectDB = async () => {
  try {
    // Use the centralized database connection function
    const conn = await connectDatabase();

    return conn;
  } catch (error) {
    // Exit process with failure - error details already logged by connectDatabase
    process.exit(1);
  }
};

// Middleware to check database connection before processing requests
const checkDBConnection = (req, res, next) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available. Please try again later.',
      error: 'SERVICE_UNAVAILABLE'
    });
  }
  next();
};

// Function to setup routes after DB connection is established
const setupRoutes = () => {
  console.log('🔗 Setting up API routes...');

  try {
    // Routes with database connection check
    app.use('/api/auth', checkDBConnection, authLimiter, require('./routes/auth'));
    app.use('/api/products', require('./routes/products-simple'));
    app.use('/api/cart', checkDBConnection, require('./routes/cart'));
    app.use('/api/checkout', checkDBConnection, require('./routes/checkout'));
    app.use('/api/orders', checkDBConnection, require('./routes/orders'));
    app.use('/api/admin', checkDBConnection, require('./routes/admin'));
    app.use('/api/payment', checkDBConnection, require('./routes/payment'));

    console.log('✅ API routes configured successfully');
    console.log('📍 Available routes:');
    console.log('   - POST /api/auth/send-code');
    console.log('   - POST /api/auth/verify-code');
    console.log('   - POST /api/auth/logout');
    console.log('   - GET /api/auth/me');
    console.log('   - PUT /api/auth/profile');
    console.log('   - GET /api/products');
    console.log('   - GET /api/products/categories');
    console.log('   - GET /api/products/featured');
    console.log('   - GET /api/cart');
    console.log('   - POST /api/cart');
    console.log('   - POST /api/checkout');
    console.log('   - GET /api/orders');
    console.log('   - GET /api/admin/dashboard');
    console.log('   - POST /api/payment/create-intent');
  } catch (error) {
    console.error('❌ Error setting up routes:', error);
    throw error;
  }
};

// Setup routes after function definition
setupRoutes();

// Health check endpoint with MongoDB status
app.get('/api/health', (req, res) => {
  const dbInfo = getConnectionStatus();

  res.json({
    status: dbInfo.isConnected ? 'OK' : 'WARNING',
    message: 'Server is running',
    database: {
      status: dbInfo.status,
      host: dbInfo.host,
      port: dbInfo.port,
      name: dbInfo.name,
      readyState: dbInfo.state
    },
    timestamp: new Date().toISOString()
  });
});

// Simple test route
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test route working',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // MongoDB connection errors
  if (err.name === 'MongooseError' || err.name === 'MongoError') {
    return res.status(503).json({
      success: false,
      message: 'Database service temporarily unavailable',
      error: 'DATABASE_ERROR'
    });
  }

  // Mongoose timeout errors
  if (err.name === 'MongooseServerSelectionError' || err.message?.includes('buffering timed out')) {
    return res.status(503).json({
      success: false,
      message: 'Database connection timeout. Please try again later.',
      error: 'DATABASE_TIMEOUT'
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Setup MongoDB connection event handlers
setupConnectionEventHandlers();

const PORT = process.env.PORT || 5000;

// Start server and connect to database
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Start the server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();
