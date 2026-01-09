const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const router = express.Router();

// @desc    Get all products with pagination
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    // Search by text
    if (req.query.q) {
      filter.$text = { $search: req.query.q };
    }

    // Filter by category (can be category name or ID)
    if (req.query.category) {
      // Try to find category by name or slug first
      let category = await Category.findOne({
        $or: [
          { name: req.query.category },
          { slug: req.query.category }
        ],
        isActive: true
      });
      
      // If not found by name/slug, try as ObjectId (for direct ID queries)
      if (!category && mongoose.Types.ObjectId.isValid(req.query.category)) {
        category = await Category.findOne({
          _id: req.query.category,
          isActive: true
        });
      }
      
      if (category) {
        filter.category = category._id;
      }
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Filter by featured
    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    // Build sort object
    let sort = {};
    
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
      case 'name_desc':
        sort = { name: -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      default:
        sort = req.query.q ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
    }

    // Execute query with Nuts category priority
    let products;
    
    // If no specific category filter and no search query, prioritize Nuts category
    if (!req.query.category && !req.query.q) {
      // First, get Nuts category ID
      const nutsCategory = await Category.findOne({ 
        name: 'Nuts', 
        isActive: true 
      });
      
      if (nutsCategory) {
        // Get Nuts products first
        const nutsFilter = { ...filter, category: nutsCategory._id };
        const nutsProducts = await Product.find(nutsFilter)
          .sort(sort)
          .populate('category', 'name slug')
          .populate('subcategory', 'name slug')
          .populate('createdBy', 'name')
          .lean();
        
        // Get non-Nuts products
        const nonNutsFilter = { ...filter, category: { $ne: nutsCategory._id } };
        const nonNutsProducts = await Product.find(nonNutsFilter)
          .sort(sort)
          .populate('category', 'name slug')
          .populate('subcategory', 'name slug')
          .populate('createdBy', 'name')
          .lean();
        
        // Combine with Nuts first
        const allProducts = [...nutsProducts, ...nonNutsProducts];
        
        // Apply pagination to the combined results
        products = allProducts.slice(skip, skip + limit);
      } else {
        // Fallback to normal query if Nuts category not found
        products = await Product.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('category', 'name slug')
          .populate('subcategory', 'name slug')
          .populate('createdBy', 'name')
          .lean();
      }
    } else {
      // Use normal query for category-specific or search queries
      products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .populate('createdBy', 'name')
        .lean();
    }

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Products route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;

    // Define the specific products to feature
    const featuredProductNames = [
      "A Camel's Eye",
      "Mix Nuts Power", 
      "Cashew",
      "Hazelnut"
    ];

    // Get the specific featured products
    const products = await Product.find({ 
      isActive: true,
      name: { $in: featuredProductNames }
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('createdBy', 'name')
      .lean();

    // Sort products in the specified order
    const sortedProducts = featuredProductNames.map(name => 
      products.find(p => p.name === name)
    ).filter(Boolean);

    res.status(200).json({
      success: true,
      data: sortedProducts.slice(0, limit)
    });
  } catch (error) {
    console.error('Featured products route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    // Get all active categories with their hierarchy
    const categories = await Category.find({ 
      isActive: true
    })
    .sort({ sortOrder: 1, name: 1 })
    .populate('parent', 'name slug')
    .lean();

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({
          category: category._id,
          isActive: true
        });
        
        return {
          _id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          count: count,
          sortOrder: category.sortOrder,
          parent: category.parent ? {
            _id: category.parent._id,
            name: category.parent.name,
            slug: category.parent.slug
          } : null
        };
      })
    );

    // Sort by sortOrder first, then by count descending
    categoriesWithCounts.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return b.count - a.count;
    });

    res.status(200).json({
      success: true,
      data: categoriesWithCounts
    });
  } catch (error) {
    console.error('Categories route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      isActive: true 
    })
    .populate('category', 'name slug description')
    .populate('subcategory', 'name slug description')
    .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Single product route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

module.exports = router;
