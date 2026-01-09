const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch(err => console.error('❌ MongoDB error:', err));

// Health check
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isConnected ? 'OK' : 'ERROR',
    message: 'Server is running',
    database: {
      status: isConnected ? 'connected' : 'disconnected',
      name: mongoose.connection.name
    },
    timestamp: new Date().toISOString()
  });
});

// Get all products with pagination
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 GET /api/products - Query params:', req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    // Search by text
    if (req.query.q) {
      filter.$text = { $search: req.query.q };
    }

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by featured
    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    // Build sort object
    let sort = { createdAt: -1 };
    switch (req.query.sort) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'name_asc':
        sort = { name: 1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
    }

    console.log(`   📊 Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
    console.log(`   🔍 Filter:`, filter);

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    console.log(`   ✅ Found ${products.length} products out of ${total} total`);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get categories
app.get('/api/products/categories', async (req, res) => {
  try {
    console.log('🏷️  GET /api/products/categories');
    
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const formattedCategories = categories.map(cat => ({
      name: cat._id,
      count: cat.count
    }));

    console.log(`   ✅ Found ${formattedCategories.length} categories`);
    formattedCategories.forEach(cat => console.log(`      - ${cat.name}: ${cat.count} products`));

    res.status(200).json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get featured products
app.get('/api/products/featured', async (req, res) => {
  try {
    console.log('⭐ GET /api/products/featured');
    
    const limit = parseInt(req.query.limit) || 8;
    
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(limit)
      .lean();

    console.log(`   ✅ Found ${products.length} featured products`);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    console.log('📦 GET /api/products/:id - ID:', req.params.id);
    
    const product = await Product.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log(`   ✅ Found product: ${product.name}`);

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// 404 handler
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
      'GET /api/products/:id'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`🏷️  Categories: http://localhost:${PORT}/api/products/categories`);
  console.log(`⭐ Featured: http://localhost:${PORT}/api/products/featured`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});
