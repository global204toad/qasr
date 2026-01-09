const express = require('express');
const Product = require('../models/Product');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const { 
  validateProduct, 
  validateObjectId,
  validatePagination,
  validateSearch,
  handleValidationErrors,
  sanitizeInput 
} = require('../middleware/validation');

const router = express.Router();

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
router.get('/', [
  ...validatePagination,
  ...validateSearch,
  handleValidationErrors
], async (req, res, next) => {
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

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
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

    // Filter by brand
    if (req.query.brand) {
      filter.brand = new RegExp(req.query.brand, 'i');
    }

    // Filter by tags
    if (req.query.tags) {
      const tags = req.query.tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tags };
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
        // If searching, sort by text score, otherwise by creation date
        sort = req.query.q ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
    }

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name')
      .lean();

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
    next(error);
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.findFeatured()
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(limit)
      .populate('createdBy', 'name')
      .lean();

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo'
      }},
      { $unwind: '$categoryInfo' },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: categories.map(cat => ({
        _id: cat._id,
        name: cat.categoryInfo.name,
        count: cat.count,
        description: cat.categoryInfo.description
      }))
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', [
  ...validateObjectId('id'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('createdBy', 'name email');

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
    next(error);
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', [
  protect,
  restrictTo('admin'),
  sanitizeInput,
  ...validateProduct,
  handleValidationErrors
], async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const product = await Product.create(req.body);

    // Populate creator info
    await product.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', [
  protect,
  restrictTo('admin'),
  ...validateObjectId('id'),
  sanitizeInput,
  ...validateProduct,
  handleValidationErrors
], async (req, res, next) => {
  try {
    // Add updater to req.body
    req.body.updatedBy = req.user.id;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy updatedBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', [
  protect,
  restrictTo('admin'),
  ...validateObjectId('id'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false,
        updatedBy: req.user.id
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update product inventory
// @route   PATCH /api/products/:id/inventory
// @access  Private/Admin
router.patch('/:id/inventory', [
  protect,
  restrictTo('admin'),
  ...validateObjectId('id'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { quantity, operation = 'set' } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update inventory based on operation
    switch (operation) {
      case 'set':
        product.inventory.quantity = quantity;
        break;
      case 'add':
        product.inventory.quantity += quantity;
        break;
      case 'subtract':
        product.inventory.quantity = Math.max(0, product.inventory.quantity - quantity);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation. Use "set", "add", or "subtract"'
        });
    }

    product.updatedBy = req.user.id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        productId: product._id,
        newQuantity: product.inventory.quantity
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Toggle product featured status
// @route   PATCH /api/products/:id/featured
// @access  Private/Admin
router.patch('/:id/featured', [
  protect,
  restrictTo('admin'),
  ...validateObjectId('id'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isFeatured = !product.isFeatured;
    product.updatedBy = req.user.id;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: {
        productId: product._id,
        isFeatured: product.isFeatured
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
