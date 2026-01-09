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

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running', timestamp: new Date() });
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 GET /api/products - Fetching products...');
    const products = await Product.find({ isActive: true }).limit(20);
    console.log(`   Found ${products.length} products`);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: 1,
        total: products.length,
        totalPages: 1
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
    console.log('🏷️  GET /api/products/categories - Fetching categories...');
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const formattedCategories = categories.map(cat => ({
      name: cat._id,
      count: cat.count
    }));
    
    console.log(`   Found ${formattedCategories.length} categories:`, formattedCategories.map(c => c.name));
    
    res.json({
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
    console.log('⭐ GET /api/products/featured - Fetching featured products...');
    const products = await Product.find({ isActive: true, isFeatured: true }).limit(8);
    console.log(`   Found ${products.length} featured products`);
    
    res.json({
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

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`🏷️  Categories: http://localhost:${PORT}/api/products/categories`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});
