const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { 
  validateObjectId,
  handleValidationErrors,
  sanitizeInput 
} = require('../middleware/validation');

const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const cart = await Cart.getCartWithProducts(req.user.id);
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          user: req.user.id,
          items: [],
          totalAmount: 0,
          totalItems: 0
        }
      });
    }

    // Filter out items with invalid products (products that were deleted)
    const validItems = cart.items.filter(item => item.product);
    
    if (validItems.length !== cart.items.length) {
      // Some products were deleted, update cart
      await Cart.findByIdAndUpdate(cart._id, { 
        items: validItems,
        $unset: { __v: 1 }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...cart,
        items: validItems
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', [
  protect,
  sanitizeInput
], async (req, res, next) => {
  try {
    const { productId, quantity = 1, weightOption } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ 
      _id: productId, 
      isActive: true 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    // Validate weight option if provided
    let selectedWeightOption = null;
    if (weightOption) {
      if (!product.weightOptions || product.weightOptions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'This product does not have weight options'
        });
      }
      
      selectedWeightOption = product.weightOptions.find(
        opt => opt.grams === weightOption.grams || opt.label === weightOption.label
      );
      
      if (!selectedWeightOption) {
        return res.status(400).json({
          success: false,
          message: 'Invalid weight option selected'
        });
      }
    }

    // Use weight option price if provided, otherwise use product base price
    const itemPrice = selectedWeightOption?.price || product.price;

    // Check inventory if tracking is enabled
    if (product.inventory?.trackQuantity) {
      if (product.inventory.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.inventory.quantity} items available in stock`
        });
      }
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({ 
        user: req.user.id,
        items: []
      });
    }

    // Check if item already exists in cart for inventory validation
    // For weight-based items, check both product and weight
    const existingItem = cart.items.find(item => {
      const sameProduct = item.product.toString() === productId.toString();
      if (selectedWeightOption) {
        const sameWeight = item.weightOption && 
          item.weightOption.grams === selectedWeightOption.grams;
        return sameProduct && sameWeight;
      }
      return sameProduct && !item.weightOption;
    });
    
    const newTotalQuantity = (existingItem?.quantity || 0) + quantity;
    
    if (product.inventory?.trackQuantity && product.inventory.quantity < newTotalQuantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${quantity} items. Only ${product.inventory.quantity - (existingItem?.quantity || 0)} more available.`
      });
    }

    // Add item to cart with weight option if provided
    await cart.addItem(productId, quantity, itemPrice, selectedWeightOption);

    // Get updated cart with product details
    const updatedCart = await Cart.getCartWithProducts(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
router.put('/:productId', [
  protect,
  ...validateObjectId('productId'),
  sanitizeInput,
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // If quantity is 0, remove item
    if (quantity === 0) {
      await cart.removeItem(productId);
    } else {
      // Check product inventory if updating to a higher quantity
      const product = await Product.findOne({ 
        _id: productId, 
        isActive: true 
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or inactive'
        });
      }

      if (product.inventory?.trackQuantity && product.inventory.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.inventory.quantity} items available in stock`
        });
      }

      await cart.updateItemQuantity(productId, quantity);
    }

    // Get updated cart
    const updatedCart = await Cart.getCartWithProducts(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
router.delete('/:productId', [
  protect,
  ...validateObjectId('productId'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.removeItem(productId);

    // Get updated cart
    const updatedCart = await Cart.getCartWithProducts(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res, next) => {
  try {
    await Cart.clearUserCart(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        user: req.user.id,
        items: [],
        totalAmount: 0,
        totalItems: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
